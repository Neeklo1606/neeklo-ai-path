import type { CmsPage } from "@/lib/cms-api";
import { mediaPublicUrlMap, resolveImageDetailed } from "@/lib/cms-media";

export type ServiceItem = {
  id: string;
  /** Resolved from `images.icon` / legacy + page.media */
  iconSrc: string;
  iconMissing?: boolean;
  /** Optional cover from `images.cover` */
  coverSrc?: string;
  coverMissing?: boolean;
  name: unknown;
  badge?: string;
  badgeColor?: string;
  priceFrom: number;
  days: number;
  /** Localized display lines from CMS (replaces hardcoded price/duration copy). */
  priceLine?: unknown;
  durationLine?: unknown;
  shortDesc: unknown;
  includes: string[];
  tags: string[];
};

type RawService = Record<string, unknown>;

function normalizeService(raw: RawService, idx: number, mediaById: Map<string, string>): ServiceItem {
  const id = typeof raw.id === "string" ? raw.id : `s-${idx}`;
  const icon = resolveImageDetailed(raw, "icon", mediaById);
  const cover = resolveImageDetailed(raw, "cover", mediaById);
  const iconSrc = icon.url;
  const priceFrom = typeof raw.priceFrom === "number" ? raw.priceFrom : Number(raw.priceFrom) || 0;
  const days = typeof raw.days === "number" ? raw.days : Number(raw.days) || 0;
  const includes = Array.isArray(raw.includes) ? raw.includes.filter((x): x is string => typeof x === "string") : [];
  const tags = Array.isArray(raw.tags) ? raw.tags.filter((x): x is string => typeof x === "string") : [];
  return {
    id,
    iconSrc,
    iconMissing: icon.missing,
    coverSrc: cover.url || undefined,
    coverMissing: cover.missing,
    name: raw.name,
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
    badgeColor: typeof raw.badgeColor === "string" ? raw.badgeColor : undefined,
    priceFrom,
    days,
    priceLine: raw.priceLine,
    durationLine: raw.durationLine,
    shortDesc: raw.shortDesc,
    includes,
    tags,
  };
}

function blocksArray(page: CmsPage | null | undefined): unknown[] | null {
  const b = page?.blocks;
  if (!b || !Array.isArray(b)) return null;
  return b;
}

export function parseServicesGrid(page: CmsPage | null | undefined): ServiceItem[] | null {
  const blocks = blocksArray(page);
  if (!blocks?.length) return null;
  const mediaById = mediaPublicUrlMap(page);
  for (const b of blocks) {
    if (typeof b !== "object" || b === null) continue;
    const type = (b as { type?: string }).type;
    if (type !== "services_grid" && type !== "services") continue;
    const rawItems = (b as { items?: RawService[] }).items;
    if (!Array.isArray(rawItems) || !rawItems.length) return null;
    return rawItems.map((row, i) => normalizeService(row, i, mediaById));
  }
  return null;
}

export type ChatProductCard = { type: "product"; title: string; price: string; days: string; desc: string };
export type ChatScriptStep = string | ChatProductCard | null;

export type ChatScriptsBlock = {
  type: "chat_scripts";
  welcomeMessage?: string;
  chips?: string[];
  scripts?: Record<string, ChatScriptStep[]>;
};

export function parseChatScripts(page: CmsPage | null | undefined): ChatScriptsBlock | null {
  const blocks = blocksArray(page);
  if (!blocks?.length) return null;
  for (const b of blocks) {
    if (typeof b === "object" && b !== null && (b as ChatScriptsBlock).type === "chat_scripts") {
      return b as ChatScriptsBlock;
    }
  }
  return null;
}

export type LegalEntry = { title: string; body: string };

export function parseLegalDocs(page: CmsPage | null | undefined): Record<string, LegalEntry> | null {
  const b = page?.blocks?.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === "legal_docs") as
    | { entries?: Record<string, LegalEntry> }
    | undefined;
  return b?.entries && typeof b.entries === "object" ? b.entries : null;
}

export type CaseItem = {
  name: unknown;
  tag: string;
  tagLabel: unknown;
  result: unknown;
  /** Resolved from `images.cover` + page.media */
  coverUrl?: string;
  coverMissing?: boolean;
  /** Optional `images.logo` */
  logoUrl?: string;
  logoMissing?: boolean;
};

export function parseCasesList(page: CmsPage | null | undefined): { filters?: Array<{ key: string; label: unknown }>; items?: CaseItem[] } | null {
  const blocks = blocksArray(page);
  if (!blocks?.length) return null;
  const b = blocks.find(
    (x) => typeof x === "object" && x !== null && ["cases_list", "cases"].includes((x as { type?: string }).type || ""),
  ) as { filters?: Array<{ key: string; label: unknown }>; items?: Record<string, unknown>[] } | undefined;
  if (!b?.items?.length) return null;
  if (!Array.isArray(b.filters) || !b.filters.length) return null;
  const mediaById = mediaPublicUrlMap(page);
  const items: CaseItem[] = b.items.map((row) => {
    const cover = resolveImageDetailed(row as Record<string, unknown>, "cover", mediaById);
    const logo = resolveImageDetailed(row as Record<string, unknown>, "logo", mediaById);
    return {
      name: row.name,
      tag: typeof row.tag === "string" ? row.tag : "all",
      tagLabel: row.tagLabel,
      result: row.result,
      coverUrl: cover.url || undefined,
      coverMissing: cover.missing,
      logoUrl: logo.url || undefined,
      logoMissing: logo.missing,
    };
  });
  return { filters: b.filters, items };
}

export type WorkItem = {
  id?: number;
  cat?: unknown;
  title?: unknown;
  result?: unknown;
  tags?: string[];
  bg?: string;
  emoji?: string;
  filterKey?: string;
  /** Resolved from `images.cover` + page.media */
  coverUrl?: string;
  coverMissing?: boolean;
};

export function parseWorksGrid(page: CmsPage | null | undefined): { items?: WorkItem[]; filterTabs?: Array<{ key: string; label: unknown }> } | null {
  const blocks = blocksArray(page);
  if (!blocks?.length) return null;
  const b = blocks.find(
    (x) => typeof x === "object" && x !== null && ["works_grid", "works"].includes((x as { type?: string }).type || ""),
  ) as { items?: Record<string, unknown>[]; filterTabs?: Array<{ key: string; label: unknown }> } | undefined;
  if (!b?.items?.length) return null;
  if (!Array.isArray(b.filterTabs) || !b.filterTabs.length) return null;
  const mediaById = mediaPublicUrlMap(page);
  const items: WorkItem[] = b.items.map((row) => {
    const img = resolveImageDetailed(row as Record<string, unknown>, "cover", mediaById);
    const coverUrl = img.url || undefined;
    const id = typeof row.id === "number" ? row.id : Number(row.id);
    return {
      id: Number.isFinite(id) ? id : undefined,
      cat: row.cat,
      title: row.title,
      result: row.result,
      tags: Array.isArray(row.tags) ? row.tags.filter((t): t is string => typeof t === "string") : undefined,
      bg: typeof row.bg === "string" ? row.bg : undefined,
      emoji: typeof row.emoji === "string" ? row.emoji : undefined,
      filterKey: typeof row.filterKey === "string" ? row.filterKey : undefined,
      coverUrl: coverUrl || undefined,
      coverMissing: img.missing,
    };
  });
  return { items, filterTabs: b.filterTabs };
}

export type ProjectCmsItem = {
  id: string;
  emoji: string;
  title: string;
  service: string;
  status: string;
  price: number;
  paid: number;
  deadline: string;
  progress: number;
  manager: string;
  brief: string;
  tasks: { title: string; done: boolean }[];
  timeline: string[];
  currentStep: number;
};

export function parseProjectsCms(page: CmsPage | null | undefined): { items: ProjectCmsItem[] } | null {
  const blocks = blocksArray(page);
  if (!blocks?.length) return null;
  const b = blocks.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === "projects_data") as
    | { items?: ProjectCmsItem[] }
    | undefined;
  if (!b || !Array.isArray(b.items)) return null;
  return { items: b.items };
}
