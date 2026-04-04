import type { CmsPage } from "@/lib/cms-api";
import { getMediaCacheMap, hydrateMediaCacheFromPage, isMediaDebugEnabled } from "@/lib/media-cache";
import { getBlockImageId } from "@/lib/cms-block-images";

/** Exists in `public/` — use when media id is missing or not hydrated (avoid empty `src` / broken layout). */
export const MEDIA_PLACEHOLDER_URL = "/placeholder.svg";

/** Build id → public_url from API `page.media` and sync global cache (one source per page load). */
export function mediaPublicUrlMap(page: CmsPage | null | undefined): Map<string, string> {
  hydrateMediaCacheFromPage(page);
  const m = new Map<string, string>();
  if (!page?.media?.length) return m;
  for (const row of page.media) {
    if (row.id && row.public_url) m.set(row.id, row.public_url);
  }
  return m;
}

function mergedLookup(key: string, mediaById?: ReadonlyMap<string, string> | null): string | undefined {
  const fromPage = mediaById?.get(key);
  if (typeof fromPage === "string" && fromPage.trim()) return fromPage.trim();
  const fromCache = getMediaCacheMap().get(key);
  if (typeof fromCache === "string" && fromCache.trim()) return fromCache.trim();
  return undefined;
}

export type ResolveImageResult = {
  url: string;
  /** True when an id was set but no row in page.media / cache (fallback used). */
  missing: boolean;
};

export { getBlockImageId } from "@/lib/cms-block-images";

/**
 * Resolve image URL for `block.images[key]` (and legacy `imageId`) + page `media[]` / global cache.
 */
export function resolveImageDetailed(
  block: Record<string, unknown> | null | undefined,
  key: string,
  mediaById?: ReadonlyMap<string, string> | null,
): ResolveImageResult {
  if (!block) return { url: "", missing: false };
  const id = getBlockImageId(block, key);
  if (!id) return { url: "", missing: false };
  const u = mergedLookup(id, mediaById);
  if (u) return { url: u, missing: false };
  console.warn("MISSING MEDIA ID:", id);
  return { url: MEDIA_PLACEHOLDER_URL, missing: true };
}

export function resolveImage(
  block: Record<string, unknown> | null | undefined,
  key: string,
  mediaById?: ReadonlyMap<string, string> | null,
): string {
  return resolveImageDetailed(block, key, mediaById).url;
}

/** Legacy helper: first resolved slot among common keys (prefer explicit `main`). */
export function resolveImageUrlDetailed(
  row: Record<string, unknown> | null | undefined,
  mediaById?: ReadonlyMap<string, string> | null,
): ResolveImageResult {
  if (!row) return { url: "", missing: false };
  const order = ["main", "mascot", "icon", "cover", "logo", "background"];
  for (const k of order) {
    const r = resolveImageDetailed(row, k, mediaById);
    if (r.url) return r;
  }
  const imgs = row.images;
  if (imgs && typeof imgs === "object" && !Array.isArray(imgs)) {
    for (const v of Object.values(imgs as Record<string, unknown>)) {
      if (typeof v !== "string" || !v.trim()) continue;
      const u = mergedLookup(v.trim(), mediaById);
      if (u) return { url: u, missing: false };
      console.warn("MISSING MEDIA ID:", v.trim());
      return { url: MEDIA_PLACEHOLDER_URL, missing: true };
    }
  }
  return { url: "", missing: false };
}

export function resolveImageUrl(
  row: Record<string, unknown> | null | undefined,
  mediaById?: ReadonlyMap<string, string> | null,
): string {
  return resolveImageUrlDetailed(row, mediaById).url;
}

export function mediaDebugClassName(missing: boolean): string {
  if (!missing || !isMediaDebugEnabled()) return "";
  return "ring-2 ring-red-500 ring-offset-2";
}

/** Safe `<img src>` / background URL: never return empty string when a visual is required. */
export function displayImageUrl(r: ResolveImageResult, fallback = MEDIA_PLACEHOLDER_URL): string {
  const u = r?.url?.trim();
  if (u) return u;
  return fallback || MEDIA_PLACEHOLDER_URL;
}

/** Log malformed CMS blocks (debug bad JSON without crashing). */
export function logBrokenBlock(label: string, block: unknown): void {
  console.log("BROKEN BLOCK:", label, block);
}
