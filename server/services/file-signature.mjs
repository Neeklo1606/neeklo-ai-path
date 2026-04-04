/**
 * Allowed upload MIME types + magic-byte validation (content sniffing).
 */
import fs from "fs/promises";

export const ALLOWED_UPLOAD_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/**
 * @param {Buffer} buf First bytes of file
 * @param {string} claimedMime multer mimetype
 * @returns {{ ok: true } | { ok: false; error: string }}
 */
export function validateSignature(buf, claimedMime) {
  if (!ALLOWED_UPLOAD_MIMES.has(claimedMime)) {
    return { ok: false, error: `File type not allowed: ${claimedMime}` };
  }
  if (buf.length < 12) {
    return { ok: false, error: "File too small or empty" };
  }

  if (claimedMime === "image/jpeg") {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ok: true };
    return { ok: false, error: "JPEG signature mismatch" };
  }
  if (claimedMime === "image/png") {
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) {
      return { ok: true };
    }
    return { ok: false, error: "PNG signature mismatch" };
  }
  if (claimedMime === "image/gif") {
    const sig = buf.subarray(0, 6).toString("ascii");
    if (sig === "GIF87a" || sig === "GIF89a") return { ok: true };
    return { ok: false, error: "GIF signature mismatch" };
  }
  if (claimedMime === "image/webp") {
    if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      return { ok: true };
    }
    return { ok: false, error: "WebP signature mismatch" };
  }
  if (claimedMime === "image/svg+xml") {
    const head = buf.toString("utf8", 0, Math.min(512, buf.length)).trimStart();
    if (head.startsWith("<svg") || head.startsWith("<?xml")) return { ok: true };
    return { ok: false, error: "SVG must start with <?xml or <svg" };
  }
  return { ok: false, error: "Unsupported validation path" };
}

export async function validateUploadFileSignature(absPath, claimedMime) {
  const buf = Buffer.alloc(512);
  const fh = await fs.open(absPath, "r");
  try {
    const { bytesRead } = await fh.read(buf, 0, 512, 0);
    return validateSignature(buf.subarray(0, bytesRead), claimedMime);
  } finally {
    await fh.close();
  }
}
