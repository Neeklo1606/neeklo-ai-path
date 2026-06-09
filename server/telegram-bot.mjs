/**
 * Telegram Bot integration for neeklo CRM.
 * Token: stored in TG_BOT_TOKEN env var.
 *
 * Features:
 *  - Webhook handler (POST /tg/webhook)
 *  - /start — welcome message
 *  - /admin — create access request stored in cms_settings
 *  - sendTgMessage(chatId, text) — send message to any chat
 *  - notifyAll(text) — broadcast to all approved TG admins
 *  - notifyNewLead / notifyNewAvitoMessage / notifyNewReview
 */

const TG_TOKEN = () => process.env.TG_BOT_TOKEN || "";
const TG_BASE  = () => `https://api.telegram.org/bot${TG_TOKEN()}`;

const ADMIN_REQUESTS_KEY = "tg.admin_requests";
const APPROVED_CHATS_KEY = "tg.approved_chats";

// ─── Telegram HTTP helpers ────────────────────────────────────────────────────

export async function sendTgMessage(chatId, text, extra = {}) {
  const token = TG_TOKEN();
  if (!token || !chatId) return { ok: false };
  try {
    const resp = await fetch(`${TG_BASE()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
      signal: AbortSignal.timeout(8_000),
    });
    const json = await resp.json().catch(() => ({}));
    if (!json?.ok) {
      console.warn(`[tg-bot] sendTgMessage failed chatId=${chatId}:`, json?.description || json);
    }
    return json;
  } catch (err) {
    console.warn(`[tg-bot] sendTgMessage error chatId=${chatId}:`, err?.message || err);
    return { ok: false, description: err?.message || "network_error" };
  }
}

/** Register webhook URL with Telegram. */
export async function setTgWebhook(url) {
  const token = TG_TOKEN();
  if (!token) throw new Error("TG_BOT_TOKEN not set");
  const resp = await fetch(`${TG_BASE()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowed_updates: ["message", "callback_query"] }),
  });
  return resp.json().catch(() => ({}));
}

/** Get webhook info. */
export async function getTgWebhookInfo() {
  const token = TG_TOKEN();
  if (!token) throw new Error("TG_BOT_TOKEN not set");
  const resp = await fetch(`${TG_BASE()}/getWebhookInfo`);
  return resp.json().catch(() => ({}));
}

// ─── Persistent storage helpers (uses prisma CmsSetting) ─────────────────────

let _prisma = null;
export function initTgBot(prismaClient) {
  _prisma = prismaClient;
}

async function getSetting(key) {
  if (!_prisma) return null;
  const row = await _prisma.cmsSetting.findUnique({ where: { key } }).catch(() => null);
  return row?.value ?? null;
}

async function setSetting(key, value) {
  if (!_prisma) return;
  await _prisma.cmsSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/** Get all pending/approved admin requests. */
export async function getTgAdminRequests() {
  const val = await getSetting(ADMIN_REQUESTS_KEY);
  return Array.isArray(val) ? val : [];
}

/** Escape text for Telegram HTML parse_mode. */
export function escapeTgHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Get all approved chat IDs for notifications (synced from admin_requests). */
export async function getApprovedTgChats() {
  const val = await getSetting(APPROVED_CHATS_KEY);
  const fromSetting = Array.isArray(val) ? val.map(String) : [];
  const requests = await getTgAdminRequests();
  const fromApproved = requests
    .filter((r) => r.status === "approved")
    .map((r) => String(r.chatId));
  const merged = [...new Set([...fromSetting, ...fromApproved])];
  if (merged.length !== fromSetting.length) {
    await setSetting(APPROVED_CHATS_KEY, merged);
  }
  return merged;
}

/** Add or update an admin request. */
async function upsertAdminRequest(chatId, username, firstName) {
  const requests = await getTgAdminRequests();
  const existing = requests.findIndex((r) => r.chatId === chatId);
  const entry = {
    chatId: String(chatId),
    username: username || "",
    firstName: firstName || "",
    status: existing >= 0 ? requests[existing].status : "pending",
    createdAt: existing >= 0 ? requests[existing].createdAt : new Date().toISOString(),
  };
  if (existing >= 0) {
    requests[existing] = entry;
  } else {
    requests.push(entry);
  }
  await setSetting(ADMIN_REQUESTS_KEY, requests);
  return entry;
}

/** Approve an admin request — add chatId to approved list. */
export async function approveTgAdminRequest(chatId) {
  const requests = await getTgAdminRequests();
  const idx = requests.findIndex((r) => r.chatId === String(chatId));
  if (idx < 0) throw new Error("Заявка не найдена");
  requests[idx].status = "approved";
  requests[idx].approvedAt = new Date().toISOString();
  await setSetting(ADMIN_REQUESTS_KEY, requests);

  // Add to approved chats
  const approved = await getApprovedTgChats();
  if (!approved.includes(String(chatId))) {
    approved.push(String(chatId));
    await setSetting(APPROVED_CHATS_KEY, approved);
  }

  await sendTgMessage(
    chatId,
    "✅ <b>Доступ одобрен!</b>\n\nВы будете получать уведомления:\n— Новые лиды\n— Сообщения от клиентов Avito\n— Новые отзывы\n\nОткройте панель: https://neeklo.ru/admin",
  );
  return requests[idx];
}

/** Reject an admin request. */
export async function rejectTgAdminRequest(chatId) {
  const requests = await getTgAdminRequests();
  const idx = requests.findIndex((r) => r.chatId === String(chatId));
  if (idx < 0) throw new Error("Заявка не найдена");
  requests[idx].status = "rejected";
  await setSetting(ADMIN_REQUESTS_KEY, requests);

  await sendTgMessage(chatId, "❌ Ваша заявка на доступ отклонена администратором.");
  return requests[idx];
}

/** Remove from approved chats. */
export async function revokeTgAccess(chatId) {
  const approved = await getApprovedTgChats();
  const filtered = approved.filter((id) => id !== String(chatId));
  await setSetting(APPROVED_CHATS_KEY, filtered);

  const requests = await getTgAdminRequests();
  const idx = requests.findIndex((r) => r.chatId === String(chatId));
  if (idx >= 0) {
    requests[idx].status = "revoked";
    await setSetting(ADMIN_REQUESTS_KEY, requests);
  }
}

// ─── Broadcast notifications ──────────────────────────────────────────────────

/** Send message to all approved TG admins. */
export async function notifyAll(text, extra = {}) {
  const chats = await getApprovedTgChats();
  if (!chats.length) {
    console.warn("[tg-bot] notifyAll: no approved chats");
    return [];
  }
  const results = await Promise.allSettled(
    chats.map(async (chatId) => {
      const res = await sendTgMessage(chatId, text, extra);
      if (!res?.ok) {
        console.warn(`[tg-bot] notify failed chatId=${chatId}:`, res?.description || res);
      }
      return res;
    }),
  );
  return results;
}

/** New lead notification. */
export async function notifyNewLead(lead) {
  const name = lead.name || "Без имени";
  const phone = lead.phone ? `\n📞 ${lead.phone}` : "";
  const source = lead.source ? `\nИсточник: ${lead.source}` : "";
  const text = `🎯 <b>Новый лид</b>\n\n👤 ${name}${phone}${source}\n\nПанель: https://neeklo.ru/admin/chats`;
  return notifyAll(text);
}

/** New Avito message notification. */
export async function notifyNewAvitoMessage({ chatId, authorId, text: msgText, agentId }) {
  const preview = escapeTgHtml((msgText || "").slice(0, 400));
  const time = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" });
  const safeChatId = escapeTgHtml(chatId || "—");
  const text = `📬 <b>Новое сообщение Avito</b> [${time}]\n\nЧат: <code>${safeChatId}</code>\n\n💬 ${preview}\n\n👉 <a href="https://neeklo.ru/admin/avito/chats">Открыть панель</a>`;
  return notifyAll(text, { parse_mode: "HTML" });
}

// ─── Error / System Notifications ────────────────────────────────────────────

/** Throttle: don't spam TG with the same error message. */
const _errorCooldowns = new Map();
function _isThrottled(key, cooldownMs = 60_000) {
  const last = _errorCooldowns.get(key) || 0;
  if (Date.now() - last < cooldownMs) return true;
  _errorCooldowns.set(key, Date.now());
  return false;
}

/**
 * Send a server error/critical event to TG.
 * Throttled to 1 notification per error key per minute to prevent spam.
 */
export async function notifyServerError({ title, message, source, stack } = {}) {
  const key = `${title}|${(message || "").slice(0, 80)}`;
  if (_isThrottled(key, 60_000)) return;
  const src = source ? ` [${source}]` : "";
  const msgPreview = (message || "").slice(0, 400);
  const stackPreview = stack ? `\n<pre>${String(stack).slice(0, 500)}</pre>` : "";
  const text = `🔴 <b>Ошибка сервера${src}</b>\n\n${title ? `<b>${title}</b>\n` : ""}${msgPreview}${stackPreview}\n\n⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** Agent was disabled — inform manager to reply manually. */
export async function notifyAgentDisabledMessage({ chatId, text, agentId }) {
  const preview = (text || "").slice(0, 300);
  const msg = `💬 <b>Новое сообщение Avito (агент выключен)</b>\n\nЧат: <code>${chatId || "—"}</code>\nАгент: <code>${agentId || "—"}</code>\n\nСообщение: ${preview}\n\n⚠️ Ответьте клиенту вручную!\nПанель: https://neeklo.ru/admin/avito/chats`;
  return notifyAll(msg, { parse_mode: "HTML" });
}

/** Agent failed to generate reply — inform manager. */
export async function notifyAgentError({ chatId, clientText, error, agentId }) {
  const key = `agent-err|${chatId}`;
  if (_isThrottled(key, 120_000)) return;
  const preview = (clientText || "").slice(0, 200);
  const errStr = (error || "unknown error").slice(0, 300);
  const text = `⚠️ <b>Ошибка AI-агента</b>\n\nЧат: <code>${chatId || "—"}</code>\nАгент: <code>${agentId || "—"}</code>\n\nСообщение клиента: ${preview}\n\n❌ Ошибка: ${errStr}\n\n👉 Ответьте клиенту вручную!\nПанель: https://neeklo.ru/admin/avito/chats`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** Client left a phone number or contact — urgent alert. */
export async function notifyClientContact({ phone, clientText, chatId, source }) {
  const src = source === "test" ? "Тестовый чат" : `Avito чат <code>${chatId || "—"}</code>`;
  const preview = (clientText || "").slice(0, 200);
  const text = `📞 <b>Клиент оставил контакт!</b>\n\n📱 <b>${phone}</b>\n\n${src}\nСообщение: ${preview}\n\n👉 Перезвоните как можно скорее!\nПанель: https://neeklo.ru/admin/chats`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** Client wants to call / meet / go to Telegram — urgent alert. */
export async function notifyTransferIntent({ intent, clientText, chatId, source }) {
  const src = source === "test" ? "Тестовый чат" : `Avito чат <code>${chatId || "—"}</code>`;
  const preview = (clientText || "").slice(0, 200);
  const icons = { call: "📞", telegram: "💬", meet: "🤝", now: "⚡" };
  const icon = icons[intent] || "🔔";
  const labels = { call: "Хочет созвониться", telegram: "Хочет перейти в Telegram", meet: "Хочет встретиться", now: "Готов общаться сейчас" };
  const label = labels[intent] || "Готов к контакту";
  const text = `${icon} <b>${label}!</b>\n\n${src}\nСообщение: ${preview}\n\n👉 Свяжитесь с клиентом!\nПанель: https://neeklo.ru/admin/chats`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** Agent auto-reply notification. */
export async function notifyAgentReply({ chatId, clientText, replyText, agentId }) {
  const clientPreview = (clientText || "").slice(0, 200);
  const replyPreview = (replyText || "").slice(0, 300);
  const text = `🤖 <b>Агент ответил клиенту</b>\n\nАгент: <code>${agentId || "—"}</code>\nЧат: <code>${chatId || "—"}</code>\n\n<b>Клиент:</b> ${clientPreview}\n\n<b>Агент:</b> ${replyPreview}\n\nПанель: https://neeklo.ru/admin/avito/chats`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** New lead from Avito conversation. */
export async function notifyLeadCreatedFromAvito({ name, phone, intent, summary, chatId }) {
  const nameStr = name || "Имя не указано";
  const phoneStr = phone ? `\n📞 ${phone}` : "";
  const intentStr = intent ? `\n🎯 Интерес: ${intent}` : "";
  const summaryStr = summary ? `\n📝 ${summary}` : "";
  const chatStr = chatId ? `\nAvito чат: <code>${chatId}</code>` : "";
  const text = `🎯 <b>Новый лид с Avito</b>\n\n👤 ${nameStr}${phoneStr}${intentStr}${summaryStr}${chatStr}\n\nПанель: https://neeklo.ru/admin/chats`;
  return notifyAll(text, { parse_mode: "HTML" });
}

/** New review notification. */
export async function notifyNewReview({ author, rating, content }) {
  const stars = "⭐".repeat(Math.min(Number(rating) || 5, 5));
  const preview = (content || "").slice(0, 400);
  const text = `${stars} <b>Новый отзыв</b>\n\n👤 ${author || "Аноним"}\n\n${preview}`;
  return notifyAll(text);
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

/**
 * Handle incoming Telegram update.
 * @param {object} update — raw Telegram Update object
 */
export async function handleTgUpdate(update) {
  const message = update?.message;
  if (!message) return;

  const chatId   = message.chat?.id;
  const text     = (message.text || "").trim();
  const username = message.from?.username || "";
  const firstName = message.from?.first_name || "";

  if (!chatId) return;

  if (text === "/start") {
    await sendTgMessage(
      chatId,
      `👋 <b>Добро пожаловать в neeklo CRM!</b>\n\nКоманды:\n/admin — запросить доступ к уведомлениям`,
    );
    return;
  }

  if (text === "/admin") {
    const entry = await upsertAdminRequest(chatId, username, firstName);
    if (entry.status === "approved") {
      await sendTgMessage(
        chatId,
        "✅ У вас уже есть доступ к уведомлениям!\n\nПанель: https://neeklo.ru/admin",
      );
    } else if (entry.status === "pending") {
      await sendTgMessage(
        chatId,
        `📋 <b>Заявка отправлена!</b>\n\nВаш запрос на доступ к уведомлениям CRM принят.\nАдминистратор рассмотрит его в ближайшее время.\n\nID заявки: <code>${chatId}</code>`,
      );
    } else {
      // Reopen rejected request
      await upsertAdminRequest(chatId, username, firstName);
      await sendTgMessage(chatId, "📋 Новая заявка на доступ создана. Ожидайте одобрения.");
    }
    return;
  }

  if (text === "/status") {
    const requests = await getTgAdminRequests();
    const entry = requests.find((r) => r.chatId === String(chatId));
    if (!entry) {
      await sendTgMessage(chatId, "Заявка не найдена. Отправьте /admin чтобы запросить доступ.");
    } else {
      const statusText = { pending: "⏳ Ожидает одобрения", approved: "✅ Одобрено", rejected: "❌ Отклонено", revoked: "🚫 Отозван" };
      await sendTgMessage(chatId, `Статус вашей заявки: ${statusText[entry.status] || entry.status}`);
    }
    return;
  }
}
