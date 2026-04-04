/** Maps legacy / alias block types to editor id (single visual editor per family). */
export const BLOCK_EDITOR_KEYS: Record<string, string> = {
  services_preview: "services",
  services_row: "services",
  cases_preview: "cases",
  works_preview: "cases",
  cases: "cases",
  how_steps: "steps",
  cta_simple: "cta",
};

export function editorKeyForBlock(block: unknown): string {
  const t = typeof block === "object" && block !== null && "type" in block ? String((block as { type?: string }).type || "") : "";
  return BLOCK_EDITOR_KEYS[t] || t || "unknown";
}

export const ADDABLE_BLOCK_TYPES: { type: string; label: string }[] = [
  { type: "hero", label: "Hero" },
  { type: "services", label: "Services (продукты)" },
  { type: "cases", label: "Cases (превью работ)" },
  { type: "reviews", label: "Reviews" },
  { type: "steps", label: "Steps (как это работает)" },
  { type: "cta", label: "CTA" },
  { type: "legal_docs", label: "Legal docs" },
  { type: "works_grid", label: "Works grid" },
  { type: "cases_list", label: "Cases list" },
  { type: "services_grid", label: "Services grid" },
  { type: "chat_config", label: "Chat config" },
  { type: "projects_data", label: "Projects data" },
];

export const BLOCK_LABELS: Record<string, string> = Object.fromEntries(ADDABLE_BLOCK_TYPES.map((x) => [x.type, x.label]));

/** Short hints under the block title in the page editor (RU). */
export const BLOCK_EDITOR_HELP: Record<string, string> = {
  hero: "Это главный экран сайта (заголовок + кнопки).",
  services: "Список ваших услуг или продуктов.",
  cases: "Примеры работ / кейсы для главной.",
};

export function defaultBlock(type: string): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        type: "hero",
        title: { ru: "", en: "" },
        subtitle: { ru: "", en: "" },
        images: {},
        ctaLabel: { ru: "", en: "" },
        secondaryLabel: { ru: "", en: "" },
        showScrollChevron: true,
      };
    case "services":
      return {
        type: "services",
        sectionTitle: { ru: "", en: "" },
        items: [],
      };
    case "cases":
      return {
        type: "cases",
        sectionTitle: { ru: "", en: "" },
        seeAllLabel: { ru: "", en: "" },
        seeAllPath: "/works",
        itemNavigatePath: "/cases",
        mobileSeeAllLabel: { ru: "", en: "" },
        items: [],
      };
    case "reviews":
      return {
        type: "reviews",
        title: { ru: "", en: "" },
        items: [],
        avitoUrl: "",
        avitoLabel: { ru: "", en: "" },
      };
    case "steps":
      return {
        type: "steps",
        title: { ru: "", en: "" },
        steps: [],
        footerNote: { ru: "", en: "" },
      };
    case "cta":
      return {
        type: "cta",
        title: { ru: "", en: "" },
        subtitle: { ru: "", en: "" },
        buttonLabel: { ru: "", en: "" },
        buttonHref: "/chat",
      };
    case "legal_docs":
      return { type: "legal_docs", entries: {} };
    case "works_grid":
      return { type: "works_grid", filterTabs: [], items: [] };
    case "cases_list":
      return { type: "cases_list", filters: [], items: [] };
    case "services_grid":
      return { type: "services_grid", items: [] };
    case "chat_config":
      return { type: "chat_config", welcomeMessage: "" };
    case "projects_data":
      return { type: "projects_data", items: [] };
    default:
      return { type: "unknown", note: "unsupported" };
  }
}
