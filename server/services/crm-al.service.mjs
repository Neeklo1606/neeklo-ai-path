/**
 * crm-al API client — proxy through https://crm-al.neeklo.ru
 * Token: agw_... (stored in CRM_AL_API_KEY env var)
 * Profiles: auto (default) | aura | neeklo
 */

const CRM_AL_BASE = (process.env.CRM_AL_BASE_URL || "https://crm-al.neeklo.ru").replace(/\/$/, "");
const CRM_AL_KEY  = process.env.CRM_AL_API_KEY || "";
const CRM_AL_DEFAULT_MODEL = process.env.CRM_AL_DEFAULT_MODEL || "auto";

/** Build auth headers */
function authHeaders() {
  return {
    Authorization: `Bearer ${CRM_AL_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * Chat completions — OpenAI-compatible.
 * @param {Array<{role:string,content:string|Array}>} messages
 * @param {object} [opts]
 * @param {string} [opts.model] — "auto" | "aura" | "neeklo"
 * @param {string} [opts.systemPrompt] — prepended as system message
 * @param {number} [opts.timeoutMs]
 * @returns {Promise<{text:string,model:string,usage?:object,raw:object}>}
 */
export async function crmAlChat(messages, opts = {}) {
  if (!CRM_AL_KEY) throw new Error("CRM_AL_API_KEY not set");

  const model = opts.model || CRM_AL_DEFAULT_MODEL;
  const allMessages = [
    ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
    ...messages,
  ];

  const timeoutMs = opts.timeoutMs || 60_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${CRM_AL_BASE}/api/v1/chat/completions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ model, messages: allMessages }),
      signal: controller.signal,
    });

    const json = await resp.json().catch(() => ({}));
    clearTimeout(timer);

    if (!resp.ok) {
      const msg = json?.message || json?.error || `HTTP ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status;
      err.code = json?.code;
      throw err;
    }

    const text = json.choices?.[0]?.message?.content ?? "";
    return {
      text: typeof text === "string" ? text : "",
      model: json.model || model,
      usage: json.usage || null,
      raw: json,
    };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err = new Error("crm-al request timeout");
      err.status = 504;
      throw err;
    }
    throw e;
  }
}

/**
 * Get current balance.
 * @returns {Promise<{balanceRub:number,spentRub:number,remainingRub:number,isExhausted:boolean}>}
 */
export async function crmAlBalance() {
  if (!CRM_AL_KEY) throw new Error("CRM_AL_API_KEY not set");
  const resp = await fetch(`${CRM_AL_BASE}/api/v1/balance`, {
    headers: authHeaders(),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.message || `HTTP ${resp.status}`);
  return json;
}

/**
 * Get available models for this key.
 * @returns {Promise<{defaultModel:string,models:string[],data:object[]}>}
 */
export async function crmAlModels() {
  if (!CRM_AL_KEY) throw new Error("CRM_AL_API_KEY not set");
  const resp = await fetch(`${CRM_AL_BASE}/api/v1/models`, {
    headers: authHeaders(),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.message || `HTTP ${resp.status}`);
  return json;
}

/**
 * Usage stats.
 * @returns {Promise<object>}
 */
export async function crmAlUsage() {
  if (!CRM_AL_KEY) throw new Error("CRM_AL_API_KEY not set");
  const resp = await fetch(`${CRM_AL_BASE}/api/v1/usage`, {
    headers: authHeaders(),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.message || `HTTP ${resp.status}`);
  return json;
}

/**
 * Daily usage breakdown.
 * @returns {Promise<object>}
 */
export async function crmAlUsageDaily() {
  if (!CRM_AL_KEY) throw new Error("CRM_AL_API_KEY not set");
  const resp = await fetch(`${CRM_AL_BASE}/api/v1/usage/daily`, {
    headers: authHeaders(),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.message || `HTTP ${resp.status}`);
  return json;
}

/**
 * Check if key is configured.
 */
export function crmAlIsConfigured() {
  return Boolean(CRM_AL_KEY);
}

/**
 * Format error for user display.
 */
export function crmAlErrorMessage(err) {
  if (!err) return "Произошла ошибка. Попробуйте позже.";
  if (err.status === 402) return err.message || "Недостаточно средств на балансе API-ключа.";
  if (err.status === 401) return "API-ключ недействителен или отключён.";
  if (err.status === 403) return "Запрос не разрешён для этого ключа.";
  if (err.status === 429) return "Слишком много запросов. Подождите и повторите.";
  if (err.status === 502) return "Модели временно недоступны. Повторите позже.";
  if (err.message) return err.message;
  return "Произошла ошибка. Попробуйте позже.";
}
