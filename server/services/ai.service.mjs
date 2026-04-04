/**
 * Local AI: Ollama (chat + embeddings) + Qdrant (RAG). No OpenAI.
 * Env: OLLAMA_URL, QDRANT_URL, QDRANT_API_KEY (optional)
 */
import { QdrantClient } from "@qdrant/js-client-rest";
import { createRequire } from "module";
import crypto from "crypto";

const require = createRequire(import.meta.url);

let _qdrant = null;

export function getQdrantClient() {
  if (!_qdrant) {
    const url = (process.env.QDRANT_URL || "http://127.0.0.1:6333").replace(/\/$/, "");
    _qdrant = new QdrantClient({
      url,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
  }
  return _qdrant;
}

/** Ollama HTTP API base — only `OLLAMA_URL` (no DB/UI overrides). */
export function getOllamaBase(_assistant) {
  return (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
}

export function collectionNameForAssistant(assistantId) {
  const safe = assistantId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `kb_${safe}`.slice(0, 200);
}

/**
 * @param {string} ollamaBase
 * @param {string} embedModel e.g. nomic-embed-text
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function createEmbedding(ollamaBase, embedModel, text) {
  const r = await fetch(`${ollamaBase}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: embedModel,
      prompt: text.slice(0, 8000),
    }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(typeof json.error === "string" ? json.error : json.error?.message || r.statusText || "Embedding failed");
  }
  const embedding = json.embedding;
  if (!Array.isArray(embedding) || !embedding.length) {
    throw new Error("Invalid embedding response from Ollama");
  }
  return embedding;
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
  const r = await fetch(`${ollamaBase}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

/** Split long text into overlapping chunks for RAG. */
export function chunkText(text, chunkSize = 900, overlap = 120) {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  const chunks = [];
  let i = 0;
  while (i < t.length) {
    const end = Math.min(i + chunkSize, t.length);
    let slice = t.slice(i, end);
    if (end < t.length) {
      const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "), slice.lastIndexOf(" "));
      if (lastBreak > chunkSize * 0.4) {
        slice = slice.slice(0, lastBreak + 1);
      }
    }
    chunks.push(slice.trim());
    i += Math.max(1, slice.length - overlap);
    if (i >= t.length) break;
  }
  return chunks.filter(Boolean);
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
export async function upsertChunks({ client, collectionName, ollamaBase, embedModel, assistantId, chunks, source }) {
  if (!chunks.length) return { upserted: 0 };
  const firstEmb = await createEmbedding(ollamaBase, embedModel, chunks[0]);
  await ensureCollection(client, collectionName, firstEmb);

  const points = [];
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    const vector = i === 0 ? firstEmb : await createEmbedding(ollamaBase, embedModel, text);
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

  let contextBlock = "";
  try {
    const qv = await createEmbedding(ollamaBase, embedModel, queryText);
    const hits = await searchContext(client, coll, qv, 5);
    const texts = hits.map((h) => h.text).filter(Boolean);
    contextBlock = texts.join("\n---\n");
  } catch (e) {
    console.warn("[ai-rag] context search skipped:", e.message);
  }

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

  const gen = await generateResponse(ollamaBase, chatModel, ollamaMessages, {
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
