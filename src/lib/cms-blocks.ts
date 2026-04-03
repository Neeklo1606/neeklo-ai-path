import type { CmsPage } from "@/lib/cms-api";

/** Localized string: plain string or `{ ru, en }`. */
export function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

/** Returns the first block with the given `type`, or null. */
export function getBlock<T extends { type?: string }>(page: CmsPage | null | undefined, type: string): T | null {
  if (!page?.blocks) return null;
  const b = page.blocks.find((x) => typeof x === "object" && x !== null && (x as { type?: string }).type === type);
  return (b as T) ?? null;
}

export function getBlockFirst<T extends { type?: string }>(page: CmsPage | null | undefined, types: string[]): T | null {
  for (const type of types) {
    const b = getBlock<T>(page, type);
    if (b) return b;
  }
  return null;
}
