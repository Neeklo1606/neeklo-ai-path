/** Public CMS API (no admin secrets). Admin mutations use adminApi from @/lib/admin-api */

export const CMS_BASE = (import.meta.env.VITE_CMS_API_BASE as string | undefined) || "/cms-api";

export async function cmsJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CMS_BASE}${path.startsWith("/") ? path : `/${path}`}`, init);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    const err = (body as { error?: string })?.error || res.statusText;
    throw new Error(err);
  }
  return body as T;
}

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  locale: string;
  blocks: unknown[];
  published: boolean;
  /** Draft pages are hidden from public slug API when true. */
  is_draft?: boolean;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  /** Referenced `cms_media` rows for all `imageId` + `images` values in blocks/meta (public + admin GET page). */
  media?: CmsMedia[];
};

export type CmsMedia = {
  id: string;
  storage_path: string;
  public_url: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  mime: string | null;
  alt: string | null;
  width?: number | null;
  height?: number | null;
  thumb_width?: number | null;
  thumb_height?: number | null;
  created_at: string;
  /** Bumps when row or files change (versioning / cache busting). */
  updated_at?: string;
  deleted_at?: string | null;
  /** Pages referencing this media via `imageId` / `images` (MediaUsage). */
  usage_count?: number;
};

export type CmsPageVersionSummary = {
  id: string;
  page_id: string;
  created_at: string;
  /** true = autosave interval snapshot */
  is_auto?: boolean;
};

export type CmsAssistant = {
  id: string;
  name: string;
  api_key_prefix: string;
  provider: string;
  base_url: string | null;
  model: string;
  embed_model?: string;
  /** Ollama sampling 0–2 */
  temperature?: number;
  system_prompt: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CmsSetting = {
  key: string;
  value: unknown;
  is_public: boolean;
  updated_at: string;
};

export async function chatComplete(body: {
  apiKey: string;
  messages: { role: string; content: string }[];
  assistantId?: string;
  /** Persist transcript to CRM when set */
  chatId?: string;
}): Promise<{ reply: string }> {
  return cmsJson("/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Public: create or resume anonymous CRM chat session */
export async function createCrmChatSession(existingChatId?: string | null): Promise<{ chatId: string }> {
  return cmsJson("/crm/chat-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: existingChatId || undefined }),
  });
}

export async function cmsPageBySlug(slug: string, locale = "ru"): Promise<CmsPage> {
  const res = await fetch(`${CMS_BASE}/pages/slug/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    const err = (body as { error?: string; hint?: string })?.error || res.statusText;
    const hint = (body as { hint?: string }).hint;
    const msg = [typeof err === "string" ? err : "Request failed", hint].filter(Boolean).join(" — ");
    throw new Error(msg);
  }
  return body as CmsPage;
}

export type ChatBootstrap = {
  /** From CMS `chat` page `chat_config` / meta; null if not configured. */
  welcomeMessage: string | null;
  /** From CMS `chat` page title (document title). */
  pageTitle: string | null;
  /** From CMS `chat` page meta `chatHeaderTitle` (fallback: page title). */
  headerTitle: string | null;
  /** From CMS `chat` page meta `chatStatusLabel`. */
  statusLabel: string | null;
  /** From CMS `chat` page meta `chatInputPlaceholder`. */
  inputPlaceholder: string | null;
  siteApiKey: string | null;
};

export async function fetchChatBootstrap(locale = "ru"): Promise<ChatBootstrap> {
  return cmsJson<ChatBootstrap>(`/chat/bootstrap?locale=${encodeURIComponent(locale)}`);
}

/** Public CMS settings (e.g. brand logo URLs from DB). */
export async function fetchPublicSettings(): Promise<Record<string, unknown>> {
  return cmsJson<Record<string, unknown>>("/settings/public");
}
