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
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CmsMedia = {
  id: string;
  storage_path: string;
  public_url: string;
  mime: string | null;
  alt: string | null;
  created_at: string;
};

export type CmsAssistant = {
  id: string;
  name: string;
  api_key_prefix: string;
  provider: string;
  base_url: string | null;
  model: string;
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
}): Promise<{ reply: string }> {
  return cmsJson("/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cmsPageBySlug(slug: string, locale = "ru"): Promise<CmsPage | null> {
  const res = await fetch(`${CMS_BASE}/pages/slug/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json() as Promise<CmsPage>;
}

export type ChatBootstrap = {
  welcomeMessage: string;
  siteApiKey: string | null;
};

export async function fetchChatBootstrap(locale = "ru"): Promise<ChatBootstrap> {
  return cmsJson<ChatBootstrap>(`/chat/bootstrap?locale=${encodeURIComponent(locale)}`);
}
