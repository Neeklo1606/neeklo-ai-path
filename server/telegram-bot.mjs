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
    return json;
  } catch {
    return { ok: false };
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

/** Get all approved chat IDs for notifications. */
export async function getApprovedTgChats() {
  const val = await getSetting(APPROVED_CHATS_KEY);
  return Array.isArray(val) ? val : [];
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
  const results = await Promise.allSettled(
    chats.map((chatId) => sendTgMessage(chatId, text, extra)),
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
  const preview = (msgText || "").slice(0, 300);
  const text = `📬 <b>Новое сообщение Avito</b>\n\nАгент: <code>${agentId || "—"}</code>\nЧат: <code>${chatId || "—"}</code>\n\n${preview}\n\nПанель: https://neeklo.ru/admin/avito/chats`;
  return notifyAll(text);
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
