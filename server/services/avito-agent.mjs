/**
 * Avito AI Agent pipeline:
 * incoming Avito message → RAG context (Qdrant) → crm-al chat → reply to Avito
 *
 * Namespaces:
 *  - neeklo_global       — uploaded documents / knowledge base
 *  - neeklo_pricing      — service price list
 *  - neeklo_avito_items  — current Avito listings
 *  - neeklo_avito_ins    — conversation insights
 */

import crypto from "crypto";
import { crmAlChat, crmAlErrorMessage } from "./crm-al.service.mjs";
import { getQdrantClient, ensureCollection, createEmbedding, searchContext, getOllamaBase } from "./ai.service.mjs";

export const GLOBAL_KB_COLLECTION   = "neeklo_global";
export const PRICING_COLLECTION     = "neeklo_pricing";
export const AVITO_ITEMS_COLLECTION = "neeklo_avito_items";
export const AVITO_INSIGHTS_COLL    = "neeklo_avito_ins";

const EMBED_MODEL = process.env.AGENT_EMBED_MODEL || "nomic-embed-text";

const DEFAULT_SYSTEM_PROMPT = `Ты — умный менеджер-консультант компании Neeklo (AI-студия).
Твоя задача — помочь клиенту найти решение, предложить подходящий сервис, уточнить детали и провести к встрече или сделке.

Правила:
1. Отвечай ТОЛЬКО на русском языке.
2. Ответ не более 4–5 предложений. Будь конкретным и полезным.
3. Используй информацию из CONTEXT — цены, услуги, условия. Не придумывай данные.
4. Задавай ОДИН уточняющий вопрос если не хватает информации.
5. Предлагай конкретные варианты, называй цены если знаешь.
6. Цель — записать клиента на встречу или оформить заказ.
7. Не перечисляй все услуги подряд — фокусируйся на запросе клиента.
8. Будь дружелюбным, живым, без шаблонных фраз.`;

/**
 * Get RAG context from multiple Qdrant collections.
 */
async function getRagContext(userMessage, opts = {}) {
  const client = getQdrantClient();
  const ollamaBase = getOllamaBase();

  let queryVector;
  try {
    queryVector = await createEmbedding(ollamaBase, EMBED_MODEL, userMessage);
  } catch (e) {
    console.warn("[avito-agent] embed failed:", e?.message);
    return { context: "", chunks: [] };
  }

  const collections = [
    GLOBAL_KB_COLLECTION,
    PRICING_COLLECTION,
    AVITO_ITEMS_COLLECTION,
  ];

  const allChunks = [];

  for (const coll of collections) {
    try {
      const hits = await searchContext(client, coll, queryVector, 3);
      for (const h of hits) {
        if (h.text && h.score > 0.35) {
          allChunks.push({ ...h, collection: coll });
        }
      }
    } catch {
      // Collection may not exist yet — skip silently
    }
  }

  // Sort by score descending, take top 6
  allChunks.sort((a, b) => b.score - a.score);
  const top = allChunks.slice(0, 6);

  const context = top.map((c) => c.text).join("\n---\n");
  return { context, chunks: top };
}

/**
 * Build messages array for crm-al: history + current message.
 * @param {string} systemPrompt
 * @param {Array<{role:string,content:string}>} history — prior messages (role: user/assistant)
 * @param {string} context — RAG context block
 * @param {string} userMessage
 */
function buildMessages(systemPrompt, history, context, userMessage) {
  const sysContent = `${systemPrompt}

=== ИНФОРМАЦИЯ (из базы знаний) ===
${context || "(нет релевантной информации)"}
=== КОНЕЦ ===`;

  const msgs = [{ role: "system", content: sysContent }];

  // Add last N history messages (max 8 turns)
  const recent = (history || []).slice(-16);
  for (const m of recent) {
    if (m.role === "user" || m.role === "assistant") {
      msgs.push({ role: m.role, content: String(m.content || "") });
    }
  }

  msgs.push({ role: "user", content: userMessage });
  return msgs;
}

/**
 * Process one Avito client message through the agent pipeline.
 *
 * @param {object} opts
 * @param {string} opts.userMessage — client's text
 * @param {Array}  opts.history — previous messages [{role,content}]
 * @param {string} [opts.systemPrompt] — override system prompt
 * @param {string} [opts.model] — crm-al model profile
 * @returns {Promise<{reply:string,chunks:Array,ragContext:string,error?:string}>}
 */
export async function processAvitoMessage({ userMessage, history = [], systemPrompt, model }) {
  const sysPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // 1. Get RAG context
  const { context, chunks } = await getRagContext(userMessage);

  // 2. Build messages
  const messages = buildMessages(sysPrompt, history, context, userMessage);

  // 3. Call crm-al
  try {
    const result = await crmAlChat(messages, { model: model || "auto", timeoutMs: 90_000 });
    return {
      reply: result.text,
      chunks,
      ragContext: context,
    };
  } catch (e) {
    const errorMsg = crmAlErrorMessage(e);
    console.error("[avito-agent] crm-al error:", e?.message || e);
    return {
      reply: null,
      chunks,
      ragContext: context,
      error: errorMsg,
    };
  }
}

/**
 * Upsert a single Avito item into the avito_items Qdrant collection.
 * @param {object} item — { id, title, description, price, status, url, category }
 */
export async function upsertAvitoItemToKb(item) {
  const client = getQdrantClient();
  const ollamaBase = getOllamaBase();

  const text = [
    `Объявление: ${item.title || ""}`,
    item.description ? `Описание: ${item.description}` : "",
    item.price != null ? `Цена: ${item.price} ₽` : "",
    item.status ? `Статус: ${item.status}` : "",
    item.category ? `Категория: ${item.category}` : "",
    item.url ? `Ссылка: ${item.url}` : "",
  ].filter(Boolean).join("\n");

  const vector = await createEmbedding(ollamaBase, EMBED_MODEL, text);
  await ensureCollection(client, AVITO_ITEMS_COLLECTION, vector);

  await client.upsert(AVITO_ITEMS_COLLECTION, {
    wait: true,
    points: [{
      id: `item_${String(item.id || item.itemId || "").replace(/\D/g, "") || Date.now()}`,
      vector,
      payload: {
        text,
        source: "avito_items",
        item_id: String(item.id || item.itemId || ""),
        title: item.title || "",
        price: item.price ?? null,
        status: item.status || "",
      },
    }],
  });
}

/**
 * Upsert a service price into the pricing Qdrant collection.
 * @param {object} price — { id, title, description, priceFrom, priceTo, category }
 */
export async function upsertPriceToKb(price) {
  const client = getQdrantClient();
  const ollamaBase = getOllamaBase();

  const priceRange = price.priceFrom && price.priceTo
    ? `${price.priceFrom}–${price.priceTo} ₽`
    : price.priceFrom
    ? `от ${price.priceFrom} ₽`
    : price.priceTo
    ? `до ${price.priceTo} ₽`
    : "цена по запросу";

  const text = [
    `Услуга: ${price.title || ""}`,
    price.description ? `Описание: ${price.description}` : "",
    `Стоимость: ${priceRange}`,
    price.category ? `Категория: ${price.category}` : "",
  ].filter(Boolean).join("\n");

  const vector = await createEmbedding(ollamaBase, EMBED_MODEL, text);
  await ensureCollection(client, PRICING_COLLECTION, vector);

  await client.upsert(PRICING_COLLECTION, {
    wait: true,
    points: [{
      id: `price_${price.id}`,
      vector,
      payload: {
        text,
        source: "pricing",
        price_id: price.id,
        title: price.title || "",
        price_from: price.priceFrom ?? null,
        price_to: price.priceTo ?? null,
        category: price.category || "",
      },
    }],
  });
}

/**
 * Upsert a text chunk into global knowledge base collection.
 * @param {object} opts
 * @param {string} opts.id — unique id for this chunk
 * @param {string} opts.text
 * @param {string} [opts.source]
 * @param {string} [opts.filename]
 */
export async function upsertGlobalKbChunk({ id, text, source, filename }) {
  const client = getQdrantClient();
  const ollamaBase = getOllamaBase();

  const vector = await createEmbedding(ollamaBase, EMBED_MODEL, text);
  await ensureCollection(client, GLOBAL_KB_COLLECTION, vector);

  await client.upsert(GLOBAL_KB_COLLECTION, {
    wait: true,
    points: [{
      id: id || crypto.randomUUID(),
      vector,
      payload: { text, source: source || "manual", filename: filename || "" },
    }],
  });
}

export { DEFAULT_SYSTEM_PROMPT };

/**
 * Analyze a completed Avito conversation and extract insights for the KB.
 * Stores valuable patterns in Qdrant namespace=avito_insights.
 *
 * @param {Array<{role:string,content:string}>} messages — conversation history
 * @param {string} [chatId]
 * @returns {Promise<{insights:string[],stored:number}>}
 */
export async function analyzeConversationToKb(messages, chatId) {
  if (!messages || messages.length < 2) return { insights: [], stored: 0 };

  const transcript = messages
    .map(m => `${m.role === "user" ? "Клиент" : "Агент"}: ${m.content || ""}`)
    .join("\n");

  const analysisPrompt = `Ты — аналитик диалогов. Проанализируй этот диалог с клиентом и извлеки полезную информацию для базы знаний.

ДИАЛОГ:
${transcript.slice(0, 3000)}

Извлеки ТОЛЬКО реально полезную информацию:
1. Типичные запросы и боли клиентов
2. Успешные формулировки ответов
3. Уточняющие вопросы которые работают
4. Конкретные потребности клиентов

Ответь в формате JSON массива строк (факты/инсайты), максимум 5 элементов.
Пример: ["Клиенты часто спрашивают о сроках создания мультика — обычно 14-21 день", "Эффективный вопрос: 'Для какого возраста делаем?'"]

Если диалог неинформативен — верни пустой массив [].`;

  try {
    const result = await crmAlChat(
      [{ role: "user", content: analysisPrompt }],
      { model: "auto", timeoutMs: 30_000 }
    );

    let insights = [];
    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(insights)) insights = [];
      }
    } catch {
      insights = [];
    }

    const client = getQdrantClient();
    const ollamaBase = getOllamaBase();

    let stored = 0;
    for (const insight of insights.slice(0, 5)) {
      if (typeof insight !== "string" || !insight.trim()) continue;
      try {
        const vector = await createEmbedding(ollamaBase, EMBED_MODEL, insight);
        await ensureCollection(client, AVITO_INSIGHTS_COLL, vector);
        await client.upsert(AVITO_INSIGHTS_COLL, {
          wait: true,
          points: [{
            id: crypto.randomUUID(),
            vector,
            payload: {
              text: insight,
              source: "avito_conversation_analysis",
              chat_id: chatId || "",
              analyzed_at: new Date().toISOString(),
            },
          }],
        });
        stored++;
      } catch (e) {
        console.warn("[avito-kb] insight upsert failed:", e?.message);
      }
    }

    return { insights, stored };
  } catch (e) {
    console.warn("[avito-kb] analysis failed:", e?.message);
    return { insights: [], stored: 0 };
  }
}
