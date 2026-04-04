/** CMS localized field: string or `{ ru, en }`. */

export type LocaleValue = string | { ru?: string; en?: string };

export function getLocalePair(v: unknown): { ru: string; en: string } {
  if (v == null) return { ru: "", en: "" };
  if (typeof v === "string") return { ru: v, en: v };
  if (typeof v === "object" && v !== null && ("ru" in v || "en" in v)) {
    const o = v as Record<string, string>;
    return { ru: o.ru ?? "", en: o.en ?? "" };
  }
  return { ru: String(v), en: String(v) };
}

export function setLocalePair(ru: string, en: string): { ru: string; en: string } {
  return { ru, en };
}
