/** Pure helper functions for Clero CRM integration. No Prisma/fetch deps. */

export const NIKITA_AVITO_AUTHOR_ID_DEFAULT = "104436874";
export const CLERO_ENDPOINT = process.env.CLERO_ENDPOINT || "https://neeklo.ru/api/clero/avito-webhook";
export const CLERO_SENT_SETTING_KEY = "integrations.avito.clero_sent";

export function isClientAvitoMessage(authorId) {
  const ownerId = process.env.NIKITA_AVITO_AUTHOR_ID || NIKITA_AVITO_AUTHOR_ID_DEFAULT;
  return String(authorId) !== ownerId;
}

export function buildCleroPayload(chatId, authorId, messageText) {
  const sourceId = Number(process.env.CLERO_SOURCE_ID) || 176;
  const apiToken = String(process.env.CLEROAPITOKEN || "");
  const clientName = `Avito user ${authorId}`;
  return {
    sourceid: sourceId,
    apitoken: apiToken,
    sessionid: `avito${chatId}`,
    sessionname: clientName,
    text: messageText,
    metadata: {
      clientname: clientName,
      phone: "",
    },
  };
}

export async function sendToCleroRaw(chatId, authorId, messageText, fetchFn = fetch) {
  const payload = buildCleroPayload(chatId, authorId, messageText);
  const resp = await fetchFn(CLERO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`Clero ${resp.status}`);
  return { ok: true, status: resp.status };
}
