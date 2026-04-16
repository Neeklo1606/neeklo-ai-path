/** Align with server `cms-server.mjs` — no external image fields in page JSON. */

const FORBIDDEN_IMAGE_URL_KEYS = new Set([
  "imageUrl",
  "iconUrl",
  "src",
  "coverUrl",
  "avatarUrl",
  "posterUrl",
  "thumbnailUrl",
  "thumbUrl",
  "logoUrl",
  "backgroundUrl",
  "publicUrl",
]);

const ALLOWED_HTTP_VALUE_KEYS = new Set(["avitoUrl", "buttonHref", "seeAllPath", "itemNavigatePath", "href"]);

export const STRICT_MEDIA_ERROR = "Only imageId is allowed. Use Media Manager.";

function walk(value: unknown): { ok: true } | { ok: false; error: string } {
  if (value == null) return { ok: true };
  if (Array.isArray(value)) {
    for (const item of value) {
      const r = walk(item);
      if (!r.ok) return r;
    }
    return { ok: true };
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_IMAGE_URL_KEYS.has(k)) {
        return { ok: false, error: STRICT_MEDIA_ERROR };
      }
      if (typeof v === "string" && /^https?:\/\//i.test(v.trim()) && !ALLOWED_HTTP_VALUE_KEYS.has(k)) {
        return { ok: false, error: STRICT_MEDIA_ERROR };
      }
      const r = walk(v);
      if (!r.ok) return r;
    }
    return { ok: true };
  }
  return { ok: true };
}

export function validateNoExternalImageFieldsClient(
  blocks: unknown,
  meta: Record<string, unknown>,
): { ok: true } | { ok: false; error: string } {
  const a = walk(blocks);
  if (!a.ok) return a;
  return walk(meta);
}
