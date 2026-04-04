/**
 * Raster image optimization: WebP, max width, optional thumbnail (sharp).
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const THUMB_WIDTH = 400;

/**
 * @param {{ root: string; absPath: string; baseName: string; mime: string }} opts
 * @returns {Promise<{
 *   storagePath: string;
 *   publicUrl: string;
 *   thumbnailPath: string | null;
 *   thumbnailUrl: string | null;
 *   mime: string;
 *   width: number | null;
 *   height: number | null;
 *   thumbWidth: number | null;
 *   thumbHeight: number | null;
 * } | null>} null → caller keeps original upload as-is
 */
export async function optimizeRasterUpload({ root, absPath, baseName, mime }) {
  if (!mime?.startsWith("image/")) return null;
  if (/^image\/(gif|svg)/i.test(mime)) return null;

  const pubDir = path.join(root, "public", "uploads");
  const mainName = `${baseName}.webp`;
  const thumbName = `${baseName}_thumb.webp`;
  const mainRel = `uploads/${mainName}`;
  const thumbRel = `uploads/${thumbName}`;
  const mainAbs = path.join(pubDir, mainName);
  const thumbAbs = path.join(pubDir, thumbName);

  try {
    const buf = await fs.readFile(absPath);

    const mainOut = await sharp(buf)
      .rotate()
      .resize({ width: MAX_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86, effort: 4 })
      .toFile(mainAbs);

    const thumbOut = await sharp(buf)
      .rotate()
      .resize({ width: THUMB_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(thumbAbs);

    await fs.unlink(absPath).catch(() => {});

    return {
      storagePath: mainRel,
      publicUrl: `/${mainRel}`,
      thumbnailPath: thumbRel,
      thumbnailUrl: `/${thumbRel}`,
      mime: "image/webp",
      width: mainOut.width ?? null,
      height: mainOut.height ?? null,
      thumbWidth: thumbOut.width ?? null,
      thumbHeight: thumbOut.height ?? null,
    };
  } catch (e) {
    console.warn("[media-process] optimize failed, keeping original:", e?.message || e);
    return null;
  }
}
