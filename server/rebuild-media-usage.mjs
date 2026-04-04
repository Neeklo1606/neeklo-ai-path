/**
 * Backfill `cms_media_usage` from current page JSON (run after deploy / migration).
 * Usage: node server/rebuild-media-usage.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const pages = await prisma.page.findMany({ select: { id: true, blocks: true, meta: true } });
  for (const p of pages) {
    await replaceMediaUsageForPage(p.id, p.blocks, p.meta);
  }
  console.log(`[rebuild-media-usage] synced ${pages.length} pages`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
