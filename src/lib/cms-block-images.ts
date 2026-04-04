/** Multi-image map per block: `{ [slot]: mediaUuid }`. Legacy `imageId` is still read (→ `main`). */

export type CmsImagesMap = Record<string, string>;

export function readImagesMap(block: Record<string, unknown> | undefined | null): CmsImagesMap {
  const o: CmsImagesMap = {};
  if (block?.images && typeof block.images === "object" && !Array.isArray(block.images)) {
    for (const [k, v] of Object.entries(block.images as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) o[k] = v.trim();
    }
  }
  const leg = typeof block?.imageId === "string" && block.imageId.trim() ? block.imageId.trim() : undefined;
  if (leg && !o.main) o.main = leg;
  return o;
}

export function patchImages(
  block: Record<string, unknown>,
  updates: Partial<Record<string, string | undefined>>,
): Record<string, unknown> {
  const imgs = { ...readImagesMap(block) };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === "") delete imgs[k];
    else imgs[k] = v;
  }
  const next: Record<string, unknown> = { ...block, images: imgs };
  delete next.imageId;
  return next;
}

/**
 * Resolve media UUID for a named slot. Legacy `imageId` fills `main` and, for primary slots, backs `mascot` / `icon` / `cover`.
 */
export function getBlockImageId(block: Record<string, unknown> | null | undefined, key: string): string | undefined {
  if (!block) return undefined;
  const imgs =
    block.images && typeof block.images === "object" && !Array.isArray(block.images)
      ? (block.images as Record<string, unknown>)
      : undefined;

  const pick = (k: string) => {
    const raw = imgs?.[k];
    return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
  };

  const direct = pick(key);
  if (direct) return direct;

  if (key === "mascot" && pick("main")) return pick("main");
  if (key === "icon" && pick("main")) return pick("main");
  if (key === "cover" && pick("main")) return pick("main");

  const leg = typeof block.imageId === "string" && block.imageId.trim() ? block.imageId.trim() : undefined;
  if (!leg) return undefined;

  if (["main", "mascot", "icon", "cover"].includes(key)) return leg;
  return undefined;
}
