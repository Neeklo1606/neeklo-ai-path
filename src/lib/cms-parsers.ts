import type { CmsPage } from "@/lib/cms-api";

export type ServiceItem = {
  id: string;
  iconAsset: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  priceFrom: number;
  days: number;
  shortDesc: string;
  includes: string[];
  tags: string[];
};

export function parseServicesGrid(page: CmsPage | null | undefined): ServiceItem[] | null {
  if (!page?.blocks?.length) return null;
  for (const b of page.blocks) {
    if (typeof b === "object" && b !== null && (b as { type?: string }).type === "services_grid") {
      const items = (b as { items?: ServiceItem[] }).items;
      return Array.isArray(items) ? items : null;
    }
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
  if (!page?.blocks?.length) return null;
  for (const b of page.blocks) {
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

export type CaseItem = { name: unknown; tag: string; tagLabel: unknown; result: unknown };

export function parseCasesList(page: CmsPage | null | undefined): { filters?: Array<{ key: string; label: unknown }>; items?: CaseItem[] } | null {
  const b = page?.blocks?.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === "cases_list") as
    | { filters?: Array<{ key: string; label: unknown }>; items?: CaseItem[] }
    | undefined;
  if (!b?.items?.length) return null;
  return b;
}

export type WorkItem = {
  id?: number;
  cat?: unknown;
  title?: unknown;
  result?: unknown;
  tags?: string[];
  bg?: string;
  emoji?: string;
  /** Tab key from works_grid.filterTabs (e.g. ai, sites); omit or "all" shows in all filters */
  filterKey?: string;
};

export function parseWorksGrid(page: CmsPage | null | undefined): { items?: WorkItem[]; filterTabs?: Array<{ key: string; label: unknown }> } | null {
  const b = page?.blocks?.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === "works_grid") as
    | { items?: WorkItem[]; filterTabs?: Array<{ key: string; label: unknown }> }
    | undefined;
  if (!b?.items?.length) return null;
  return b;
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
  const b = page?.blocks?.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === "projects_data") as
    | { items?: ProjectCmsItem[] }
    | undefined;
  if (!b?.items) return { items: [] };
  return { items: b.items };
}
