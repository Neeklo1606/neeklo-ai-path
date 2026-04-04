import type { CmsPage } from "@/lib/cms-api";

/** Global id → public_url; merged across navigations (no clear — scalable cache). */
const cache = new Map<string, string>();

export function hydrateMediaCacheFromPage(page: CmsPage | null | undefined): void {
  if (!page?.media?.length) return;
  for (const row of page.media) {
    if (row.id && row.public_url) cache.set(row.id, row.public_url);
  }
}

export function getMediaCacheMap(): ReadonlyMap<string, string> {
  return cache;
}

export function isMediaDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as unknown as { __MEDIA_DEBUG__?: boolean }).__MEDIA_DEBUG__);
}
