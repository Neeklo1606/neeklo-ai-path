/**
 * OpenRouter API client — fast OpenAI-compatible inference.
 * Free model first, cheap OpenAI fallback on failure.
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const OPENROUTER_KEY = () => process.env.OPENROUTER_API_KEY || "";
const FREE_MODEL = process.env.OPENROUTER_FREE_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || "openai/gpt-4o-mini";

const PROFILE_ALIASES = new Set(["neeklo", "auto", "aura"]);

function headers() {
  return {
    Authorization: `Bearer ${OPENROUTER_KEY()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.APP_BASE_URL || "https://neeklo.ru",
    "X-Title": "neeklo CRM Agent",
  };
}

function isRetryable(err) {
  const status = err?.status;
  if ([429, 404, 502, 503].includes(status)) return true;
  const msg = String(err?.message || "").toLowerCase();
  return /rate.?limit|unavailable|overloaded|no.*credit|insufficient|quota|capacity|not found|disabled/.test(msg);
}

async function openRouterChatOnce(messages, { model, timeoutMs = 45_000, systemPrompt } = {}) {
  const allMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages,
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model, messages: allMessages }),
      signal: controller.signal,
    });

    const json = await resp.json().catch(() => ({}));
    clearTimeout(timer);

    if (!resp.ok) {
      const msg = json?.error?.message || json?.message || `HTTP ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status;
      err.code = json?.error?.code;
      throw err;
    }

    const text = json.choices?.[0]?.message?.content ?? "";
    return {
      text: typeof text === "string" ? text : "",
      model: json.model || model,
      provider: "openrouter",
      usage: json.usage || null,
      raw: json,
    };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err = new Error("openrouter request timeout");
      err.status = 504;
      throw err;
    }
    throw e;
  }
}

/**
 * Chat with free model, fallback to cheap OpenAI model on failure.
 */
export async function openRouterChat(messages, opts = {}) {
  if (!OPENROUTER_KEY()) throw new Error("OPENROUTER_API_KEY not set");

  const explicit = opts.model;
  if (explicit && !PROFILE_ALIASES.has(explicit)) {
    return openRouterChatOnce(messages, { ...opts, model: explicit });
  }

  const models = [FREE_MODEL, FALLBACK_MODEL];
  let lastErr;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const result = await openRouterChatOnce(messages, { ...opts, model });
      if (i > 0) console.log(`[openrouter] used fallback model: ${model}`);
      return result;
    } catch (e) {
      lastErr = e;
      const isLast = i === models.length - 1;
      if (!isRetryable(e) || isLast) break;
      console.warn(`[openrouter] ${model} failed (${e.message}), trying fallback...`);
    }
  }
  throw lastErr;
}

export function openRouterIsConfigured() {
  return Boolean(OPENROUTER_KEY());
}

export function openRouterErrorMessage(err) {
  if (!err) return "Произошла ошибка. Попробуйте позже.";
  if (err.status === 402) return "Недостаточно средств на балансе OpenRouter.";
  if (err.status === 401) return "API-ключ OpenRouter недействителен.";
  if (err.status === 429) return "Лимит запросов OpenRouter. Повторите позже.";
  if (err.status === 504) return "Таймаут ответа модели. Повторите позже.";
  if (err.message) return err.message;
  return "Произошла ошибка. Попробуйте позже.";
}
