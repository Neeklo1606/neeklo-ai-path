/**
 * Unified AI chat — prefers OpenRouter (fast), falls back to crm-al.
 */
import { crmAlChat, crmAlIsConfigured, crmAlErrorMessage } from "./crm-al.service.mjs";
import { openRouterChat, openRouterIsConfigured, openRouterErrorMessage } from "./openrouter.service.mjs";

/**
 * @param {Array<{role:string,content:string}>} messages
 * @param {object} [opts]
 */
export async function aiChat(messages, opts = {}) {
  if (openRouterIsConfigured()) {
    return openRouterChat(messages, opts);
  }
  return crmAlChat(messages, opts);
}

export function aiChatIsConfigured() {
  return openRouterIsConfigured() || crmAlIsConfigured();
}

export function aiChatErrorMessage(err) {
  if (openRouterIsConfigured()) return openRouterErrorMessage(err);
  return crmAlErrorMessage(err);
}

export function aiChatProvider() {
  if (openRouterIsConfigured()) return "openrouter";
  if (crmAlIsConfigured()) return "crm-al";
  return "none";
}
