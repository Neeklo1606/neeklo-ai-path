/**
 * Avito AI Agent pipeline — crm-al.neeklo.ru only, no Ollama.
 *
 * Context strategy (no embeddings):
 *  1. Service prices   — loaded from PostgreSQL ServicePrice table (passed in)
 *  2. Avito listings   — scrolled from Qdrant neeklo_avito_items (payload-only)
 *  3. Global KB chunks — scrolled from Qdrant neeklo_global (payload-only)
 *  4. Insights         — scrolled from Qdrant neeklo_avito_ins (payload-only)
 *
 * Storage still uses Qdrant with hash-based pseudo-vectors so existing data
 * is preserved and no external service is needed for writes.
 */

import crypto from "crypto";
import { crmAlChat, crmAlErrorMessage } from "./crm-al.service.mjs";
import { getQdrantClient, ensureCollection } from "./ai.service.mjs";

export const GLOBAL_KB_COLLECTION   = "neeklo_global";
export const PRICING_COLLECTION     = "neeklo_pricing";
export const AVITO_ITEMS_COLLECTION = "neeklo_avito_items";
export const AVITO_INSIGHTS_COLL    = "neeklo_avito_ins";

// Deterministic pseudo-vector based on text hash — no Ollama needed.
// Used only to satisfy Qdrant's vector requirement; we always scroll (not search).
function hashVector(text, dim = 768) {
  const buf = crypto.createHash("sha256").update(String(text || ""), "utf8").digest();
  const vec = new Array(dim);
  for (let i = 0; i < dim; i++) {
    const b = buf[i % buf.length];
    vec[i] = (b / 128.0) - 1.0; // [-1, 1]
  }
  return vec;
}

export const DEFAULT_SYSTEM_PROMPT = `Ты — Макс, менеджер-консультант компании Neeklo (AI-продакшн студия). Работаешь с клиентами в мессенджере.
Твоя задача — понять потребность клиента, предложить подходящее решение и договориться на созвон или встречу.

ПРАВИЛА ОБЩЕНИЯ:
1. Пиши ТОЛЬКО на русском языке. Как живой человек — тепло, уверенно, без канцелярита.
2. Ответ строго 3–5 предложений. Краткость — уважение к клиенту.
3. Используй данные из КОНТЕКСТ (услуги, цены, объявления). Не придумывай.
4. Задавай ОДИН уточняющий вопрос — самый важный для понимания задачи.
5. Называй конкретные решения и цены из КОНТЕКСТ.
6. НЕ СМЕШИВАЙ контексты: ты ведёшь диалог только с одним клиентом.

ВОРОНКА — следуй этим шагам:
Шаг 1. ВЫЯСНЕНИЕ: пойми задачу клиента — 1-2 уточняющих вопроса.
Шаг 2. РЕШЕНИЕ: предложи конкретный вариант с ценой из КОНТЕКСТ.
Шаг 3. КОНТАКТ: после 2-3 сообщений попроси имя и номер телефона (или Telegram).
  → «Как вас зовут? И какой номер телефона удобен для связи?»
  → «Хотите перейти в Telegram для удобства? Наш Telegram: @neeklo_ru»
Шаг 4. ВРЕМЯ: согласуй время для созвона или встречи.
  → «В какое время вам удобно созвониться: сегодня или завтра?»
Шаг 5. ФИКСАЦИЯ: подтверди договорённость и скажи что свяжешься.

РАСПОЗНАВАНИЕ ГОТОВНОСТИ:
- Клиент даёт телефон → подтверди: "Отлично, набираю вас прямо сейчас!"
- Клиент говорит "да", "удобно", "давайте" → сразу назначай время
- Клиент спрашивает цену дважды → готов к покупке, называй цену и предлагай оформить
- Клиент упоминает срочность → предлагай связаться немедленно

КОНТАКТЫ NEEKLO:
- Telegram: @neeklo_ru
- Специалист: Максим
- При желании клиента перейти в другой канал — дай контакты и подтверди передачу

Пример (клиент даёт телефон):
→ «Отлично, набираю ваш номер прямо сейчас! Если не дозвонюсь сразу — напишите удобное время, перезвоню в течение 15 минут.»`;

/**
 * Simple keyword relevance score: count matching words.
 */
function keywordScore(text, query) {
  const t = (text || "").toLowerCase();
  const words = (query || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w => w.length > 2);
  if (!words.length) return 0;
  return words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
}

/**
 * Scroll a Qdrant collection (payload-only, no vector search).
 * Returns up to `limit` items.
 */
async function scrollCollection(client, collection, limit = 30) {
  try {
    const result = await client.scroll(collection, {
      limit,
      with_payload: true,
      with_vector: false,
    });
    return Array.isArray(result?.points) ? result.points : [];
  } catch {
    return [];
  }
}

/**
 * Build KB context string from multiple Qdrant collections + service prices.
 * Uses keyword matching (no embeddings needed).
 *
 * @param {string} userMessage
 * @param {Array}  servicePrices  — from PostgreSQL ServicePrice table [{title,description,priceFrom,priceTo,category}]
 */
export async function buildAgentContext(userMessage, servicePrices = []) {
  const client = getQdrantClient();
  const parts = [];

  // 1. Avito listings (scroll up to 30, rank by keyword relevance)
  const avitoPoints = await scrollCollection(client, AVITO_ITEMS_COLLECTION, 50);
  const rankedAvito = avitoPoints
    .map(p => ({ text: p.payload?.text || "", score: keywordScore(p.payload?.text, userMessage) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  if (rankedAvito.length > 0) {
    parts.push("=== АКТИВНЫЕ ОБЪЯВЛЕНИЯ ===");
    rankedAvito.forEach(p => p.text && parts.push(p.text));
  }

  // 2. Service prices from DB (always include all)
  if (servicePrices.length > 0) {
    parts.push("\n=== ПРАЙС УСЛУГ ===");
    for (const p of servicePrices) {
      const priceRange = p.priceFrom && p.priceTo
        ? `${p.priceFrom}–${p.priceTo} ₽`
        : p.priceFrom ? `от ${p.priceFrom} ₽`
        : p.priceTo ? `до ${p.priceTo} ₽`
        : "цена по запросу";
      parts.push(`${p.title}: ${priceRange}${p.description ? " — " + p.description : ""}`);
    }
  }

  // 3. Global KB (uploaded docs — keyword ranked, top 5)
  const kbPoints = await scrollCollection(client, GLOBAL_KB_COLLECTION, 100);
  const rankedKb = kbPoints
    .map(p => ({ text: p.payload?.text || "", score: keywordScore(p.payload?.text, userMessage) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  if (rankedKb.filter(p => p.text).length > 0) {
    parts.push("\n=== БАЗА ЗНАНИЙ ===");
    rankedKb.forEach(p => p.text && parts.push(p.text));
  }

  // 4. Conversation insights (top 3)
  const insightsPoints = await scrollCollection(client, AVITO_INSIGHTS_COLL, 20);
  const rankedInsights = insightsPoints
    .map(p => ({ text: p.payload?.text || "", score: keywordScore(p.payload?.text, userMessage) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (rankedInsights.filter(p => p.text).length > 0) {
    parts.push("\n=== ОПЫТ ОБЩЕНИЯ ===");
    rankedInsights.forEach(p => p.text && parts.push(p.text));
  }

  return parts.join("\n");
}

/**
 * Build the messages array for crm-al.
 * Uses FULL history (not capped) to ensure agent never loses context.
 */
function buildMessages(systemPrompt, history, context, userMessage) {
  const sysContent = `${systemPrompt}

=== КОНТЕКСТ (из базы знаний) ===
${context || "(нет дополнительной информации)"}
=== КОНЕЦ КОНТЕКСТА ===`;

  const msgs = [{ role: "system", content: sysContent }];

  // Include full history — agent must remember entire conversation
  for (const m of (history || [])) {
    if ((m.role === "user" || m.role === "assistant") && m.content) {
      msgs.push({ role: m.role, content: String(m.content) });
    }
  }

  msgs.push({ role: "user", content: userMessage });
  return msgs;
}

/**
 * Process one Avito client message through the agent pipeline.
 * History is isolated per-chat (caller must pass ONLY this chat's messages).
 *
 * @param {object} opts
 * @param {string} opts.userMessage
 * @param {Array}  opts.history        — [{role,content}] — full history of THIS chat only
 * @param {string} [opts.systemPrompt]
 * @param {string} [opts.model]
 * @param {Array}  [opts.servicePrices] — from DB
 * @returns {Promise<{reply:string,context:string,error?:string}>}
 */
export async function processAvitoMessage({ userMessage, history = [], systemPrompt, model, servicePrices = [] }) {
  const sysPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // Build context (no Ollama — uses scroll + keyword matching)
  const context = await buildAgentContext(userMessage, servicePrices);

  // Build messages with full isolated history
  const messages = buildMessages(sysPrompt, history, context, userMessage);

  try {
    const result = await crmAlChat(messages, { model: model || "neeklo", timeoutMs: 90_000 });
    return { reply: result.text, context, usage: result.usage };
  } catch (e) {
    console.error("[avito-agent] crm-al error:", e?.message || e);
    return { reply: null, context, error: crmAlErrorMessage(e) };
  }
}

/**
 * Detect lead intent from conversation and extract lead data.
 * Returns null if no lead should be created yet.
 *
 * @param {Array<{role,content}>} history  — full conversation
 * @param {string} chatId
 * @returns {Promise<{shouldCreate:boolean, name?:string, phone?:string, intent?:string, summary?:string}|null>}
 */
export async function detectLeadIntent(history, chatId) {
  if (!history || history.length < 2) return null;

  const transcript = history
    .slice(-12) // last 6 turns
    .map(m => `${m.role === "user" ? "Клиент" : "Агент"}: ${m.content || ""}`)
    .join("\n");

  const prompt = `Проанализируй диалог с клиентом Avito и определи, нужно ли создать лид (потенциального клиента) в CRM.

ДИАЛОГ:
${transcript}

Ответь ТОЛЬКО JSON объектом (без markdown):
{
  "shouldCreate": true/false,
  "name": "имя клиента если упомянул или null",
  "phone": "телефон если упомянул или null",
  "intent": "краткое название интереса клиента (1-5 слов)",
  "summary": "краткое описание потребности клиента (1-2 предложения)"
}

Создавай лид если: клиент проявил реальный интерес, задал вопрос о цене/сроках/условиях, или описал конкретную задачу.
НЕ создавай лид если: первое сообщение, нет конкретного интереса, общие вопросы.`;

  try {
    const result = await crmAlChat([{ role: "user", content: prompt }], { model: "auto", timeoutMs: 20_000 });
    const text = result.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Analyze conversation and store insights in Qdrant (no Ollama — hash vector).
 */
export async function analyzeConversationToKb(messages, chatId) {
  if (!messages || messages.length < 3) return { insights: [], stored: 0 };

  const transcript = messages
    .map(m => `${m.role === "user" ? "Клиент" : "Агент"}: ${m.content || ""}`)
    .join("\n");

  const prompt = `Ты — аналитик диалогов. Извлеки полезную информацию из диалога для базы знаний.

ДИАЛОГ:
${transcript.slice(0, 3000)}

Извлеки ТОЛЬКО реально полезное (типичные запросы, боли, успешные ответы).
Формат: JSON массив строк, максимум 5 элементов. Если нечего — верни [].`;

  try {
    const result = await crmAlChat([{ role: "user", content: prompt }], { model: "auto", timeoutMs: 30_000 });
    const jsonMatch = (result.text || "").match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { insights: [], stored: 0 };

    const insights = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(insights)) return { insights: [], stored: 0 };

    const client = getQdrantClient();
    let stored = 0;
    for (const insight of insights.slice(0, 5)) {
      if (typeof insight !== "string" || !insight.trim()) continue;
      try {
        const vector = hashVector(insight);
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
      } catch {}
    }
    return { insights, stored };
  } catch {
    return { insights: [], stored: 0 };
  }
}

/**
 * Upsert a single Avito item into the avito_items Qdrant collection.
 * Uses hash vector — no Ollama needed.
 */
export async function upsertAvitoItemToKb(item) {
  const client = getQdrantClient();

  const category = item.category?.name ?? item.category ?? "";
  const address = item.address ?? item.location?.address ?? item.region?.name ?? "";
  const priceStr = item.price_string
    ? String(item.price_string)
    : item.price != null ? `${item.price} ₽` : "";
  const paramsText = Array.isArray(item.params)
    ? item.params.map(p => `${p.name || p.title || ""}: ${p.value || ""}`).filter(Boolean).join(", ")
    : "";

  const text = [
    `Объявление: ${item.title || ""}`,
    category ? `Категория: ${category}` : "",
    item.description ? `Описание: ${item.description}` : "",
    priceStr ? `Цена: ${priceStr}` : "",
    item.status ? `Статус: ${item.status}` : "",
    address ? `Адрес: ${address}` : "",
    paramsText ? `Параметры: ${paramsText}` : "",
  ].filter(Boolean).join("\n");

  const vector = hashVector(text);
  await ensureCollection(client, AVITO_ITEMS_COLLECTION, vector);

  const numId = String(item.id || item.itemId || "").replace(/\D/g, "");
  const pointId = numId
    ? parseInt(numId, 10) % 2147483647 || 1
    : Date.now() % 2147483647;

  await client.upsert(AVITO_ITEMS_COLLECTION, {
    wait: true,
    points: [{
      id: pointId,
      vector,
      payload: {
        text,
        source: "avito_items",
        item_id: String(item.id || item.itemId || ""),
        title: item.title || "",
        price: item.price ?? null,
        price_string: priceStr,
        status: item.status || "",
        category,
        address,
        description: item.description || "",
      },
    }],
  });
}

/**
 * Upsert a service price into the pricing Qdrant collection.
 * Uses hash vector — no Ollama needed.
 */
export async function upsertPriceToKb(price) {
  const client = getQdrantClient();

  const priceRange = price.priceFrom && price.priceTo
    ? `${price.priceFrom}–${price.priceTo} ₽`
    : price.priceFrom ? `от ${price.priceFrom} ₽`
    : price.priceTo ? `до ${price.priceTo} ₽`
    : "цена по запросу";

  const text = [
    `Услуга: ${price.title || ""}`,
    price.description ? `Описание: ${price.description}` : "",
    `Стоимость: ${priceRange}`,
    price.category ? `Категория: ${price.category}` : "",
  ].filter(Boolean).join("\n");

  const vector = hashVector(text);
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
 * Uses hash vector — no Ollama needed.
 */
export async function upsertGlobalKbChunk({ id, text, source, filename }) {
  const client = getQdrantClient();
  const vector = hashVector(text);
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

// ─── Contact & Intent Detection (no API calls — instant regex/keyword) ────────

const PHONE_RE = /(?:\+7|8)[\s\-]?\(?(\d{3})\)?[\s\-]?(\d{3})[\s\-]?(\d{2})[\s\-]?(\d{2})/g;

/**
 * Extract the first Russian phone number from a text string.
 * Returns normalized form like "+7 999 637-11-82" or null.
 */
export function extractPhone(text) {
  const t = String(text || "");
  PHONE_RE.lastIndex = 0;
  const m = PHONE_RE.exec(t);
  if (!m) return null;
  return `+7 (${m[1]}) ${m[2]}-${m[3]}-${m[4]}`;
}

/**
 * Detect transfer intent from a client message.
 * Returns one of: "call" | "telegram" | "meet" | "now" | null
 */
export function detectTransferIntent(text) {
  const t = (text || "").toLowerCase();

  if (/telegram|телеграм|тг\b|вотсап|whatsapp/.test(t)) return "telegram";
  if (/сейчас\s*(можно|удобно|готов|звони|наберите)|перезвони|набери|позвони/.test(t)) return "now";
  if (/созвон|созвониться|созвонимся|позвоните|обсудить\s*(по\s*телефону|голосом)|звонок/.test(t)) return "call";
  if (/встреч|приеду|приехать|офис|лично/.test(t)) return "meet";

  return null;
}
