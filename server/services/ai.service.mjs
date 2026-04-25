/**
 * Local AI: Ollama (chat + embeddings) + Qdrant (RAG). No OpenAI.
 * Env: OLLAMA_URL, QDRANT_URL, QDRANT_API_KEY (optional)
 */
import { QdrantClient } from "@qdrant/js-client-rest";
import { createRequire } from "module";
import crypto from "crypto";

const require = createRequire(import.meta.url);

let _qdrant = null;

export function getQdrantUrl() {
  return (process.env.QDRANT_URL || "http://127.0.0.1:6333").replace(/\/$/, "");
}

export function getQdrantClient() {
  if (!_qdrant) {
    console.log("QDRANT URL (env):", process.env.QDRANT_URL);
    const url = getQdrantUrl();
    console.log("QDRANT URL:", url);
    _qdrant = new QdrantClient({
      url,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
  }
  return _qdrant;
}

/** Ollama HTTP API base — only `OLLAMA_URL` (aligned with ecosystem.config.cjs default). */
export function getOllamaBase(_assistant) {
  return (process.env.OLLAMA_URL || "http://188.124.55.89:11434").replace(/\/$/, "");
}

export function collectionNameForAssistant(assistantId) {
  const safe = assistantId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `kb_${safe}`.slice(0, 200);
}

/** 10s timeout for Ollama /api/embeddings (undici AbortSignal.timeout in Node 18+). */
function embeddingFetchSignal() {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(10_000);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), 10_000);
  return c.signal;
}

/**
 * @param {string} ollamaBase
 * @param {string} embedModel e.g. nomic-embed-text
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function createEmbedding(ollamaBase, embedModel, text) {
  console.log("OLLAMA BASE:", ollamaBase);
  try {
    const r = await fetch(`${ollamaBase}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: embedModel,
        prompt: text.slice(0, 8000),
      }),
      signal: embeddingFetchSignal(),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg =
        typeof json.error === "string"
          ? json.error
          : json.error?.message || r.statusText || "Embedding failed";
      throw new Error(`Embedding HTTP ${r.status}: ${msg}`);
    }
    const embedding = json.embedding;
    if (!Array.isArray(embedding) || !embedding.length) {
      throw new Error(`Invalid embedding response from Ollama (keys: ${Object.keys(json).join(",")})`);
    }
    return embedding;
  } catch (e) {
    console.error("EMBED ERROR:", e?.cause ?? e);
    throw e;
  }
}

export async function createOpenAiCompatibleEmbedding({ baseUrl, apiKey, model, text }) {
  const base = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const r = await fetch(`${base}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "text-embedding-3-small",
      input: String(text || "").slice(0, 8000),
    }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(typeof json?.error?.message === "string" ? json.error.message : json?.error || "Embedding upstream failed");
  }
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb) || !emb.length) {
    throw new Error("Invalid embedding response from OpenAI-compatible provider");
  }
  return emb;
}

/**
 * @param {import('@qdrant/js-client-rest').QdrantClient} client
 * @param {string} name
 * @param {number[]} sampleVector — use first embedding to set size
 */
export async function ensureCollection(client, name, sampleVector) {
  const size = sampleVector.length;
  try {
    await client.getCollection(name);
  } catch {
    await client.createCollection(name, {
      vectors: { size, distance: "Cosine" },
    });
  }
}

/**
 * @param {import('@qdrant/js-client-rest').QdrantClient} client
 * @param {string} collectionName
 * @param {number[]} queryVector
 * @param {number} [topK=5]
 */
export async function searchContext(client, collectionName, queryVector, topK = 5) {
  const res = await client.search(collectionName, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });
  return (res || []).map((p) => ({
    text: typeof p.payload?.text === "string" ? p.payload.text : "",
    score: p.score,
    source: p.payload?.source,
  }));
}

/**
 * @param {string} ollamaBase
 * @param {string} chatModel
 * @param {Array<{ role: string; content: string }>} messages — Ollama chat format
 * @param {{ temperature?: number }} [opts]
 */
export async function generateResponse(ollamaBase, chatModel, messages, opts = {}) {
  const body = {
    model: chatModel,
    messages,
    stream: false,
  };
  if (opts.temperature != null && Number.isFinite(opts.temperature)) {
    body.options = { temperature: opts.temperature };
  }
  const fullPrompt = JSON.stringify({ model: chatModel, messages });
  console.log("FINAL PROMPT:", fullPrompt.length > 12000 ? `${fullPrompt.slice(0, 12000)}…[truncated]` : fullPrompt);
  const start = Date.now();
  const r = await fetch(`${ollamaBase}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log("OLLAMA TIME:", Date.now() - start);
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(typeof json.error === "string" ? json.error : json.error?.message || r.statusText || "Ollama chat failed");
  }
  const text = json.message?.content ?? "";
  const promptEvalCount = Number(json.prompt_eval_count ?? 0) || 0;
  const evalCount = Number(json.eval_count ?? 0) || 0;
  return {
    text: typeof text === "string" ? text : "",
    promptTokens: promptEvalCount,
    completionTokens: evalCount,
  };
}

/** Default RAG chunking: ~800 chars, ~80 overlap (tunable 500–1000 / 50–100). */
const RAG_MAX_CHUNK = 800;
const RAG_OVERLAP = 80;

/** Split on sentence boundaries (Latin + Cyrillic punctuation). */
function splitIntoSentences(block) {
  const s = block.trim();
  if (!s) return [];
  const parts = s.split(/(?<=[.!?…])\s+/u).filter((p) => p.trim());
  return parts.length ? parts : [s];
}

/**
 * Length-based split with overlap. Stops correctly when the last slice reaches EOF
 * (avoids advancing by ~1 char when the whole text fits in one window — the old bug).
 */
function splitLongByLength(text, maxSize, overlap) {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  if (t.length <= maxSize) return [t];
  const chunks = [];
  let start = 0;
  while (start < t.length) {
    let end = Math.min(start + maxSize, t.length);
    if (end < t.length) {
      const window = t.slice(start, end);
      const relBreak = Math.max(
        window.lastIndexOf("\n\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf(" "),
      );
      if (relBreak > maxSize * 0.35) {
        end = start + relBreak + 1;
      }
    }
    const piece = t.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= t.length) break;
    const nextStart = end - overlap;
    start = nextStart > start ? nextStart : start + 1;
  }
  return chunks;
}

/** Merge consecutive short strings until each is at most maxSize (separator within paragraph). */
function mergeListUpTo(items, maxSize, sep, overlap) {
  const out = [];
  let buf = "";
  for (const raw of items) {
    const it = raw.trim();
    if (!it) continue;
    if (it.length > maxSize) {
      if (buf) {
        out.push(buf);
        buf = "";
      }
      out.push(...splitLongByLength(it, maxSize, overlap));
      continue;
    }
    if (!buf) {
      buf = it;
    } else if (buf.length + sep.length + it.length <= maxSize) {
      buf += sep + it;
    } else {
      out.push(buf);
      buf = it;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** Merge paragraph-level chunks with blank line between blocks without exceeding maxSize. */
function mergeParagraphChunks(chunks, maxSize) {
  const out = [];
  let buf = "";
  const sep = "\n\n";
  for (const c of chunks) {
    const cc = c.trim();
    if (!cc) continue;
    if (!buf) {
      buf = cc;
    } else if (buf.length + sep.length + cc.length <= maxSize) {
      buf += sep + cc;
    } else {
      out.push(buf);
      buf = cc;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/**
 * Split text for RAG: paragraphs → sentences → length fallback.
 * Logs input size and resulting chunk count.
 */
export function chunkText(text, maxChunkSize = RAG_MAX_CHUNK, overlap = RAG_OVERLAP) {
  console.log("TEXT LENGTH:", (text ?? "").length);
  const normalized = (text ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    console.log("CHUNKS:", 0);
    return [];
  }

  const paragraphs = normalized.split(/\n\s*\n+/u).map((p) => p.trim()).filter(Boolean);
  const perParagraph = [];

  for (const para of paragraphs) {
    if (para.length <= maxChunkSize) {
      perParagraph.push(para);
      continue;
    }
    const sentences = splitIntoSentences(para);
    if (sentences.length <= 1) {
      perParagraph.push(...splitLongByLength(para, maxChunkSize, overlap));
      continue;
    }
    const mergedSentences = mergeListUpTo(sentences, maxChunkSize, " ", overlap);
    for (const m of mergedSentences) {
      if (m.length <= maxChunkSize) {
        perParagraph.push(m);
      } else {
        perParagraph.push(...splitLongByLength(m, maxChunkSize, overlap));
      }
    }
  }

  const merged = mergeParagraphChunks(perParagraph, maxChunkSize);
  console.log("CHUNKS:", merged.length);
  return merged;
}

async function pdfToText(buffer) {
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

export async function extractTextFromFile(buffer, mime, originalname = "") {
  const m = (mime || "").toLowerCase();
  const ext = (originalname.split(".").pop() || "").toLowerCase();
  if (m.includes("pdf") || ext === "pdf") {
    return pdfToText(buffer);
  }
  if (m.includes("wordprocessingml") || ext === "docx") {
    const mammoth = require("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return (value || "").trim();
  }
  if (m.includes("text") || ext === "txt" || ext === "md" || ext === "csv") {
    return buffer.toString("utf8");
  }
  throw new Error(`Unsupported file type: ${mime || ext}`);
}

/**
 * Embed chunks and upsert into Qdrant.
 * @param {object} opts
 * @param {import('@qdrant/js-client-rest').QdrantClient} opts.client
 * @param {string} opts.collectionName
 * @param {string} opts.ollamaBase
 * @param {string} opts.embedModel
 * @param {string} opts.assistantId
 * @param {string[]} opts.chunks
 * @param {string} opts.source
 */
export async function upsertChunks({ client, collectionName, ollamaBase, embedModel, assistantId, chunks, source, embedText }) {
  console.log("RAG CHUNKS:", chunks.length);
  if (!chunks.length) return { upserted: 0 };
  try {
    const embedFn = typeof embedText === "function"
      ? embedText
      : (text) => createEmbedding(ollamaBase, embedModel, text);
    const firstEmb = await embedFn(chunks[0]);
    await ensureCollection(client, collectionName, firstEmb);

    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const vector = i === 0 ? firstEmb : await embedFn(text);
      const id = crypto.randomUUID();
      points.push({
        id,
        vector,
        payload: {
          assistant_id: assistantId,
          chunk_index: i,
          text,
          source: source || "manual",
        },
      });
    }

    await client.upsert(collectionName, {
      wait: true,
      points,
    });
    return { upserted: points.length };
  } catch (e) {
    const c = e?.cause;
    console.error("QDRANT UPSERT ERROR:", c ?? e);
    if (c && (c.code === "ECONNREFUSED" || c.code === "ENOTFOUND")) {
      throw new Error(
        `Qdrant unavailable at ${getQdrantUrl()} (${c.code} ${c.syscall || ""} ${c.address || ""}:${c.port ?? ""})`.trim(),
      );
    }
    throw e;
  }
}

function formatHistoryTranscript(apiMessages) {
  const arr = Array.isArray(apiMessages) ? apiMessages : [];
  if (arr.length <= 1) return "(начало диалога)";
  return arr
    .slice(0, -1)
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : m.role === "user" ? "User" : String(m.role || "");
      return `${role}: ${String(m.content ?? "").trim()}`;
    })
    .join("\n\n");
}

/**
 * Full RAG: embed last user query → Qdrant top-5 → SYSTEM(CONTEXT + HISTORY + USER) → POST /api/chat.
 */
export async function chatWithRag({
  assistant,
  messages,
  client = getQdrantClient(),
  embedText,
  generateText,
}) {
  const ollamaBase = getOllamaBase(assistant);
  const chatModel = assistant.model || "qwen2.5:7b";
  const embedModel = assistant.embedModel || "nomic-embed-text";
  const temperature = assistant.temperature != null ? Number(assistant.temperature) : 0.7;
  const coll = collectionNameForAssistant(assistant.id);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const queryText = (lastUser?.content || "").trim();
  if (!queryText) {
    throw new Error("No user message");
  }

  console.log("RAG START");

  let contextBlock = "";
  let contextError = "";
  let contextHitsCount = 0;
  let retrievalMode = "vector";
  try {
    const lexicalFallback = async () => {
      const out = await client.scroll(coll, {
        limit: 200,
        with_payload: true,
        with_vector: false,
      });
      const rows = Array.isArray(out?.points) ? out.points : [];
      const tokens = String(queryText || "")
        .toLowerCase()
        .split(/[^a-zA-Zа-яА-Я0-9]+/u)
        .map((t) => t.trim())
        .filter((t) => t.length >= 4);
      if (!tokens.length) return [];
      const scored = rows
        .map((p) => String(p?.payload?.text || ""))
        .filter(Boolean)
        .map((text) => {
          const low = text.toLowerCase();
          let score = 0;
          for (const t of tokens) {
            if (low.includes(t)) score += 1;
          }
          return { text, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.text);
      return scored;
    };

    const loadRagContext = async () => {
      const qv = embedText
        ? await embedText(queryText)
        : await createEmbedding(ollamaBase, embedModel, queryText);
      const hits = await searchContext(client, coll, qv, 5);
      contextHitsCount = Array.isArray(hits) ? hits.length : 0;
      let texts = hits.map((h) => h.text).filter(Boolean);
      if (!texts.length) {
        const lexicalTexts = await lexicalFallback();
        if (lexicalTexts.length) {
          retrievalMode = "lexical_fallback";
          texts = lexicalTexts;
          contextHitsCount = lexicalTexts.length;
        }
      }
      return texts.join("\n---\n");
    };
    const loadWithTimeout = async () => Promise.race([
      loadRagContext(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("RAG context timeout")), 6000)),
    ]);
    try {
      contextBlock = await loadWithTimeout();
    } catch (firstErr) {
      // Retry once to reduce flaky upstream/network misses.
      contextBlock = await loadWithTimeout();
      console.warn("[ai-rag] context retry succeeded after first error:", firstErr?.message || String(firstErr));
    }
  } catch (e) {
    contextError = e?.message || String(e);
    console.warn("[ai-rag] context search skipped:", contextError);
    try {
      const out = await client.scroll(coll, {
        limit: 200,
        with_payload: true,
        with_vector: false,
      });
      const rows = Array.isArray(out?.points) ? out.points : [];
      const tokens = String(queryText || "")
        .toLowerCase()
        .split(/[^a-zA-Zа-яА-Я0-9]+/u)
        .map((t) => t.trim())
        .filter((t) => t.length >= 4);
      const lexicalTexts = rows
        .map((p) => String(p?.payload?.text || ""))
        .filter(Boolean)
        .map((text) => {
          const low = text.toLowerCase();
          let score = 0;
          for (const t of tokens) {
            if (low.includes(t)) score += 1;
          }
          return { text, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.text);
      if (lexicalTexts.length) {
        retrievalMode = "lexical_fallback_after_error";
        contextHitsCount = lexicalTexts.length;
        contextBlock = lexicalTexts.join("\n---\n");
      }
    } catch (fallbackErr) {
      console.warn("[ai-rag] lexical fallback failed:", fallbackErr?.message || String(fallbackErr));
    }
  }

  console.log("RAG CONTEXT:", contextBlock.trim() ? contextBlock.slice(0, 4000) : "(empty)");

  const baseSystem =
    assistant.systemPrompt ||
    "You are a helpful assistant. Answer clearly. Prefer facts from CONTEXT when relevant.";

  const ctx =
    contextBlock.trim() ||
    "(нет релевантных фрагментов в базе знаний — отвечай по общим знаниям, если уместно.)";
  const historyBlock = formatHistoryTranscript(messages);

  const systemContent = `${baseSystem}

=== CONTEXT (RAG, top retrieval) ===
${ctx}
=== END CONTEXT ===

=== HISTORY (prior turns) ===
${historyBlock}
=== END HISTORY ===

=== CURRENT USER MESSAGE ===
${queryText}
=== END ===

Ответь на CURRENT USER MESSAGE с учётом CONTEXT и HISTORY.`;

  const ollamaMessages = [
    { role: "system", content: systemContent },
    { role: "user", content: queryText },
  ];

  const gen = generateText
    ? await generateText({
      systemContent,
      queryText,
      chatModel,
      temperature,
      assistant,
    })
    : await generateResponse(ollamaBase, chatModel, ollamaMessages, {
      temperature: Number.isFinite(temperature) ? temperature : 0.7,
    });
  let promptTokens = gen.promptTokens;
  let completionTokens = gen.completionTokens;
  if (!promptTokens && !completionTokens) {
    const approx = Math.ceil(
      (systemContent.length + queryText.length + (gen.text || "").length) / 4,
    );
    completionTokens = Math.max(1, Math.ceil((gen.text || "").length / 4));
    promptTokens = Math.max(1, approx - completionTokens);
  }
  return {
    reply: gen.text,
    usedContext: Boolean(contextBlock.trim()),
    promptTokens,
    completionTokens,
    ragDiagnostics: {
      assistantId: assistant.id,
      collection: coll,
      contextHits: contextHitsCount,
      retrievalMode,
      contextError: contextError || null,
      embedModel,
      chatModel,
    },
  };
}

/** Legacy OpenAI-compatible upstream (kept for optional hybrid). */
export async function chatOpenAiCompatible({ baseUrl, apiKey, model, systemPrompt, messages }) {
  const base = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const url = `${base}/chat/completions`;
  const body = {
    model: model || "gpt-4o-mini",
    messages: [...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), ...messages],
  };
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(json.error?.message || json.error || "Upstream error");
  }
  return json.choices?.[0]?.message?.content ?? "";
}
