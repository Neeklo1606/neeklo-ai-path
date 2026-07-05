/**
 * Единая связка кейсов ↔ услуг.
 * Теги кейсов = слаги услуг (web, ai-assistant, telegram, ai-video, education, consulting).
 * Используется:
 *  - на страницах услуг (секция «Наши работы»)
 *  - на /cases (фильтр-чипы по услугам)
 *  - в src/data/cases.ts (поле tags)
 */

export type ServiceSlug = "web" | "ai-assistant" | "telegram" | "ai-video" | "education" | "consulting";

/** Человекочитаемые названия услуг для чипов и подписей */
export const SERVICE_TAG_LABELS: Record<ServiceSlug, string> = {
  web: "Сайты",
  "ai-assistant": "AI-ассистенты",
  telegram: "Telegram",
  "ai-video": "AI-видео",
  education: "Обучение",
  consulting: "AI-консалтинг",
};

/**
 * Связка кейсов с услугами по slug кейса.
 * Ключи включают оба варианта slug (локальный id из cases.ts и slug из CMS-API),
 * т.к. они местами расходятся (bella vs bella-hasias).
 */
export const CASE_SERVICE_TAGS: Record<string, ServiceSlug[]> = {
  povuzam: ["web", "education"],
  batnorton: ["web"],
  damotors: ["telegram"],
  "ai-contracts": ["ai-assistant"],
  avangard31: ["web", "ai-assistant", "telegram"],
  bella: ["telegram", "ai-assistant"],
  "bella-hasias": ["telegram", "ai-assistant"],
  "ai-avito": ["ai-assistant", "consulting"],
  "ai-platform": ["ai-assistant"],
  svoikhleb: ["telegram"],
  "ai-video-business": ["ai-video"],
};

/** Теги услуг для кейса по его slug (пустой массив, если связки нет) */
export function serviceTagsFor(caseSlug: string): ServiceSlug[] {
  return CASE_SERVICE_TAGS[caseSlug] ?? [];
}

/** Человекочитаемые лейблы тегов кейса */
export function serviceTagLabelsFor(caseSlug: string): string[] {
  return serviceTagsFor(caseSlug).map((s) => SERVICE_TAG_LABELS[s]);
}
