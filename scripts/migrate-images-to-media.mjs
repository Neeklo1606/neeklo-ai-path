/**
 * URL fields (http or site-relative) → cms_media + `images` map (multi-slot).
 * Slots are filtered to `block-schemas.json` per block type; unknown slots → warning.
 * Run: node scripts/migrate-images-to-media.mjs
 * Env: DATABASE_URL
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { BLOCK_SCHEMAS, canonicalBlockType } from "../server/block-schemas.mjs";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const URL_KEYS = new Set([
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

const URL_KEY_TO_IMAGE_SLOT = {
  imageUrl: "background",
  backgroundUrl: "background",
  iconUrl: "icon",
  src: "main",
  coverUrl: "cover",
  logoUrl: "logo",
  avatarUrl: "avatar",
  posterUrl: "poster",
  thumbnailUrl: "thumbnail",
  thumbUrl: "thumb",
  publicUrl: "public",
};

function filterImagesToSchema(images, blockType) {
  if (!images || typeof images !== "object" || Array.isArray(images)) return images;
  const t = blockType ? canonicalBlockType(blockType) : "";
  const sch = t ? BLOCK_SCHEMAS[t] : null;
  if (!sch) return { ...images };
  const slots = sch.imageSlots;
  if (Array.isArray(slots) && slots.length === 0) {
    if (Object.keys(images).length) {
      console.warn(`[migrate] block '${t}' allows no images — dropping`, Object.keys(images));
    }
    return {};
  }
  if (!slots?.length) return { ...images };
  const allow = new Set(slots);
  const out = {};
  for (const [k, v] of Object.entries(images)) {
    if (allow.has(k)) {
      out[k] = v;
      continue;
    }
    if (k === "main" && !allow.has("main") && allow.has("mascot") && !images.mascot) {
      out.mascot = v;
      console.warn(`[migrate] remapped slot 'main' → 'mascot' for block '${blockType}'`);
      continue;
    }
    console.warn(`[migrate] dropping invalid image slot '${k}' for block '${blockType || "?"}'`);
  }
  return out;
}

function extFromMime(m) {
  if (!m) return "bin";
  if (m.includes("jpeg")) return "jpg";
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("svg")) return "svg";
  return "bin";
}

async function readUrlToBuffer(u) {
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s)) {
    const res = await fetch(s);
    if (!res.ok) throw new Error(`GET ${s} → ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { buf, mime: res.headers.get("content-type") || "application/octet-stream" };
  }
  if (s.startsWith("/")) {
    const rel = s.replace(/^\//, "");
    const abs = path.join(ROOT, "public", rel);
    const buf = await fs.readFile(abs);
    const ext = path.extname(rel).slice(1).toLowerCase() || "bin";
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : ext === "gif"
              ? "image/gif"
              : ext === "svg"
                ? "image/svg+xml"
                : "application/octet-stream";
    return { buf, mime };
  }
  throw new Error(`Unsupported URL: ${s}`);
}

async function ingestToMedia(urlString) {
  const { buf, mime } = await readUrlToBuffer(urlString);
  const ext = extFromMime(mime);
  const name = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `uploads/${name}`;
  const abs = path.join(ROOT, "public", storagePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buf);
  const row = await prisma.media.create({
    data: {
      storagePath,
      publicUrl: `/${storagePath}`,
      mime,
      sizeBytes: buf.length,
    },
  });
  return row.id;
}

async function migrateObject(obj, itemContextType = null) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((x) => migrateObject(x, null)));
  }
  if (typeof obj !== "object") return obj;

  let blockType = itemContextType;
  if (typeof obj.type === "string") blockType = canonicalBlockType(obj.type);

  const out = {};
  const imagesFromUrls = {};

  for (const [k, v] of Object.entries(obj)) {
    if (URL_KEYS.has(k) && typeof v === "string" && (v.startsWith("http") || v.startsWith("/"))) {
      const slot = URL_KEY_TO_IMAGE_SLOT[k] || "main";
      try {
        imagesFromUrls[slot] = await ingestToMedia(v);
      } catch (e) {
        console.warn(`[migrate] skip ${k}:`, e.message || e);
      }
      continue;
    }
    if (k === "items" && Array.isArray(v) && blockType) {
      const sch = BLOCK_SCHEMAS[blockType];
      if (sch?.imagesNestedIn === "items") {
        out[k] = await Promise.all(v.map((item) => migrateObject(item, blockType)));
        continue;
      }
    }
    out[k] = await migrateObject(v, null);
  }

  const nested = out.images && typeof out.images === "object" && !Array.isArray(out.images) ? { ...out.images } : {};
  const mergedImages = { ...nested, ...imagesFromUrls };
  if (Object.keys(mergedImages).length > 0) {
    out.images = filterImagesToSchema(mergedImages, blockType);
    if (Object.keys(out.images).length === 0) delete out.images;
  }

  return out;
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function collectMediaIdsFromPageJson(value, acc) {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((v) => collectMediaIdsFromPageJson(v, acc));
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "imageId" && typeof v === "string" && v.trim()) {
        const t = v.trim();
        if (isUuid(t)) acc.add(t);
      } else if (k === "images" && v != null && typeof v === "object" && !Array.isArray(v)) {
        for (const id of Object.values(v)) {
          if (typeof id === "string" && id.trim()) {
            const t = id.trim();
            if (isUuid(t)) acc.add(t);
          }
        }
      } else {
        collectMediaIdsFromPageJson(v, acc);
      }
    }
  }
}

async function replaceMediaUsageForPage(pageId, blocks, meta) {
  const acc = new Set();
  collectMediaIdsFromPageJson(blocks, acc);
  collectMediaIdsFromPageJson(meta, acc);
  const ids = [...acc];
  await prisma.$transaction(async (tx) => {
    await tx.mediaUsage.deleteMany({ where: { pageId } });
    if (ids.length > 0) {
      await tx.mediaUsage.createMany({
        data: ids.map((mediaId) => ({ mediaId, pageId })),
        skipDuplicates: true,
      });
    }
  });
}

async function main() {
  const pages = await prisma.page.findMany();
  let n = 0;
  for (const p of pages) {
    const blocks = await migrateObject(p.blocks);
    const meta = await migrateObject(p.meta);
    const changed = JSON.stringify(blocks) !== JSON.stringify(p.blocks) || JSON.stringify(meta) !== JSON.stringify(p.meta);
    if (changed) {
      await prisma.page.update({
        where: { id: p.id },
        data: { blocks, meta },
      });
      await replaceMediaUsageForPage(p.id, blocks, meta);
      n += 1;
      console.log("[migrate] updated page", p.slug, p.locale, p.id);
    }
  }
  console.log(`[migrate] done, ${n} page(s) updated`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
