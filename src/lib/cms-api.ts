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
  messages: { role: string; content: string }[];
  /** Persist transcript to CRM when set */
  chatId?: string;
}): Promise<{ reply: string }> {
  return cmsJson("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export type CrmTranscriptEntry = {
  role: string;
  content: string;
  at?: string;
};

/** История сообщений для возврата пользователя на /chat (без авторизации) */
export async function fetchChatTranscript(
  chatId: string,
): Promise<{ id: string; messages: CrmTranscriptEntry[] } | null> {
  const path = `/crm/chat-transcript/${encodeURIComponent(chatId)}`;
  const res = await fetch(`${CMS_BASE}${path}`);
  if (res.status === 404) return null;
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    const err = (body as { error?: string })?.error || res.statusText;
    throw new Error(typeof err === "string" ? err : "Transcript failed");
  }
  return body as { id: string; messages: CrmTranscriptEntry[] };
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
  /** Server: exists an active assistant (single-assistant mode). */
  hasAssistant: boolean;
};

export async function fetchChatBootstrap(locale = "ru"): Promise<ChatBootstrap> {
  return cmsJson<ChatBootstrap>(`/chat/bootstrap?locale=${encodeURIComponent(locale)}`);
}

/** Public CMS settings (e.g. brand logo URLs from DB). */
export async function fetchPublicSettings(): Promise<Record<string, unknown>> {
  return cmsJson<Record<string, unknown>>("/settings/public");
}

// ─── Commercial Offers (КП) ────────────────────────────────────────────────

export type KpStat = { num: string; unit: string; label: string };
export type KpProblemItem = { num: string; title: string; text: string };
export type KpSolutionStep = { num: string; title: string; text: string };
export type KpPackageItem = {
  name: string; subtitle: string; price: string; price_sub: string;
  featured: boolean; badge: string; cta: string; features: string[];
};
export type KpTimelineItem = { week: string; title: string; text: string };
export type KpWhyItem = { num: string; title: string; text: string };

export type KpHeroData = {
  title_line_1: string; title_line_2: string;
  subtitle: string; stats: KpStat[];
};
export type KpProblemsData = { title_1: string; title_2: string; items: KpProblemItem[] };
export type KpSolutionData = { title_1: string; title_2: string; lead: string; steps: KpSolutionStep[] };
export type KpPackagesData = { title_1: string; title_2: string; items: KpPackageItem[] };
export type KpIncludedData = { title_1: string; title_2: string; yes: string[]; no: string[] };
export type KpTimelineData = { title_1: string; title_2: string; items: KpTimelineItem[] };
export type KpNextPhaseData = {
  title_1: string; title_2: string; lead_1: string; lead_2: string;
  text: string; items: string[]; price: string; price_label: string;
};
export type KpWhyUsData = { title_1: string; title_2: string; items: KpWhyItem[] };
export type KpCtaData = { title_1: string; title_2: string; text: string; button_label: string; button_url: string };
export type KpContactsData = {
  telegram_handle: string; telegram_url: string;
  email: string; site: string; site_url: string;
};

export type CommercialOffer = {
  id: string;
  slug: string;
  clientName: string;
  clientIndustry: string;
  kpNumber: string;
  expiresDays: number;
  published: boolean;
  heroData: KpHeroData;
  problemsData: KpProblemsData;
  solutionData: KpSolutionData;
  packagesData: KpPackagesData;
  includedData: KpIncludedData;
  timelineData: KpTimelineData;
  nextPhaseData: KpNextPhaseData;
  whyUsData: KpWhyUsData;
  ctaData: KpCtaData;
  contactsData: KpContactsData;
  viewsCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchKp(slug: string): Promise<CommercialOffer> {
  return cmsJson<CommercialOffer>(`/api/kp/${encodeURIComponent(slug)}`);
}

export async function fetchKpList(): Promise<Omit<CommercialOffer, "heroData"|"problemsData"|"solutionData"|"packagesData"|"includedData"|"timelineData"|"nextPhaseData"|"whyUsData"|"ctaData"|"contactsData">[]> {
  return cmsJson("/api/kp");
}
