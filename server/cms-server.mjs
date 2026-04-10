/**
 * CMS API + JWT auth (Prisma + PostgreSQL only). Run: node server/cms-server.mjs
 * Env: DATABASE_URL, JWT_SECRET (>=32 in prod), PORT, OPENAI_API_KEY (optional)
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import {
  getQdrantClient,
  getOllamaBase,
  collectionNameForAssistant,
  createEmbedding,
  chunkText,
  extractTextFromFile,
  upsertChunks,
  chatWithRag,
  chatOpenAiCompatible,
  searchContext,
} from "./services/ai.service.mjs";
import {
  getBillingConfig,
  computeUsageCost,
  rateLimitByKeyHash,
  ensureApiKeyForAssistant,
  deductBalanceAndLog,
  estimateTokensFromText,
} from "./services/billing.service.mjs";
import { optimizeRasterUpload } from "./services/media-process.mjs";
import { validateUploadFileSignature, ALLOWED_UPLOAD_MIMES } from "./services/file-signature.mjs";
import { validatePageBlocksSchema } from "./block-schemas.mjs";
import { getDeployStatus } from "./deploy-status.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");

const MAX_UPLOAD_CAP = 100 * 1024 * 1024;
const MAX_FILE_BYTES = Math.min(
  Number(process.env.CMS_MEDIA_MAX_FILE_BYTES || 25 * 1024 * 1024),
  MAX_UPLOAD_CAP,
);

const PORT = Number(process.env.PORT || process.env.CMS_SERVER_PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET;
const OPENAI_FALLBACK = process.env.OPENAI_API_KEY || "";

const prisma = new PrismaClient();

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.warn("[cms-server] Set JWT_SECRET (min 32 chars) for production.");
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(ROOT, "public")));

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "bin").toLowerCase().slice(0, 8);
    cb(null, `${crypto.randomUUID()}.${ext}`);
  },
});
const MAX_UPLOAD = 100 * 1024 * 1024; // assistant knowledge uploads (larger than CMS media)
const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_MIMES.has(file.mimetype)) cb(null, true);
    else cb(new Error(`File type not allowed: ${file.mimetype}`));
  },
});
const uploadKb = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD } });

function pageOut(p) {
  if (!p) return p;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    locale: p.locale,
    blocks: p.blocks,
    published: p.published,
    is_draft: !!p.isDraft,
    meta: p.meta,
    created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updated_at: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

function pageVersionOut(v) {
  if (!v) return v;
  return {
    id: v.id,
    page_id: v.pageId,
    created_at: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
    is_auto: !!v.isAuto,
  };
}

/** Recursively collect media UUIDs: legacy `imageId` + all values under `images` maps. */
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

/** Keys that must never appear in page JSON (use imageId + Media only). */
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

/** String values starting with http(s) allowed only for these keys (links, not image files). */
const ALLOWED_HTTP_VALUE_KEYS = new Set(["avitoUrl", "buttonHref", "seeAllPath", "itemNavigatePath", "href"]);

/**
 * Reject external/raw image fields and raw http(s) strings (except whitelisted link keys).
 * @returns {{ ok: true } | { ok: false; error: string }}
 */
function validateNoExternalImageFields(blocks, meta) {
  function walk(value) {
    if (value == null) return { ok: true };
    if (Array.isArray(value)) {
      for (const item of value) {
        const r = walk(item);
        if (!r.ok) return r;
      }
      return { ok: true };
    }
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (FORBIDDEN_IMAGE_URL_KEYS.has(k)) {
          return { ok: false, error: "Only imageId is allowed. Use Media Manager." };
        }
        if (typeof v === "string" && /^https?:\/\//i.test(v.trim()) && !ALLOWED_HTTP_VALUE_KEYS.has(k)) {
          return { ok: false, error: "Only imageId is allowed. Use Media Manager." };
        }
        const r = walk(v);
        if (!r.ok) return r;
      }
      return { ok: true };
    }
    return { ok: true };
  }
  const a = walk(blocks);
  if (!a.ok) return a;
  return walk(meta);
}

/** Ensure every referenced media id in blocks+meta exists in DB (`Media` / cms_media). */
async function validateMediaIdsForPage(blocks, meta) {
  const acc = new Set();
  collectMediaIdsFromPageJson(blocks, acc);
  collectMediaIdsFromPageJson(meta, acc);
  if (acc.size === 0) return { ok: true };
  const ids = [...acc];
  const rows = await prisma.media.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true },
  });
  const have = new Set(rows.map((r) => r.id));
  for (const id of ids) {
    if (!have.has(id)) {
      return { ok: false, error: `Media not found: ${id}` };
    }
  }
  return { ok: true };
}

/** Replace all `MediaUsage` rows for a page from current blocks/meta media id set. */
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

/** Any page still listing this media id (indexed `cms_media_usage`). */
async function findPageReferencingMedia(mediaId) {
  if (!isUuid(mediaId)) return null;
  const u = await prisma.mediaUsage.findFirst({
    where: { mediaId },
    include: { page: { select: { id: true, slug: true } } },
  });
  return u?.page ? { id: u.page.id, slug: u.page.slug } : null;
}

async function assertMediaUploadAllowed(req, addedBytes) {
  const maxTotal = Number(process.env.CMS_MEDIA_MAX_TOTAL_BYTES || 0);
  if (maxTotal > 0) {
    const agg = await prisma.media.aggregate({
      where: { deletedAt: null },
      _sum: { sizeBytes: true },
    });
    const cur = Number(agg._sum.sizeBytes || 0);
    if (cur + addedBytes > maxTotal) {
      throw new Error("Storage quota exceeded");
    }
  }
  const maxCount = Number(process.env.CMS_MEDIA_MAX_ACTIVE_COUNT || 0);
  if (maxCount > 0) {
    const c = await prisma.media.count({ where: { deletedAt: null } });
    if (c >= maxCount) throw new Error("Media count limit reached");
  }
  const maxPerUser = Number(process.env.CMS_MEDIA_MAX_UPLOADS_PER_USER || 0);
  if (maxPerUser > 0 && req.authUser?.id) {
    const c = await prisma.media.count({
      where: { deletedAt: null, uploadedByUserId: req.authUser.id },
    });
    if (c >= maxPerUser) throw new Error("Per-user upload limit reached");
  }
}

function versionedUrl(u, updatedAt) {
  if (!u) return u;
  const dt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  const t = dt.getTime();
  if (Number.isNaN(t)) return u;
  const sep = u.includes("?") ? "&" : "?";
  return `${u}${sep}v=${t}`;
}

/** Attach `media: [...]` for all referenced media ids (public + admin page loads). */
async function pageOutWithMedia(p) {
  const base = pageOut(p);
  if (!p) return base;
  const acc = new Set();
  collectMediaIdsFromPageJson(p.blocks, acc);
  collectMediaIdsFromPageJson(p.meta, acc);
  const ids = [...acc];
  let media = [];
  if (ids.length > 0) {
    const rows = await prisma.media.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    media = await attachMediaUsageCounts(rows.map((row) => mediaOut(row)));
  }
  return { ...base, media };
}

async function attachMediaUsageCounts(mediaRows) {
  if (!mediaRows?.length) return mediaRows;
  const ids = mediaRows.map((m) => m.id).filter(Boolean);
  if (!ids.length) return mediaRows;
  const counts = await prisma.mediaUsage.groupBy({
    by: ["mediaId"],
    where: { mediaId: { in: ids } },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.mediaId, c._count._all]));
  return mediaRows.map((m) => ({ ...m, usage_count: map.get(m.id) ?? 0 }));
}

function mediaOut(m) {
  if (!m) return m;
  const at = m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt);
  return {
    id: m.id,
    storage_path: m.storagePath,
    public_url: versionedUrl(m.publicUrl, at),
    thumbnail_path: m.thumbnailPath,
    thumbnail_url: m.thumbnailUrl ? versionedUrl(m.thumbnailUrl, at) : null,
    mime: m.mime,
    alt: m.alt,
    width: m.width,
    height: m.height,
    thumb_width: m.thumbWidth,
    thumb_height: m.thumbHeight,
    created_at: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    deleted_at: m.deletedAt ? (m.deletedAt instanceof Date ? m.deletedAt.toISOString() : m.deletedAt) : null,
  };
}

function settingOut(s) {
  if (!s) return s;
  return {
    key: s.key,
    value: s.value,
    is_public: s.isPublic,
    updated_at: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  };
}

function assistantListOut(a) {
  return {
    id: a.id,
    name: a.name,
    api_key_prefix: a.apiKeyPrefix,
    provider: a.provider,
    base_url: a.baseUrl,
    model: a.model,
    embed_model: a.embedModel,
    temperature: a.temperature != null ? Number(a.temperature) : 0.7,
    system_prompt: a.systemPrompt,
    active: a.active,
    created_at: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    updated_at: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
  };
}

function assistantDetailOut(a) {
  return { ...assistantListOut(a), provider_api_key: a.providerApiKey };
}

function requireAuth(req, res, next) {
  const secret = JWT_SECRET || "dev-only-unsafe-secret-min-32-chars!!";
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(h.slice(7), secret);
    req.authUser = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.authUser?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function hashKey(key) {
  return crypto.createHash("sha256").update(key, "utf8").digest("hex");
}

function genApiKey() {
  return `nk_${crypto.randomBytes(24).toString("hex")}`;
}

function signToken(user) {
  const secret = JWT_SECRET || "dev-only-unsafe-secret-min-32-chars!!";
  return jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "cms-api" });
});

app.get("/deploy/status", (_req, res) => {
  res.json(getDeployStatus());
});

app.post("/internal/deploy", (_req, res) => {
  try {
    const output = execSync("bash /var/www/neeklo.ru/deploy.sh", {
      encoding: "utf-8",
      maxBuffer: 30 * 1024 * 1024,
    });
    return res.json({ ok: true, output });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── Auth ───
app.post("/auth/login", async (req, res) => {
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  const password = (req.body?.password || "").toString();
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const count = await prisma.user.count();
    const email = (req.body?.email || "").toString().trim().toLowerCase();
    const password = (req.body?.password || "").toString();
    const role = (req.body?.role || "MANAGER").toString().toUpperCase() === "ADMIN" ? "ADMIN" : "MANAGER";

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: "email and password (min 8 chars) required" });
    }

    if (count === 0) {
      const hash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash: hash, role: "ADMIN" },
      });
      const token = signToken(user);
      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    return res.status(403).json({ error: "Use authenticated admin to create users" });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(e);
    res.status(500).json({ error: "Register failed" });
  }
});

app.post("/auth/users", requireAuth, requireAdmin, async (req, res) => {
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  const password = (req.body?.password || "").toString();
  const role = (req.body?.role || "MANAGER").toString().toUpperCase() === "ADMIN" ? "ADMIN" : "MANAGER";
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "email and password (min 8) required" });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash: hash, role } });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Email exists" });
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.authUser.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json(user);
});

// ─── Public settings ───
app.get("/settings/public", async (_req, res) => {
  try {
    const rows = await prisma.cmsSetting.findMany({ where: { isPublic: true } });
    const map = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    res.json(map);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// ─── Chat bootstrap ───
function pickLocale(val, loc) {
  if (val == null) return null;
  if (typeof val === "string") return val.trim() || null;
  if (typeof val === "object" && val !== null) {
    const s = val[loc] ?? val.ru ?? val.en;
    if (s != null && String(s).trim()) return String(s).trim();
  }
  return null;
}

function clientIp(req) {
  const x = req.headers["x-forwarded-for"];
  if (typeof x === "string" && x.trim()) return x.split(",")[0].trim().slice(0, 128);
  return String(req.socket?.remoteAddress || "unknown").slice(0, 128);
}

/** Single public chat assistant: newest active row. */
async function getActiveAssistant() {
  return prisma.assistant.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

app.get("/chat/bootstrap", async (req, res) => {
  const locale = (req.query.locale || "ru").toString();
  let welcomeMessage = null;
  let pageTitle = null;
  let headerTitle = null;
  let statusLabel = null;
  let inputPlaceholder = null;
  try {
    const page = await prisma.page.findFirst({
      where: { slug: "chat", locale, published: true },
    });
    if (page?.title) pageTitle = page.title;
    const meta = page?.meta && typeof page.meta === "object" ? page.meta : null;
    if (meta) {
      headerTitle = pickLocale(meta.chatHeaderTitle, locale) || page?.title || null;
      statusLabel = pickLocale(meta.chatStatusLabel, locale);
      inputPlaceholder = pickLocale(meta.chatInputPlaceholder, locale);
    }
    if (page?.blocks && Array.isArray(page.blocks)) {
      const cfg = page.blocks.find((b) => b?.type === "chat_config");
      if (cfg?.welcomeMessage != null && String(cfg.welcomeMessage).trim()) {
        welcomeMessage = String(cfg.welcomeMessage);
      }
    }
    if (meta?.welcomeMessage != null && String(meta.welcomeMessage).trim()) {
      welcomeMessage = String(meta.welcomeMessage);
    }
    const asst = await getActiveAssistant();
    res.json({
      welcomeMessage,
      pageTitle,
      headerTitle,
      statusLabel,
      inputPlaceholder,
      hasAssistant: !!asst,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Bootstrap failed" });
  }
});

// ─── Pages ───
app.get("/pages", requireAuth, async (req, res) => {
  const locale = (req.query.locale || "ru").toString();
  try {
    const rows = await prisma.page.findMany({
      where: { locale },
      orderBy: { updatedAt: "desc" },
    });
    res.json(rows.map(pageOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list pages" });
  }
});

app.get("/pages/slug/:slug", async (req, res) => {
  const locale = (req.query.locale || "ru").toString();
  try {
    const data = await prisma.page.findFirst({
      where: { slug: req.params.slug, locale, published: true, isDraft: false },
    });
    if (!data) {
      return res.status(404).json({
        error: "Not found",
        hint: "Страница не в БД или не опубликована. Запустите: npm run seed:cms",
      });
    }
    res.json(await pageOutWithMedia(data));
  } catch (e) {
    console.error("[cms-server] GET /pages/slug", req.params.slug, locale, e);
    res.status(500).json({
      error: e.message || "Query failed",
      hint: "Выполните: npx prisma db push && npm run seed:cms",
    });
  }
});

/** GET /pages/:slug?locale=ru — public published page (also supports UUID + Bearer for drafts) */
const RESERVED_PAGE_SLUGS = new Set(["slug", "media", "settings", "assistants", "auth", "chat", "upload"]);
app.get("/pages/:param", async (req, res) => {
  const param = req.params.param;
  const locale = (req.query.locale || "ru").toString();

  if (isUuid(param)) {
    const secret = JWT_SECRET || "dev-only-unsafe-secret-min-32-chars!!";
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      jwt.verify(h.slice(7), secret);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    try {
      const data = await prisma.page.findUnique({ where: { id: param } });
      if (!data) return res.status(404).json({ error: "Not found" });
      return res.json(await pageOutWithMedia(data));
    } catch (e) {
      return res.status(500).json({ error: e.message || "Query failed" });
    }
  }

  if (RESERVED_PAGE_SLUGS.has(param)) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const data = await prisma.page.findFirst({
      where: { slug: param, locale, published: true, isDraft: false },
    });
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(await pageOutWithMedia(data));
  } catch (e) {
    res.status(500).json({ error: e.message || "Query failed" });
  }
});

app.post("/pages", requireAuth, async (req, res) => {
  try {
    const blocks = req.body.blocks ?? [];
    const meta = req.body.meta ?? {};
    const ext = validateNoExternalImageFields(blocks, meta);
    if (!ext.ok) return res.status(400).json({ error: ext.error });
    const sch = validatePageBlocksSchema(blocks);
    if (!sch.ok) return res.status(400).json({ error: sch.error });
    const v = await validateMediaIdsForPage(blocks, meta);
    if (!v.ok) return res.status(400).json({ error: v.error });
    const row = await prisma.page.create({
      data: {
        slug: req.body.slug,
        title: req.body.title ?? "",
        locale: req.body.locale ?? "ru",
        blocks,
        published: !!req.body.published,
        isDraft: !!req.body.isDraft,
        meta,
      },
    });
    await replaceMediaUsageForPage(row.id, row.blocks, row.meta);
    res.status(201).json(await pageOutWithMedia(row));
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ error: "Slug+locale already exists" });
    res.status(400).json({ error: e.message || "Create failed" });
  }
});

app.patch("/pages/:id", requireAuth, async (req, res) => {
  const patch = { ...req.body };
  delete patch.id;
  const isAutosave = !!patch.autosave;
  const data = {};
  for (const k of ["slug", "title", "locale", "blocks", "published", "meta", "isDraft"]) {
    if (patch[k] !== undefined) data[k] = patch[k];
  }
  try {
    const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    const nextBlocks = data.blocks !== undefined ? data.blocks : existing.blocks;
    const nextMeta = data.meta !== undefined ? data.meta : existing.meta;
    const nextSlug = data.slug !== undefined ? data.slug : existing.slug;
    const nextTitle = data.title !== undefined ? data.title : existing.title;
    const nextLocale = data.locale !== undefined ? data.locale : existing.locale;
    const nextPublished = data.published !== undefined ? data.published : existing.published;
    const nextIsDraft = data.isDraft !== undefined ? data.isDraft : existing.isDraft;
    const ext = validateNoExternalImageFields(nextBlocks, nextMeta);
    if (!ext.ok) return res.status(400).json({ error: ext.error });
    const sch = validatePageBlocksSchema(nextBlocks);
    if (!sch.ok) return res.status(400).json({ error: sch.error });
    const v = await validateMediaIdsForPage(nextBlocks, nextMeta);
    if (!v.ok) return res.status(400).json({ error: v.error });

    const unchanged =
      nextSlug === existing.slug &&
      nextTitle === existing.title &&
      nextLocale === existing.locale &&
      nextPublished === existing.published &&
      nextIsDraft === existing.isDraft &&
      JSON.stringify(nextBlocks) === JSON.stringify(existing.blocks) &&
      JSON.stringify(nextMeta) === JSON.stringify(existing.meta);
    if (unchanged) {
      return res.json(await pageOutWithMedia(existing));
    }

    await prisma.pageVersion.create({
      data: {
        pageId: existing.id,
        blocks: existing.blocks,
        meta: existing.meta,
        isAuto: isAutosave,
      },
    });

    const row = await prisma.page.update({
      where: { id: req.params.id },
      data,
    });
    await replaceMediaUsageForPage(row.id, row.blocks, row.meta);
    res.json(await pageOutWithMedia(row));
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Update failed" });
  }
});

app.get("/pages/:id/versions", requireAuth, async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: "Invalid page id" });
  try {
    const rows = await prisma.pageVersion.findMany({
      where: { pageId: req.params.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(rows.map(pageVersionOut));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/pages/:id/versions/:versionId", requireAuth, async (req, res) => {
  const { id, versionId } = req.params;
  if (!isUuid(id) || !isUuid(versionId)) return res.status(400).json({ error: "Invalid id" });
  try {
    const ver = await prisma.pageVersion.findFirst({
      where: { id: versionId, pageId: id },
    });
    if (!ver) return res.status(404).json({ error: "Not found" });
    res.json({
      id: ver.id,
      page_id: ver.pageId,
      created_at: ver.createdAt instanceof Date ? ver.createdAt.toISOString() : ver.createdAt,
      is_auto: !!ver.isAuto,
      blocks: ver.blocks,
      meta: ver.meta,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.post("/pages/:id/restore/:versionId", requireAuth, async (req, res) => {
  const { id, versionId } = req.params;
  if (!isUuid(id) || !isUuid(versionId)) return res.status(400).json({ error: "Invalid id" });
  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return res.status(404).json({ error: "Page not found" });
    const ver = await prisma.pageVersion.findFirst({
      where: { id: versionId, pageId: id },
    });
    if (!ver) return res.status(404).json({ error: "Version not found" });

    const ext = validateNoExternalImageFields(ver.blocks, ver.meta);
    if (!ext.ok) return res.status(400).json({ error: ext.error });
    const sch = validatePageBlocksSchema(ver.blocks);
    if (!sch.ok) return res.status(400).json({ error: sch.error });
    const mv = await validateMediaIdsForPage(ver.blocks, ver.meta);
    if (!mv.ok) return res.status(400).json({ error: mv.error });

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        blocks: page.blocks,
        meta: page.meta,
        isAuto: false,
      },
    });

    const row = await prisma.page.update({
      where: { id },
      data: { blocks: ver.blocks, meta: ver.meta },
    });
    await replaceMediaUsageForPage(row.id, row.blocks, row.meta);
    res.json(await pageOutWithMedia(row));
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Restore failed" });
  }
});

app.delete("/pages/:id", requireAuth, async (req, res) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Delete failed" });
  }
});

// ─── Media ───
app.get("/media", requireAuth, async (req, res) => {
  try {
    const includeDeleted = String(req.query.include_deleted || "") === "1" || String(req.query.include_deleted || "").toLowerCase() === "true";
    const where = includeDeleted ? {} : { deletedAt: null };
    const rows = await prisma.media.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json(await attachMediaUsageCounts(rows.map((row) => mediaOut(row))));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

/** Optional: fetch only rows for given UUIDs (comma-separated `ids`). */
app.get("/media/by-ids", requireAuth, async (req, res) => {
  const raw = (req.query.ids ?? "").toString();
  const parts = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  const ids = parts.filter((id) => isUuid(id));
  if (!ids.length) return res.json([]);
  try {
    const rows = await prisma.media.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    res.json(await attachMediaUsageCounts(rows.map((row) => mediaOut(row))));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.post(
  "/media/upload",
  requireAuth,
  (req, res, next) => {
    uploadMedia.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Upload rejected" });
      next();
    });
  },
  async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  const abs = path.join(UPLOAD_DIR, req.file.filename);
  const baseName = path.parse(req.file.filename).name;
  const mime = (req.file.mimetype || "").toString();
  const alt = (req.body.alt || "").toString() || null;

  let optimized = null;
  try {
    const sig = await validateUploadFileSignature(abs, mime);
    if (!sig.ok) {
      await fs.unlink(abs).catch(() => {});
      return res.status(400).json({ error: sig.error });
    }

    optimized = await optimizeRasterUpload({ root: ROOT, absPath: abs, baseName, mime });

    let totalBytes = req.file.size || 0;
    if (optimized) {
      try {
        const st = await fs.stat(path.join(ROOT, "public", optimized.storagePath));
        totalBytes = st.size;
        if (optimized.thumbnailPath) {
          const st2 = await fs.stat(path.join(ROOT, "public", optimized.thumbnailPath));
          totalBytes += st2.size;
        }
      } catch {
        totalBytes = req.file.size || 0;
      }
    }

    await assertMediaUploadAllowed(req, totalBytes);

    if (optimized) {
      const row = await prisma.media.create({
        data: {
          storagePath: optimized.storagePath,
          publicUrl: optimized.publicUrl,
          thumbnailPath: optimized.thumbnailPath,
          thumbnailUrl: optimized.thumbnailUrl,
          mime: optimized.mime,
          alt,
          width: optimized.width,
          height: optimized.height,
          thumbWidth: optimized.thumbWidth,
          thumbHeight: optimized.thumbHeight,
          sizeBytes: totalBytes,
          uploadedByUserId: req.authUser?.id ?? null,
        },
      });
      return res.status(201).json(mediaOut(row));
    }

    const rel = `uploads/${req.file.filename}`;
    const publicUrl = `/${rel}`;
    const row = await prisma.media.create({
      data: {
        storagePath: rel,
        publicUrl,
        mime,
        alt,
        sizeBytes: totalBytes,
        uploadedByUserId: req.authUser?.id ?? null,
      },
    });
    res.status(201).json(mediaOut(row));
  } catch (e) {
    if (optimized?.storagePath) {
      await fs.unlink(path.join(ROOT, "public", optimized.storagePath)).catch(() => {});
    }
    if (optimized?.thumbnailPath) {
      await fs.unlink(path.join(ROOT, "public", optimized.thumbnailPath)).catch(() => {});
    }
    await fs.unlink(abs).catch(() => {});
    const msg = e?.message || "Save failed";
    const code = msg.includes("limit") || msg.includes("quota") ? 413 : 400;
    res.status(code).json({ error: msg });
  }
  }
);

app.delete("/media/:id", requireAuth, async (req, res) => {
  try {
    const row = await prisma.media.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!row) return res.status(404).json({ error: "Not found" });
    const ref = await findPageReferencingMedia(req.params.id);
    if (ref) {
      return res.status(409).json({
        error: `Media is in use (page slug: ${ref.slug}, id: ${ref.id})`,
      });
    }
    await prisma.media.update({
      where: { id: row.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Delete failed" });
  }
});

// ─── Settings ───
app.get("/settings", requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.cmsSetting.findMany({ orderBy: { key: "asc" } });
    res.json(rows.map(settingOut));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.patch("/settings/:key", requireAuth, async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  try {
    const row = await prisma.cmsSetting.upsert({
      where: { key },
      create: {
        key,
        value: req.body.value ?? null,
        isPublic: !!req.body.is_public,
      },
      update: {
        value: req.body.value ?? null,
        isPublic: !!req.body.is_public,
      },
    });
    res.json(settingOut(row));
  } catch (e) {
    res.status(400).json({ error: e.message || "Upsert failed" });
  }
});

// ─── Assistants ───
app.get("/assistants", requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.assistant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        apiKeyPrefix: true,
        provider: true,
        baseUrl: true,
        model: true,
        embedModel: true,
        temperature: true,
        systemPrompt: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(rows.map(assistantListOut));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/assistants/:id", requireAuth, async (req, res) => {
  try {
    const data = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(assistantDetailOut(data));
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.post("/assistants", requireAuth, async (req, res) => {
  const plain = genApiKey();
  const apiKeyHash = hashKey(plain);
  const apiKeyPrefix = plain.slice(0, 10);
  try {
    const cfg = getBillingConfig();
    const prov = (req.body.provider || "ollama").toLowerCase();
    const data = await prisma.$transaction(async (tx) => {
      const a = await tx.assistant.create({
        data: {
          name: req.body.name || "Assistant",
          apiKeyHash,
          apiKeyPrefix,
          provider: req.body.provider || "ollama",
          baseUrl: prov === "ollama" || prov === "local" ? null : req.body.base_url || null,
          model: req.body.model || "qwen2.5:7b",
          embedModel: req.body.embed_model || "nomic-embed-text",
          temperature: req.body.temperature != null ? Number(req.body.temperature) : 0.7,
          systemPrompt: req.body.system_prompt || null,
          providerApiKey: req.body.provider_api_key || null,
          active: req.body.active !== false,
        },
        select: {
          id: true,
          name: true,
          apiKeyPrefix: true,
          provider: true,
          baseUrl: true,
          model: true,
          embedModel: true,
          temperature: true,
          systemPrompt: true,
          active: true,
          createdAt: true,
        },
      });
      await tx.apiKey.create({
        data: {
          key: a.id,
          assistantId: a.id,
          balance: cfg.initialBalance,
          isActive: true,
        },
      });
      return a;
    });
    res.status(201).json({ ...assistantListOut({ ...data, updatedAt: data.createdAt }), api_key: plain });
  } catch (e) {
    res.status(400).json({ error: e.message || "Create failed" });
  }
});

app.patch("/assistants/:id/regenerate-key", requireAuth, async (req, res) => {
  const plain = genApiKey();
  try {
    const data = await prisma.assistant.update({
      where: { id: req.params.id },
      data: {
        apiKeyHash: hashKey(plain),
        apiKeyPrefix: plain.slice(0, 10),
      },
      select: { id: true, name: true, apiKeyPrefix: true },
    });
    res.json({ ...data, api_key_prefix: data.apiKeyPrefix, api_key: plain });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Failed" });
  }
});

app.patch("/assistants/:id", requireAuth, async (req, res) => {
  const patch = { ...req.body };
  delete patch.id;
  delete patch.api_key_hash;
  delete patch.api_key_prefix;
  let effectiveProvider = "ollama";
  try {
    const cur = await prisma.assistant.findUnique({
      where: { id: req.params.id },
      select: { provider: true },
    });
    effectiveProvider = (patch.provider != null ? String(patch.provider) : cur?.provider || "ollama").toLowerCase();
  } catch {
    effectiveProvider = (patch.provider != null ? String(patch.provider) : "ollama").toLowerCase();
  }
  const data = {
    ...(patch.name != null && { name: patch.name }),
    ...(patch.provider != null && { provider: patch.provider }),
    ...(patch.base_url !== undefined && {
      baseUrl: effectiveProvider === "ollama" || effectiveProvider === "local" ? null : patch.base_url || null,
    }),
    ...(patch.model != null && { model: patch.model }),
    ...(patch.embed_model !== undefined && { embedModel: patch.embed_model }),
    ...(patch.temperature !== undefined && { temperature: Number(patch.temperature) }),
    ...(patch.system_prompt !== undefined && { systemPrompt: patch.system_prompt }),
    ...(patch.provider_api_key !== undefined && { providerApiKey: patch.provider_api_key }),
    ...(patch.active != null && { active: patch.active }),
  };
  try {
    await prisma.assistant.update({
      where: { id: req.params.id },
      data,
    });
    const row = await prisma.assistant.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        apiKeyPrefix: true,
        provider: true,
        baseUrl: true,
        model: true,
        embedModel: true,
        temperature: true,
        systemPrompt: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(assistantListOut(row));
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Failed" });
  }
});

// ─── Assistant knowledge (RAG) — admin ───
app.post("/assistants/:id/knowledge/text", requireAuth, async (req, res) => {
  const text = (req.body?.text || "").toString();
  if (!text.trim()) return res.status(400).json({ error: "text required" });
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const ollamaBase = getOllamaBase(asst);
    const embedModel = asst.embedModel || "nomic-embed-text";
    const coll = collectionNameForAssistant(asst.id);
    const chunks = chunkText(text);
    if (!chunks.length) return res.status(400).json({ error: "No chunks after split" });
    const client = getQdrantClient();
    const out = await upsertChunks({
      client,
      collectionName: coll,
      ollamaBase,
      embedModel,
      assistantId: asst.id,
      chunks,
      source: "manual",
    });
    res.json({ ok: true, ...out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Ingest failed" });
  }
});

app.post("/assistants/:id/knowledge/upload", requireAuth, uploadKb.single("file"), async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const f = req.file;
    if (!f?.buffer) return res.status(400).json({ error: "file required" });
    const raw = await extractTextFromFile(f.buffer, f.mimetype, f.originalname);
    const chunks = chunkText(raw);
    if (!chunks.length) return res.status(400).json({ error: "No text extracted or empty" });
    const ollamaBase = getOllamaBase(asst);
    const embedModel = asst.embedModel || "nomic-embed-text";
    const coll = collectionNameForAssistant(asst.id);
    const client = getQdrantClient();
    const out = await upsertChunks({
      client,
      collectionName: coll,
      ollamaBase,
      embedModel,
      assistantId: asst.id,
      chunks,
      source: `file:${f.originalname}`,
    });
    res.json({ ok: true, ...out, filename: f.originalname });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Upload ingest failed" });
  }
});

app.delete("/assistants/:id/knowledge", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const coll = collectionNameForAssistant(asst.id);
    const client = getQdrantClient();
    try {
      await client.deleteCollection(coll);
    } catch (e) {
      if (!String(e.message || "").includes("Not found") && !String(e.message || "").includes("404")) {
        throw e;
      }
    }
    res.json({ ok: true, cleared: coll });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Clear failed" });
  }
});

app.get("/assistants/:id/knowledge/stats", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const coll = collectionNameForAssistant(asst.id);
    const client = getQdrantClient();
    let count = 0;
    try {
      const c = await client.count(coll, { exact: true });
      count = typeof c === "number" ? c : Number(c?.count ?? 0);
    } catch {
      count = 0;
    }
    res.json({ collection: coll, points: count, ollama_base: getOllamaBase(asst) });
  } catch (e) {
    res.status(500).json({ error: e.message || "Stats failed" });
  }
});

app.post("/assistants/:id/rag/embed", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const text = (req.body?.text || "").toString();
    if (!text.trim()) return res.status(400).json({ error: "text required" });
    const emb = await createEmbedding(getOllamaBase(asst), asst.embedModel || "nomic-embed-text", text);
    res.json({ embedding: emb });
  } catch (e) {
    res.status(500).json({ error: e.message || "Embed failed" });
  }
});

app.post("/assistants/:id/rag/search", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const text = (req.body?.text || "").toString();
    if (!text.trim()) return res.status(400).json({ error: "text required" });
    const client = getQdrantClient();
    const coll = collectionNameForAssistant(asst.id);
    const qv = await createEmbedding(getOllamaBase(asst), asst.embedModel || "nomic-embed-text", text);
    const hits = await searchContext(client, coll, qv, 5);
    res.json({ hits });
  } catch (e) {
    res.status(500).json({ error: e.message || "Search failed" });
  }
});

// ─── CRM: public chat session (no auth) ───
app.post("/crm/chat-session", async (req, res) => {
  try {
    const existing = req.body?.chatId;
    if (existing && isUuid(existing)) {
      const ch = await prisma.chat.findUnique({ where: { id: existing } });
      if (ch) return res.json({ chatId: ch.id });
    }
    const chat = await prisma.chat.create({
      data: { messages: [] },
    });
    res.json({ chatId: chat.id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Session failed" });
  }
});

/** Публичная выгрузка истории чата (UUID в localStorage — секрет ссылки) */
app.get("/crm/chat-transcript/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ error: "Invalid id" });
    const billCfg = getBillingConfig();
    const ipKey = `transcript:${clientIp(req)}`;
    if (!rateLimitByKeyHash(ipKey, Math.max(30, billCfg.rateLimitPerMin * 2))) {
      return res.status(429).json({ error: "Rate limit exceeded", retry_after_seconds: 60 });
    }
    const chat = await prisma.chat.findUnique({ where: { id } });
    if (!chat) return res.status(404).json({ error: "Not found" });
    const messages = parseChatMessagesJson(chat.messages);
    res.json({ id: chat.id, messages });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

function parseChatMessagesJson(json) {
  if (json == null) return [];
  if (Array.isArray(json)) return json;
  if (typeof json === "string") {
    try {
      const p = JSON.parse(json);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Первое сообщение пользователя — для заголовка лида/чата, если имя в БД пустое */
function firstUserSnippetFromMessages(json, max = 90) {
  const arr = parseChatMessagesJson(json);
  const u = arr.find((m) => m.role === "user");
  if (!u) return null;
  const t = String(u.content ?? "").trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Последняя реплика для списка чатов */
function lastMessageLineFromMessages(json, max = 100) {
  const arr = parseChatMessagesJson(json);
  if (arr.length === 0) return null;
  const last = arr[arr.length - 1];
  const t = String(last.content ?? "").trim();
  if (!t) return null;
  const label =
    last.role === "user"
      ? "Клиент"
      : last.role === "assistant"
        ? "AI"
        : last.role === "manager"
          ? "Менеджер"
          : "";
  const snippet = t.length > max ? `${t.slice(0, max - 1)}…` : t;
  return label ? `${label}: ${snippet}` : snippet;
}

/** 1) Append user turn. 2) Link assistant. 3) Auto-create Lead if missing. */
async function persistCrmUserAndLead(crmChatId, asst, userText) {
  const chat = await prisma.chat.findUnique({ where: { id: crmChatId } });
  if (!chat) return;
  let arr = parseChatMessagesJson(chat.messages);
  const last = arr[arr.length - 1];
  const dup = last && last.role === "user" && String(last.content ?? "") === userText;
  if (!dup) {
    arr.push({ role: "user", content: userText, at: new Date().toISOString() });
  }
  await prisma.chat.update({
    where: { id: crmChatId },
    data: { messages: arr, assistantId: asst.id },
  });
  let ref = await prisma.chat.findUnique({ where: { id: crmChatId } });
  if (ref && !ref.leadId) {
    const title =
      userText.length > 100 ? `${userText.slice(0, 97)}…` : userText;
    const lead = await prisma.lead.create({
      data: { status: "new", name: title, phone: null },
    });
    await prisma.chat.update({
      where: { id: crmChatId },
      data: { leadId: lead.id },
    });
    ref = await prisma.chat.findUnique({ where: { id: crmChatId } });
  } else if (ref?.leadId) {
    const leadRow = await prisma.lead.findUnique({ where: { id: ref.leadId } });
    if (leadRow && !(leadRow.name && String(leadRow.name).trim())) {
      const title =
        userText.length > 100 ? `${userText.slice(0, 97)}…` : userText;
      await prisma.lead.update({
        where: { id: ref.leadId },
        data: { name: title },
      });
    }
  }
  return ref;
}

async function persistCrmAssistantReply(crmChatId, replyText) {
  const chat = await prisma.chat.findUnique({ where: { id: crmChatId } });
  if (!chat) return;
  const arr = parseChatMessagesJson(chat.messages);
  arr.push({ role: "assistant", content: String(replyText ?? ""), at: new Date().toISOString() });
  await prisma.chat.update({
    where: { id: crmChatId },
    data: { messages: arr },
  });
}

// ─── Chat ───
app.post("/chat", async (req, res) => {
  console.log("CHAT REQUEST START", Date.now());
  const { messages, chatId: crmChatId } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages[] required" });
  }
  const billCfg = getBillingConfig();
  const ipKey = `chat:${clientIp(req)}`;
  if (!rateLimitByKeyHash(ipKey, billCfg.rateLimitPerMin)) {
    return res.status(429).json({ error: "Rate limit exceeded", retry_after_seconds: 60 });
  }
  try {
    const asst = await getActiveAssistant();
    if (!asst) return res.status(503).json({ error: "No active assistant configured" });

    const bKey = await ensureApiKeyForAssistant(prisma, asst.id);
    if (!bKey.isActive) return res.status(403).json({ error: "API key disabled" });
    if (bKey.balance <= 0) return res.status(402).json({ error: "Insufficient balance" });

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const userText = String(lastUserMsg?.content ?? "").trim();
    if (!userText) {
      return res.status(400).json({ error: "Last message must be a non-empty user message" });
    }

    if (crmChatId && isUuid(crmChatId)) {
      try {
        await persistCrmUserAndLead(crmChatId, asst, userText);
      } catch (persistErr) {
        console.error("[crm] persist user/lead", crmChatId, persistErr);
      }
    }

    const useOllama = (asst.provider || "").toLowerCase() === "ollama" || (asst.provider || "").toLowerCase() === "local";

    if (useOllama) {
      const ollamaStarted = Date.now();
      console.log("BEFORE QUEUE");
      const result = await chatWithRag({ assistant: asst, messages });
      console.log("AFTER QUEUE");
      console.log("OLLAMA DIRECT TIME:", Date.now() - ollamaStarted);
      const { reply, usedContext, promptTokens, completionTokens } = result;
      if (crmChatId && isUuid(crmChatId)) {
        try {
          await persistCrmAssistantReply(crmChatId, reply);
        } catch (persistErr) {
          console.error("[crm] persist assistant", crmChatId, persistErr);
        }
      }
      const cost = computeUsageCost(billCfg, {
        promptTokens,
        completionTokens,
        messageCount: 1,
      });
      let billing = null;
      try {
        billing = await deductBalanceAndLog(prisma, bKey.id, {
          tokensApprox: promptTokens + completionTokens,
          messagesCount: 1,
          cost,
          path: "chat",
        });
      } catch (be) {
        console.error("[billing] deduct", be);
      }
      return res.json({ reply, used_context: usedContext, provider: "ollama", billing });
    }

    const apiToken = asst.providerApiKey || OPENAI_FALLBACK;
    if (!apiToken) {
      return res.status(503).json({ error: "Provider API key not configured (or switch assistant provider to ollama)" });
    }

    const text = await chatOpenAiCompatible({
      baseUrl: asst.baseUrl,
      apiKey: apiToken,
      model: asst.model,
      systemPrompt: asst.systemPrompt,
      messages,
    });
    if (crmChatId && isUuid(crmChatId)) {
      try {
        await persistCrmAssistantReply(crmChatId, text);
      } catch (persistErr) {
        console.error("[crm] persist assistant", crmChatId, persistErr);
      }
    }
    const tokensApprox = estimateTokensFromText([JSON.stringify(messages), text]);
    const cost = computeUsageCost(billCfg, {
      promptTokens: Math.ceil(tokensApprox / 2),
      completionTokens: Math.floor(tokensApprox / 2),
      messageCount: 1,
    });
    let billing = null;
    try {
      billing = await deductBalanceAndLog(prisma, bKey.id, {
        tokensApprox,
        messagesCount: 1,
        cost,
        path: "chat",
      });
    } catch (be) {
      console.error("[billing] deduct", be);
    }
    res.json({ reply: text, provider: "openai_compatible", billing });
  } catch (e) {
    res.status(502).json({ error: e.message || "Fetch failed" });
  }
});

// ─── Billing (admin) ───
app.get("/billing/overview", requireAuth, async (_req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        assistant: { select: { id: true, name: true, apiKeyPrefix: true } },
      },
    });
    const usageAgg = await prisma.usageLog.groupBy({
      by: ["apiKeyId"],
      _sum: { cost: true, tokensApprox: true },
      _count: { id: true },
    });
    const aggMap = Object.fromEntries(
      usageAgg.map((r) => [
        r.apiKeyId,
        { total_cost: r._sum.cost ?? 0, total_tokens: r._sum.tokensApprox ?? 0, requests: r._count.id },
      ]),
    );
    const top = [...usageAgg]
      .sort((a, b) => (Number(b._sum.cost) || 0) - (Number(a._sum.cost) || 0))
      .slice(0, 15)
      .map((r) => {
        const k = keys.find((x) => x.id === r.apiKeyId);
        return {
          api_key_id: r.apiKeyId,
          assistant_name: k?.assistant?.name ?? null,
          key: k?.key ?? null,
          total_cost: r._sum.cost ?? 0,
          requests: r._count.id,
        };
      });
    const recent = await prisma.usageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        apiKey: { include: { assistant: { select: { name: true } } } },
      },
    });
    res.json({
      keys: keys.map((k) => ({
        id: k.id,
        key: k.key,
        balance: k.balance,
        is_active: k.isActive,
        assistant_id: k.assistantId,
        assistant_name: k.assistant?.name,
        api_key_prefix: k.assistant?.apiKeyPrefix,
        usage: aggMap[k.id] || { total_cost: 0, total_tokens: 0, requests: 0 },
      })),
      top_users: top,
      recent_usage: recent.map((u) => ({
        id: u.id,
        cost: u.cost,
        tokens_approx: u.tokensApprox,
        messages_count: u.messagesCount,
        path: u.path,
        created_at: u.createdAt.toISOString(),
        assistant_name: u.apiKey?.assistant?.name,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.patch("/billing/keys/:id", requireAuth, async (req, res) => {
  try {
    const { balance, is_active, add_balance } = req.body || {};
    const data = {};
    if (balance != null) data.balance = Number(balance);
    if (add_balance != null) {
      const cur = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
      if (!cur) return res.status(404).json({ error: "Not found" });
      data.balance = (Number(cur.balance) || 0) + Number(add_balance);
    }
    if (is_active != null) data.isActive = !!is_active;
    if (!Object.keys(data).length) return res.status(400).json({ error: "No fields" });
    const row = await prisma.apiKey.update({
      where: { id: req.params.id },
      data,
    });
    res.json({
      id: row.id,
      key: row.key,
      balance: row.balance,
      is_active: row.isActive,
    });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(400).json({ error: e.message || "Failed" });
  }
});

// ─── CRM admin (auth) ───
app.get("/crm/analytics", requireAuth, async (_req, res) => {
  try {
    const [chats, leads, sumRow] = await Promise.all([
      prisma.chat.count(),
      prisma.lead.count(),
      prisma.$queryRaw`SELECT COALESCE(SUM(jsonb_array_length(COALESCE(messages, '[]'::jsonb))), 0)::bigint AS c FROM "crm_chats"`,
    ]);
    const messages = Number(Array.isArray(sumRow) && sumRow[0]?.c != null ? sumRow[0].c : 0);
    const byAssistant = await prisma.chat.groupBy({
      by: ["assistantId"],
      _count: { id: true },
    });
    res.json({
      chats,
      leads,
      messages,
      by_assistant: byAssistant.map((x) => ({
        assistant_id: x.assistantId,
        chats: x._count.id,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/crm/leads", requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chats: true } },
        chats: {
          select: { id: true, messages: true, updatedAt: true },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    res.json(
      rows.map((l) => {
        const primary = l.chats[0];
        const msgArr = primary ? parseChatMessagesJson(primary.messages) : [];
        const fromChatTitle = primary ? firstUserSnippetFromMessages(primary.messages) : null;
        const lastPrev = primary ? lastMessageLineFromMessages(primary.messages) : null;
        const dbName = l.name && String(l.name).trim() ? String(l.name).trim() : null;
        const display_name = dbName || fromChatTitle || null;
        return {
          id: l.id,
          name: l.name,
          display_name,
          phone: l.phone,
          status: l.status,
          created_at: l.createdAt.toISOString(),
          chats_count: l._count.chats,
          chat_id: primary?.id ?? null,
          last_message_preview: lastPrev,
          message_count: msgArr.length,
        };
      }),
    );
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.post("/crm/leads", requireAuth, async (req, res) => {
  try {
    const { name, phone, status } = req.body || {};
    const lead = await prisma.lead.create({
      data: {
        name: name != null ? String(name) : null,
        phone: phone != null ? String(phone) : null,
        ...(status != null ? { status: String(status) } : {}),
      },
    });
    res.json({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      created_at: lead.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.patch("/crm/leads/:id", requireAuth, async (req, res) => {
  try {
    const { name, phone, status } = req.body || {};
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name: name === null ? null : String(name) }),
        ...(phone !== undefined && { phone: phone === null ? null : String(phone) }),
        ...(status !== undefined && { status: String(status) }),
      },
    });
    res.json({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      created_at: lead.createdAt.toISOString(),
    });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/crm/chats", requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: { lead: true },
    });
    res.json(
      rows.map((c) => {
        const msgArr = parseChatMessagesJson(c.messages);
        const n = msgArr.length;
        const leadName = c.lead?.name && String(c.lead.name).trim() ? String(c.lead.name).trim() : null;
        const fromChat = firstUserSnippetFromMessages(c.messages);
        const display_title = leadName || fromChat || "Диалог с сайта";
        return {
          id: c.id,
          lead_id: c.leadId,
          lead: c.lead
            ? { id: c.lead.id, name: c.lead.name, phone: c.lead.phone, status: c.lead.status }
            : null,
          display_title,
          last_message_preview: lastMessageLineFromMessages(c.messages),
          status: c.status,
          message_count: n,
          created_at: c.createdAt.toISOString(),
          updated_at: c.updatedAt.toISOString(),
        };
      }),
    );
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/crm/chats/:id", requireAuth, async (req, res) => {
  try {
    const c = await prisma.chat.findUnique({
      where: { id: req.params.id },
      include: { lead: true },
    });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json({
      id: c.id,
      lead_id: c.leadId,
      lead: c.lead
        ? { id: c.lead.id, name: c.lead.name, phone: c.lead.phone, status: c.lead.status }
        : null,
      status: c.status,
      messages: c.messages,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.patch("/crm/chats/:id", requireAuth, async (req, res) => {
  try {
    const { status, leadId } = req.body || {};
    const data = {};
    if (status !== undefined) data.status = String(status);
    if (leadId !== undefined) data.leadId = leadId === null || leadId === "" ? null : String(leadId);
    const c = await prisma.chat.update({
      where: { id: req.params.id },
      data,
      include: { lead: true },
    });
    res.json({
      id: c.id,
      lead_id: c.leadId,
      lead: c.lead
        ? { id: c.lead.id, name: c.lead.name, phone: c.lead.phone, status: c.lead.status }
        : null,
      status: c.status,
      messages: c.messages,
      updated_at: c.updatedAt.toISOString(),
    });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    res.status(500).json({ error: e.message || "Failed" });
  }
});

/** Добавить сообщение менеджера в переписку (ответ клиенту вместо/после AI) */
app.post("/crm/chats/:id/messages", requireAuth, async (req, res) => {
  try {
    const text = String(req.body?.text ?? "").trim();
    if (!text) return res.status(400).json({ error: "text required" });
    const chat = await prisma.chat.findUnique({ where: { id: req.params.id } });
    if (!chat) return res.status(404).json({ error: "Not found" });
    const arr = parseChatMessagesJson(chat.messages);
    arr.push({
      role: "manager",
      content: text,
      at: new Date().toISOString(),
    });
    await prisma.chat.update({
      where: { id: req.params.id },
      data: { messages: arr, updatedAt: new Date() },
    });
    res.json({ ok: true, messages: arr });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("[cms-server] unhandledRejection", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[cms-server] uncaughtException", err);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[cms-server] http://127.0.0.1:${PORT} (Prisma)`);
});
