/**
 * Hard-delete files + DB rows for media soft-deleted > 7 days with no page usage.
 * Schedule: e.g. weekly cron. Env: DATABASE_URL
 * Usage: node server/media-cleanup-deleted.mjs
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const RETENTION_MS = Number(process.env.CMS_MEDIA_PURGE_AFTER_MS || 7 * 24 * 60 * 60 * 1000);

async function unlinkIf(rel) {
  if (!rel) return;
  const abs = path.join(ROOT, "public", rel);
  await fs.unlink(abs).catch(() => {});
}

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  const rows = await prisma.media.findMany({
    where: {
      deletedAt: { not: null, lte: cutoff },
      usages: { none: {} },
    },
  });

  let n = 0;
  for (const m of rows) {
    await unlinkIf(m.storagePath);
    await unlinkIf(m.thumbnailPath);
    await prisma.media.delete({ where: { id: m.id } });
    n += 1;
  }
  console.log(`[media-cleanup-deleted] purged ${n} media row(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
