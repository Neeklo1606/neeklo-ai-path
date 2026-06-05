/** Pure helper functions for Clero CRM integration. No Prisma/fetch deps. */

export const NIKITA_AVITO_AUTHOR_ID_DEFAULT = "104436874";
export const CLERO_ENDPOINT = "https://neeklo.ru/api/clero/avito-webhook";
export const CLERO_SENT_SETTING_KEY = "integrations.avito.clero_sent";

export function isClientAvitoMessage(authorId) {
  const ownerId = process.env.NIKITA_AVITO_AUTHOR_ID || NIKITA_AVITO_AUTHOR_ID_DEFAULT;
  return String(authorId) !== ownerId;
}

export function buildCleroPayload(chatId, authorId, messageText) {
  return {
    chatid: `avito${chatId}`,
    clientname: String(authorId),
    message: messageText,
    source: "avito",
    timestamp: new Date().toISOString(),
  };
}
