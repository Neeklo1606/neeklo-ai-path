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
  collectionNameForKnowledgeGraph,
  createEmbedding,
  createOpenAiCompatibleEmbedding,
  generateResponse,
  chunkText,
  extractTextFromFile,
  parseKnowledgeNoteFromMarkdown,
  upsertChunks,
  upsertKnowledgeGraph,
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
function isOllamaAssistant(assistant) {
  const p = String(assistant?.provider || "").toLowerCase();
  return p === "ollama" || p === "local";
}

function getAssistantProviderToken(assistant) {
  return assistant?.providerApiKey || OPENAI_FALLBACK;
}

async function createAssistantEmbedding(assistant, text) {
  if (isOllamaAssistant(assistant)) {
    return createEmbedding(getOllamaBase(assistant), assistant.embedModel || "nomic-embed-text", text);
  }
  const token = getAssistantProviderToken(assistant);
  if (!token) throw new Error("Provider API key not configured");
  return createOpenAiCompatibleEmbedding({
    baseUrl: assistant.baseUrl,
    apiKey: token,
    model: assistant.embedModel || "text-embedding-3-small",
    text,
  });
}

async function reindexAssistantKnowledge(assistant) {
  const client = getQdrantClient();
  const coll = collectionNameForAssistant(assistant.id);
  const points = [];
  let nextOffset = undefined;
  for (let i = 0; i < 20; i += 1) {
    const out = await client.scroll(coll, {
      limit: 128,
      with_payload: true,
      with_vector: false,
      offset: nextOffset,
    });
    const batch = Array.isArray(out?.points) ? out.points : [];
    points.push(...batch);
    if (!out?.next_page_offset || batch.length === 0) break;
    nextOffset = out.next_page_offset;
  }
  const chunks = points
    .map((p) => ({
      text: String(p?.payload?.text || "").trim(),
      source: String(p?.payload?.source || "reindexed"),
    }))
    .filter((c) => c.text);
  if (!chunks.length) return { reindexed: 0, collection: coll };

  await client.deleteCollection(coll).catch(() => undefined);
  const out = await upsertChunks({
    client,
    collectionName: coll,
    ollamaBase: getOllamaBase(assistant),
    embedModel: assistant.embedModel || "nomic-embed-text",
    assistantId: assistant.id,
    chunks,
    source: "reindex",
    embedText: (text) => createAssistantEmbedding(assistant, text),
  });
  return { reindexed: out?.upserted || 0, collection: coll };
}


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

function detectPrototypeIntent(text) {
  const q = String(text || "").toLowerCase();
  return /(прототип|лендинг|landing|показать\s+решение|пример\s+сайта|собери\s+сайт|создай\s+сайт|макет\s+сайта)/i.test(q);
}

function inferKnowledgeTaxonomyFromText(source, text) {
  const src = String(source || "manual");
  const body = String(text || "");
  const low = `${src}\n${body}`.toLowerCase();
  const has = (re) => re.test(low);

  let category = "";
  if (has(/\b(video|reels|tiktok|shorts|ролик|видео|аватар|промо)\b/u)) category = "AI-видео";
  else if (has(/\b(лендинг|сайт|landing|react|seo|h1|метрика)\b/u)) category = "Сайты";
  else if (has(/\b(bot|бот|telegram|mini app|мини.?апп|ассистент)\b/u)) category = "Боты и AI-ассистенты";
  else if (has(/\b(n8n|make|zapier|crm|amocrm|битрикс|интеграц|автоматиз)\b/u)) category = "Автоматизация";
  else if (has(/\b(цена|стоим|прайс|от \d|₽|руб|k\b|пакет)\b/u)) category = "Цены и пакеты";
  else if (has(/\b(этап|договор|предоплат|гарант|срок|оплат)\b/u)) category = "Процесс работы";
  else if (has(/\b(faq|вопрос|ответ|q:|a:)\b/u)) category = "FAQ";
  else if (has(/\b(команда|ceo|developer|project manager|продаж)\b/u)) category = "Команда";
  else if (has(/\b(контакт|telegram|whatsapp|написать|связа)\b/u)) category = "Контакты";

  let section = "";
  if (src.startsWith("file:")) {
    const fileName = src.replace(/^file:/, "");
    const pieces = fileName.split(/[\\/]/g).filter(Boolean);
    if (pieces.length > 1) section = pieces[pieces.length - 2];
  }
  if (!section && has(/\b(прайс|price|стоим|цена|пакет)\b/u)) section = "Прайс";
  if (!section && has(/\b(faq|вопрос|ответ)\b/u)) section = "FAQ";
  if (!section && has(/\b(этап|договор|оплат|гарант)\b/u)) section = "Регламент";
  if (!section && has(/\b(кейс|пример|ниша)\b/u)) section = "Кейсы";
  if (!section && has(/\b(видео|ролик|reels|shorts)\b/u)) section = "Видео";
  if (!section) section = "Общее";

  const tags = [];
  if (has(/\b(telegram|телеграм)\b/u)) tags.push("telegram");
  if (has(/\b(crm|amocrm|битрикс)\b/u)) tags.push("crm");
  if (has(/\b(n8n|make|zapier)\b/u)) tags.push("automation");
  if (has(/\b(video|видео|ролик|reels|shorts)\b/u)) tags.push("video");
  if (has(/\b(лендинг|сайт|seo|react)\b/u)) tags.push("web");
  if (has(/\b(ai|gpt|ассистент|llm)\b/u)) tags.push("ai");
  if (has(/\b(цена|стоим|прайс|₽|руб)\b/u)) tags.push("pricing");

  return { category, section, tags: [...new Set(tags)] };
}

function buildDerivedNodeFromChunkPayload(payload, idx, pointId = "") {
  const source = String(payload?.source || "manual");
  const text = String(payload?.text || "");
  const taxonomy = inferKnowledgeTaxonomyFromText(source, text);
  const title = source.startsWith("file:") ? source.replace(/^file:/, "") : `chunk-${idx + 1}`;
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120) || `chunk-${idx + 1}`;
  return {
    id: `${slug}-${idx + 1}`,
    chunk_id: String(pointId || ""),
    title,
    source,
    category: taxonomy.category,
    section: taxonomy.section,
    tags: taxonomy.tags,
    snippet: text.slice(0, 900).trim(),
  };
}

function getPublicSiteBase() {
  const raw = String(process.env.PUBLIC_SITE_BASE || "https://neeklo.ru").trim();
  return raw.replace(/\/$/, "");
}

function sanitizeSlugPart(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 42) || "landing";
}

function renderPrototypeHtml({ title, subtitle, offer, audience, cta, blocks }) {
  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const listHtml = Array.isArray(blocks)
    ? blocks
        .map(
          (b) => `<section class="card"><h3>${esc(b?.title || "")}</h3><p>${esc(b?.text || "")}</p></section>`,
        )
        .join("\n")
    : "";
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title || "Прототип лендинга")}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0}
    .wrap{max-width:980px;margin:0 auto;padding:28px 18px 64px}
    .hero{background:#0f172a;color:#fff;border-radius:18px;padding:28px}
    .hero h1{font-size:38px;line-height:1.1;margin:0 0 12px}
    .hero p{font-size:18px;opacity:.9;margin:0 0 18px}
    .badge{display:inline-block;padding:7px 10px;border-radius:999px;background:#1e293b;font-size:12px}
    .cta{display:inline-block;margin-top:18px;padding:12px 18px;border-radius:12px;background:#22c55e;color:#fff;text-decoration:none;font-weight:700}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:20px}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px}
    .card h3{margin:0 0 8px}
    .footer{margin-top:26px;color:#475569;font-size:14px}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="badge">AI-прототип</span>
      <h1>${esc(title || "Лендинг под вашу задачу")}</h1>
      <p>${esc(subtitle || "Черновой вариант страницы, собранный ассистентом.")}</p>
      <p><strong>Оффер:</strong> ${esc(offer || "Уточнить на созвоне")}</p>
      <p><strong>Для кого:</strong> ${esc(audience || "Целевая аудитория по вашему описанию")}</p>
      <a class="cta" href="#">${esc(cta || "Оставить заявку")}</a>
    </section>
    <section class="grid">${listHtml}</section>
    <p class="footer">Это прототип-черновик. Контент и дизайн можно доработать перед запуском.</p>
  </main>
</body>
</html>`;
}

/** Single public chat assistant: newest active row. */
async function getActiveAssistant() {
  return prisma.assistant.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getAssistantKnowledgePoints(assistantId) {
  try {
    const client = getQdrantClient();
    const coll = collectionNameForAssistant(assistantId);
    const counted = await Promise.race([
      client.count(coll, { exact: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Qdrant count timeout")), 3000)),
    ]);
    return typeof counted === "number" ? counted : Number(counted?.count ?? 0);
  } catch {
    return 0;
  }
}

async function resolveAssistantForPublicChat() {
  const activeRows = await prisma.assistant.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  if (!activeRows.length) return null;
  if (activeRows.length === 1) return activeRows[0];

  const withPoints = await Promise.all(
    activeRows.map(async (a) => ({
      assistant: a,
      points: await getAssistantKnowledgePoints(a.id),
    })),
  );
  const bestWithKb = withPoints.find((x) => x.points > 0);
  return (bestWithKb?.assistant || activeRows[0]) ?? null;
}

async function buildPrototypeLandingJob(jobId) {
  const job = await prisma.prototypeJob.findUnique({
    where: { id: jobId },
    include: { assistant: true },
  });
  if (!job) return;
  const asst = job.assistant;
  const patch = (data) => prisma.prototypeJob.update({ where: { id: job.id }, data });
  try {
    await patch({ status: "analyzing", progress: 15 });
    const systemPrompt =
      "Ты генератор прототипов лендинга. Верни строго JSON с полями: title, subtitle, offer, audience, cta, blocks[]. " +
      "blocks[]: минимум 5 объектов, каждый объект: {title, text}. Только русский язык.";
    const userPrompt = `Собери контент для лендинга по брифу пользователя:\n${job.briefText}`;
    let raw = "";
    if (isOllamaAssistant(asst)) {
      const out = await generateResponse(getOllamaBase(asst), asst.model || "qwen2.5:7b", [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);
      raw = String(out.text || "");
    } else {
      const token = getAssistantProviderToken(asst);
      if (!token) throw new Error("Provider API key not configured for prototype generation");
      raw = await chatOpenAiCompatible({
        baseUrl: asst.baseUrl,
        apiKey: token,
        model: asst.model || "gpt-4o-mini",
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
    }
    await patch({ status: "generating_copy", progress: 45 });
    let parsed = null;
    try {
      const maybeJson = String(raw).match(/\{[\s\S]*\}/);
      parsed = maybeJson ? JSON.parse(maybeJson[0]) : JSON.parse(raw);
    } catch {
      parsed = {
        title: "Лендинг под ваш запрос",
        subtitle: "Подготовили черновой прототип на основе вашего описания.",
        offer: "Решение под задачу бизнеса",
        audience: "Целевая аудитория по вашему брифу",
        cta: "Получить предложение",
        blocks: [
          { title: "Проблема клиента", text: "Опишем ключевую боль и контекст." },
          { title: "Наше решение", text: "Покажем, как решаем задачу быстро и прозрачно." },
          { title: "Этапы работ", text: "Бриф -> прототип -> согласование -> запуск." },
          { title: "Сроки и бюджет", text: "Фиксируем сроки и предлагаем пакет под цель." },
          { title: "Следующий шаг", text: "Оставьте заявку и получите КП в течение 24 часов." },
        ],
      };
    }
    await patch({ normalizedBrief: parsed, status: "assembling_layout", progress: 70 });
    const slug = `prototype-${Date.now()}-${sanitizeSlugPart(parsed?.title || "landing")}`.slice(0, 90);
    const html = renderPrototypeHtml(parsed || {});
    const publicUrl = `${getPublicSiteBase()}/cms-api/prototype/${encodeURIComponent(slug)}`;
    await patch({
      status: "publishing",
      progress: 88,
      resultSlug: slug,
      resultUrl: publicUrl,
      resultHtml: html,
    });
    await patch({ status: "done", progress: 100 });
  } catch (e) {
    await patch({
      status: "failed",
      progress: 100,
      error: String(e?.message || e || "Prototype generation failed"),
    });
  }
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
    const asst = await resolveAssistantForPublicChat();
    res.json({
      welcomeMessage,
      pageTitle,
      headerTitle,
      statusLabel,
      inputPlaceholder,
      hasAssistant: !!asst,
      assistantId: asst?.id || null,
      assistantName: asst?.name || null,
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

app.post("/assistants/models/openai", requireAuth, async (req, res) => {
  try {
    const base = String(req.body?.base_url || "https://api.openai.com/v1").trim().replace(/\/$/, "");
    const apiKey = String(req.body?.api_key || "").trim();
    if (!apiKey) return res.status(400).json({ error: "api_key required" });

    const r = await fetch(`${base}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = json?.error?.message || json?.error || `Upstream models error (${r.status})`;
      return res.status(502).json({ error: String(msg) });
    }
    const rows = Array.isArray(json?.data) ? json.data : [];
    const models = rows
      .map((m) => String(m?.id || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return res.json({ models });
  } catch (e) {
    return res.status(502).json({ error: e?.message || "Failed to load models" });
  }
});

app.post("/assistants/:id/knowledge/help", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "question required" });
    const points = Number(req.body?.points ?? 0) || 0;
    const context = `Assistant=${asst.name}; provider=${asst.provider}; chatModel=${asst.model}; embedModel=${asst.embedModel}; kbPoints=${points}`;
    const helperPrompt =
      "Ты помощник настройки базы знаний для нетехнического пользователя. " +
      "Дай короткий ответ: 3-6 шагов, простые слова, без терминов где можно. " +
      "Отвечай только про действия внутри админки neeklo (/admin/knowledge): модель, ключ, импорт файлов .md/.pdf/.docx, проверка точек базы знаний, тест чата. " +
      "Не объясняй установку программ и не давай общих инструкций по установке Obsidian. " +
      "Если есть ошибка модели/доступа — дай как исправить по шагам именно в текущем интерфейсе.";

    if (isOllamaAssistant(asst)) {
      const out = await generateResponse(getOllamaBase(asst), asst.model || "qwen2.5:7b", [
        { role: "system", content: helperPrompt },
        { role: "user", content: `Контекст: ${context}\nВопрос: ${question}` },
      ]);
      return res.json({ answer: String(out.text || "").trim() });
    }

    const apiToken = getAssistantProviderToken(asst);
    if (!apiToken) return res.status(503).json({ error: "Provider API key not configured" });
    const answer = await chatOpenAiCompatible({
      baseUrl: asst.baseUrl,
      apiKey: apiToken,
      model: asst.model || "gpt-4o-mini",
      systemPrompt: helperPrompt,
      messages: [{ role: "user", content: `Контекст: ${context}\nВопрос: ${question}` }],
    });
    return res.json({ answer: String(answer || "").trim() });
  } catch (e) {
    return res.status(502).json({ error: e?.message || "LLM helper failed" });
  }
});

app.get("/assistants/:id/knowledge/chunks", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const client = getQdrantClient();
    const coll = collectionNameForAssistant(asst.id);
    const limit = Math.max(1, Math.min(50, Number(req.query?.limit || 24)));
    let points = [];
    try {
      const out = await client.scroll(coll, {
        limit,
        with_payload: true,
        with_vector: false,
      });
      points = Array.isArray(out?.points) ? out.points : [];
    } catch {
      points = [];
    }
    const chunks = points.map((p, idx) => ({
      id: String(p?.id ?? `chunk-${idx + 1}`),
      text: String(p?.payload?.text || ""),
      source: String(p?.payload?.source || "manual"),
    }));
    return res.json({ chunks });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to load chunks" });
  }
});

app.get("/assistants/:id/knowledge/graph", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const client = getQdrantClient();
    const coll = collectionNameForKnowledgeGraph(asst.id);
    let points = [];
    try {
      const out = await client.scroll(coll, {
        limit: 2000,
        with_payload: true,
        with_vector: false,
      });
      points = Array.isArray(out?.points) ? out.points : [];
    } catch {
      points = [];
    }

    const categoryFilter = String(req.query?.category || "").trim();
    const sectionFilter = String(req.query?.section || "").trim();
    const tagFilter = String(req.query?.tag || "").trim();

    let nodesAll = points
      .map((p) => p?.payload || null)
      .filter((p) => p?.kind === "node")
      .map((p) => ({
        id: String(p.slug || ""),
        title: String(p.title || p.slug || ""),
        source: String(p.source || "manual"),
        category: p.category ? String(p.category) : "",
        section: p.section ? String(p.section) : "",
        tags: Array.isArray(p.tags) ? p.tags.map((t) => String(t || "")).filter(Boolean) : [],
        snippet: "",
        chunk_id: "",
      }))
      .filter((n) => n.id);

    // Backward-compatible fallback:
    // if dedicated graph collection has no nodes yet, derive nodes from existing chunk collection.
    let fallbackEdges = [];
    if (!nodesAll.length) {
      const chunkColl = collectionNameForAssistant(asst.id);
      let chunkPoints = [];
      try {
        const out = await client.scroll(chunkColl, {
          limit: 1000,
          with_payload: true,
          with_vector: false,
        });
        chunkPoints = Array.isArray(out?.points) ? out.points : [];
      } catch {
        chunkPoints = [];
      }
      const derived = chunkPoints
        .map((p, idx) => {
          const payload = p?.payload || {};
          return buildDerivedNodeFromChunkPayload(payload, idx, String(p?.id || ""));
        });
      nodesAll = derived;
      // Build grouped links by category/section for better structured clusters.
      const byCategory = new Map();
      for (const n of derived) {
        const key = n.category || "Общее";
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(n);
      }
      const edgeSet = new Set();
      for (const group of byCategory.values()) {
        for (let i = 1; i < group.length; i += 1) {
          edgeSet.add(`${group[i - 1].id}->${group[i].id}`);
        }
      }
      fallbackEdges = [...edgeSet].map((id) => {
        const [from, to] = id.split("->");
        return { id, from, to };
      });
    }

    const nodes = nodesAll.filter((n) => {
      if (categoryFilter && n.category !== categoryFilter) return false;
      if (sectionFilter && n.section !== sectionFilter) return false;
      if (tagFilter && !n.tags.includes(tagFilter)) return false;
      return true;
    });
    const nodeIds = new Set(nodes.map((n) => n.id));

    const edges = points
      .map((p) => p?.payload || null)
      .filter((p) => p?.kind === "edge")
      .map((p) => ({
        id: `${String(p.from || "")}->${String(p.to || "")}`,
        from: String(p.from || ""),
        to: String(p.to || ""),
      }))
      .filter((e) => e.from && e.to && nodeIds.has(e.from) && nodeIds.has(e.to));
    const outEdges = edges.length ? edges : fallbackEdges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));

    const categories = [...new Set(nodesAll.map((n) => n.category).filter(Boolean))].sort();
    const sections = [...new Set(nodesAll.map((n) => n.section).filter(Boolean))].sort();
    const tags = [...new Set(nodesAll.flatMap((n) => n.tags || []).filter(Boolean))].sort();

    return res.json({ nodes, edges: outEdges, facets: { categories, sections, tags } });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to load graph" });
  }
});

app.post("/assistants/:id/knowledge/coach", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const answers = req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : {};
    const goal = String(req.body?.goal || "").trim() || "Создать качественную базу знаний для ассистента сайта";
    const helperPrompt =
      "Ты коуч настройки базы знаний в админке neeklo. " +
      "Сначала задай 1 следующий вопрос, который нужен для сбора данных (без воды). " +
      "Когда данных достаточно — верни готовый черновик знаний (chunk-ready) в markdown. " +
      "Отвечай JSON-строкой: {\"next_question\":\"...\",\"draft\":\"...\",\"is_ready\":true|false}.";

    const userText = `GOAL:\n${goal}\n\nANSWERS:\n${JSON.stringify(answers, null, 2)}`;
    let raw = "";
    if (isOllamaAssistant(asst)) {
      const out = await generateResponse(getOllamaBase(asst), asst.model || "qwen2.5:7b", [
        { role: "system", content: helperPrompt },
        { role: "user", content: userText },
      ]);
      raw = String(out.text || "").trim();
    } else {
      const apiToken = getAssistantProviderToken(asst);
      if (!apiToken) return res.status(503).json({ error: "Provider API key not configured" });
      raw = await chatOpenAiCompatible({
        baseUrl: asst.baseUrl,
        apiKey: apiToken,
        model: asst.model || "gpt-4o-mini",
        systemPrompt: helperPrompt,
        messages: [{ role: "user", content: userText }],
      });
    }
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        next_question: "Уточните: какие 3 ключевые услуги и для какой аудитории?",
        draft: "",
        is_ready: false,
      };
    }
    return res.json({
      next_question: String(parsed?.next_question || ""),
      draft: String(parsed?.draft || ""),
      is_ready: Boolean(parsed?.is_ready),
    });
  } catch (e) {
    return res.status(502).json({ error: e?.message || "LLM coach failed" });
  }
});

// ─── Assistant knowledge (RAG) — admin ───
app.post("/assistants/:id/knowledge/text", requireAuth, async (req, res) => {
  const text = (req.body?.text || "").toString();
  if (!text.trim()) return res.status(400).json({ error: "text required" });
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const coll = collectionNameForAssistant(asst.id);
    const chunks = chunkText(text);
    if (!chunks.length) return res.status(400).json({ error: "No chunks after split" });
    const client = getQdrantClient();
    const out = await upsertChunks({
      client,
      collectionName: coll,
      ollamaBase: getOllamaBase(asst),
      embedModel: asst.embedModel || "nomic-embed-text",
      assistantId: asst.id,
      chunks,
      source: "manual",
      embedText: (t) => createAssistantEmbedding(asst, t),
    });
    const graphCollection = collectionNameForKnowledgeGraph(asst.id);
    const note = parseKnowledgeNoteFromMarkdown(text, "manual");
    if (note) {
      const inferred = inferKnowledgeTaxonomyFromText("manual", text);
      if (!note.category) note.category = inferred.category || null;
      if (!note.section) note.section = inferred.section || null;
      if (!Array.isArray(note.tags) || !note.tags.length) note.tags = inferred.tags || [];
    }
    let graphOut = { nodes: 0, edges: 0 };
    if (note) {
      graphOut = await upsertKnowledgeGraph({
        client,
        collectionName: graphCollection,
        assistantId: asst.id,
        notes: [note],
      });
    }
    res.json({ ok: true, ...out, graph: graphOut });
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
    const coll = collectionNameForAssistant(asst.id);
    const client = getQdrantClient();
    const out = await upsertChunks({
      client,
      collectionName: coll,
      ollamaBase: getOllamaBase(asst),
      embedModel: asst.embedModel || "nomic-embed-text",
      assistantId: asst.id,
      chunks,
      source: `file:${f.originalname}`,
      embedText: (t) => createAssistantEmbedding(asst, t),
    });
    const graphCollection = collectionNameForKnowledgeGraph(asst.id);
    const source = `file:${f.originalname}`;
    const note = parseKnowledgeNoteFromMarkdown(raw, source);
    if (note) {
      const inferred = inferKnowledgeTaxonomyFromText(source, raw);
      if (!note.category) note.category = inferred.category || null;
      if (!note.section) note.section = inferred.section || null;
      if (!Array.isArray(note.tags) || !note.tags.length) note.tags = inferred.tags || [];
    }
    let graphOut = { nodes: 0, edges: 0 };
    if (note) {
      graphOut = await upsertKnowledgeGraph({
        client,
        collectionName: graphCollection,
        assistantId: asst.id,
        notes: [note],
      });
    }
    res.json({ ok: true, ...out, filename: f.originalname, graph: graphOut });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Upload ingest failed" });
  }
});

app.delete("/assistants/:id/knowledge/chunks/:chunkId", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const chunkId = String(req.params.chunkId || "").trim();
    if (!chunkId) return res.status(400).json({ error: "chunkId required" });
    const coll = collectionNameForAssistant(asst.id);
    const client = getQdrantClient();
    await client.delete(coll, { wait: true, points: [chunkId] }).catch(() => undefined);
    return res.json({ ok: true, deleted: chunkId });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Chunk delete failed" });
  }
});

app.delete("/assistants/:id/knowledge/topic", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const category = String(req.body?.category || "").trim();
    const section = String(req.body?.section || "").trim();
    const tag = String(req.body?.tag || "").trim();
    if (!category && !section && !tag) {
      return res.status(400).json({ error: "Pass at least one filter: category, section, or tag" });
    }
    const client = getQdrantClient();
    const graphColl = collectionNameForKnowledgeGraph(asst.id);
    const chunkColl = collectionNameForAssistant(asst.id);

    // Remove from graph collection (real nodes/edges)
    let graphPoints = [];
    try {
      const out = await client.scroll(graphColl, { limit: 4000, with_payload: true, with_vector: false });
      graphPoints = Array.isArray(out?.points) ? out.points : [];
    } catch {
      graphPoints = [];
    }
    const matchNode = (p) => {
      if (p?.kind !== "node") return false;
      const pTags = Array.isArray(p?.tags) ? p.tags.map((x) => String(x)) : [];
      if (category && String(p?.category || "") !== category) return false;
      if (section && String(p?.section || "") !== section) return false;
      if (tag && !pTags.includes(tag)) return false;
      return true;
    };
    const nodeSlugs = new Set(
      graphPoints.map((x) => x?.payload || null).filter(matchNode).map((p) => String(p.slug || "")).filter(Boolean),
    );
    const graphIdsToDelete = graphPoints
      .map((x) => x?.payload || null)
      .filter((p) => {
        if (!p) return false;
        if (p.kind === "node" && nodeSlugs.has(String(p.slug || ""))) return true;
        if (p.kind === "edge" && (nodeSlugs.has(String(p.from || "")) || nodeSlugs.has(String(p.to || "")))) return true;
        return false;
      })
      .map((p) => (p.kind === "node" ? `node:${String(p.slug || "")}` : `edge:${String(p.from || "")}->${String(p.to || "")}`));
    if (graphIdsToDelete.length) {
      await client.delete(graphColl, { wait: true, points: graphIdsToDelete }).catch(() => undefined);
    }

    // Remove matching fallback chunks from chunk collection as well
    let chunkPoints = [];
    try {
      const out = await client.scroll(chunkColl, { limit: 4000, with_payload: true, with_vector: false });
      chunkPoints = Array.isArray(out?.points) ? out.points : [];
    } catch {
      chunkPoints = [];
    }
    const chunkIdsToDelete = chunkPoints
      .map((p, idx) => ({ p, idx, payload: p?.payload || {} }))
      .filter(({ payload }) => {
        const inf = inferKnowledgeTaxonomyFromText(payload?.source, payload?.text);
        if (category && inf.category !== category) return false;
        if (section && inf.section !== section) return false;
        if (tag && !inf.tags.includes(tag)) return false;
        return true;
      })
      .map(({ p }) => p?.id)
      .filter(Boolean);
    if (chunkIdsToDelete.length) {
      await client.delete(chunkColl, { wait: true, points: chunkIdsToDelete }).catch(() => undefined);
    }

    return res.json({
      ok: true,
      deleted_graph_points: graphIdsToDelete.length,
      deleted_chunks: chunkIdsToDelete.length,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Topic delete failed" });
  }
});

app.delete("/assistants/:id/knowledge", requireAuth, async (req, res) => {
  try {
    const asst = await prisma.assistant.findUnique({ where: { id: req.params.id } });
    if (!asst) return res.status(404).json({ error: "Not found" });
    const coll = collectionNameForAssistant(asst.id);
    const graphColl = collectionNameForKnowledgeGraph(asst.id);
    const client = getQdrantClient();
    try {
      await client.deleteCollection(coll);
    } catch (e) {
      if (!String(e.message || "").includes("Not found") && !String(e.message || "").includes("404")) {
        throw e;
      }
    }
    try {
      await client.deleteCollection(graphColl);
    } catch (e) {
      if (!String(e.message || "").includes("Not found") && !String(e.message || "").includes("404")) {
        throw e;
      }
    }
    res.json({ ok: true, cleared: coll, cleared_graph: graphColl });
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
    const emb = await createAssistantEmbedding(asst, text);
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
    const qv = await createAssistantEmbedding(asst, text);
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

app.get("/prototype/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(404).send("Not found");
    const row = await prisma.prototypeJob.findFirst({
      where: { resultSlug: slug, status: "done" },
      orderBy: { updatedAt: "desc" },
    });
    if (!row?.resultHtml) return res.status(404).send("Prototype not found");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(row.resultHtml);
  } catch {
    return res.status(500).send("Prototype unavailable");
  }
});

app.get("/prototype-jobs/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!isUuid(id)) return res.status(400).json({ error: "Invalid id" });
    const row = await prisma.prototypeJob.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({
      id: row.id,
      status: row.status,
      progress: row.progress,
      result_url: row.resultUrl || null,
      error: row.error || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed" });
  }
});

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
    const asst = await resolveAssistantForPublicChat();
    if (!asst) return res.status(503).json({ error: "No active assistant configured" });
    const kbPoints = await getAssistantKnowledgePoints(asst.id);

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

    if (detectPrototypeIntent(userText)) {
      const job = await prisma.prototypeJob.create({
        data: {
          chatId: crmChatId && isUuid(crmChatId) ? crmChatId : null,
          assistantId: asst.id,
          status: "queued",
          progress: 5,
          briefText: userText,
        },
      });
      setTimeout(() => {
        buildPrototypeLandingJob(job.id).catch((err) => {
          console.error("[prototype-job] failed", job.id, err);
        });
      }, 10);

      const ack =
        "Принял задачу. Запускаю сборку прототипа лендинга по вашему описанию. " +
        "Это займет примерно 30-90 секунд. Я сообщу ссылку, как только страница будет готова.";
      if (crmChatId && isUuid(crmChatId)) {
        try {
          await persistCrmAssistantReply(crmChatId, ack);
        } catch (persistErr) {
          console.error("[crm] persist assistant prototype ack", crmChatId, persistErr);
        }
      }
      return res.json({
        reply: ack,
        used_context: false,
        provider: "prototype_builder",
        prototype_job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
        },
      });
    }

    const useOllama = isOllamaAssistant(asst);

    if (useOllama) {
      const ollamaStarted = Date.now();
      console.log("BEFORE QUEUE");
      let result = await chatWithRag({ assistant: asst, messages });
      const ragError = String(result?.ragDiagnostics?.contextError || "");
      if (!result.usedContext && kbPoints > 0 && /bad request/i.test(ragError)) {
        const repaired = await reindexAssistantKnowledge(asst);
        result = await chatWithRag({ assistant: asst, messages });
        result.ragDiagnostics = {
          ...(result.ragDiagnostics || {}),
          autoReindex: repaired,
        };
      }
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
      return res.json({
        reply,
        used_context: usedContext,
        provider: "ollama",
        billing,
        rag_diagnostics: {
          ...(result.ragDiagnostics || {}),
          activeAssistantId: asst.id,
          activeAssistantName: asst.name,
          activeAssistantKbPoints: kbPoints,
        },
      });
    }

    const apiToken = getAssistantProviderToken(asst);
    if (!apiToken) {
      return res.status(503).json({ error: "Provider API key not configured (or switch assistant provider to ollama)" });
    }

    let result = await chatWithRag({
      assistant: asst,
      messages,
      embedText: (t) =>
        createOpenAiCompatibleEmbedding({
          baseUrl: asst.baseUrl,
          apiKey: apiToken,
          model: asst.embedModel || "text-embedding-3-small",
          text: t,
        }),
      generateText: async ({ systemContent, queryText }) => {
        const text = await chatOpenAiCompatible({
          baseUrl: asst.baseUrl,
          apiKey: apiToken,
          model: asst.model,
          systemPrompt: systemContent,
          messages: [{ role: "user", content: queryText }],
        });
        return { text };
      },
    });
    const ragError = String(result?.ragDiagnostics?.contextError || "");
    if (!result.usedContext && kbPoints > 0 && /bad request/i.test(ragError)) {
      const repaired = await reindexAssistantKnowledge(asst);
      result = await chatWithRag({
        assistant: asst,
        messages,
        embedText: (t) =>
          createOpenAiCompatibleEmbedding({
            baseUrl: asst.baseUrl,
            apiKey: apiToken,
            model: asst.embedModel || "text-embedding-3-small",
            text: t,
          }),
        generateText: async ({ systemContent, queryText }) => {
          const text = await chatOpenAiCompatible({
            baseUrl: asst.baseUrl,
            apiKey: apiToken,
            model: asst.model,
            systemPrompt: systemContent,
            messages: [{ role: "user", content: queryText }],
          });
          return { text };
        },
      });
      result.ragDiagnostics = {
        ...(result.ragDiagnostics || {}),
        autoReindex: repaired,
      };
    }
    const text = result.reply;
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
    res.json({
      reply: text,
      used_context: result.usedContext,
      provider: "openai_compatible",
      billing,
      rag_diagnostics: {
        ...(result.ragDiagnostics || {}),
        activeAssistantId: asst.id,
        activeAssistantName: asst.name,
        activeAssistantKbPoints: kbPoints,
      },
    });
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

// ============================================================
// COMMERCIAL OFFERS API  /api/kp
// ============================================================

/** GET /api/kp — list published offers (public) */
app.get("/api/kp", async (_req, res) => {
  try {
    const offers = await prisma.commercialOffer.findMany({
      where: { published: true },
      select: {
        id: true, slug: true, clientName: true, clientIndustry: true,
        kpNumber: true, expiresDays: true, viewsCount: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** GET /api/kp/all — list all offers including unpublished (auth required) */
app.get("/api/kp/all", requireAuth, async (_req, res) => {
  try {
    const offers = await prisma.commercialOffer.findMany({
      select: {
        id: true, slug: true, clientName: true, clientIndustry: true,
        kpNumber: true, expiresDays: true, published: true,
        viewsCount: true, lastViewedAt: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** GET /api/kp/:slug — single offer by slug (public) + increment viewsCount */
app.get("/api/kp/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const offer = await prisma.commercialOffer.findUnique({ where: { slug } });
    if (!offer) return res.status(404).json({ error: "КП не найдено" });
    if (!offer.published) return res.status(404).json({ error: "КП не найдено" });

    // Increment views asynchronously (don't await — don't block response)
    prisma.commercialOffer.update({
      where: { slug },
      data: { viewsCount: { increment: 1 }, lastViewedAt: new Date() },
    }).catch(() => {});

    res.json(offer);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** POST /api/kp — create offer (auth required) */
app.post("/api/kp", requireAuth, async (req, res) => {
  try {
    const {
      slug, clientName, clientIndustry, kpNumber,
      expiresDays = 14, published = false,
      heroData, problemsData, solutionData, packagesData,
      includedData, timelineData, nextPhaseData, whyUsData,
      ctaData, contactsData,
    } = req.body;

    if (!slug || !clientName || !clientIndustry || !kpNumber) {
      return res.status(400).json({ error: "slug, clientName, clientIndustry, kpNumber — обязательны" });
    }

    const offer = await prisma.commercialOffer.create({
      data: {
        slug, clientName, clientIndustry, kpNumber,
        expiresDays, published,
        heroData: heroData || {},
        problemsData: problemsData || {},
        solutionData: solutionData || {},
        packagesData: packagesData || {},
        includedData: includedData || {},
        timelineData: timelineData || {},
        nextPhaseData: nextPhaseData || {},
        whyUsData: whyUsData || {},
        ctaData: ctaData || {},
        contactsData: contactsData || {},
      },
    });
    res.status(201).json(offer);
  } catch (e) {
    if (e?.code === "P2002") return res.status(409).json({ error: "Slug уже занят" });
    res.status(500).json({ error: String(e) });
  }
});

/** PUT /api/kp/:slug — update offer (auth required) */
app.put("/api/kp/:slug", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await prisma.commercialOffer.findUnique({ where: { slug } });
    if (!existing) return res.status(404).json({ error: "КП не найдено" });

    const {
      clientName, clientIndustry, kpNumber, expiresDays, published,
      heroData, problemsData, solutionData, packagesData,
      includedData, timelineData, nextPhaseData, whyUsData, ctaData, contactsData,
    } = req.body;

    const offer = await prisma.commercialOffer.update({
      where: { slug },
      data: {
        ...(clientName !== undefined && { clientName }),
        ...(clientIndustry !== undefined && { clientIndustry }),
        ...(kpNumber !== undefined && { kpNumber }),
        ...(expiresDays !== undefined && { expiresDays }),
        ...(published !== undefined && { published }),
        ...(heroData !== undefined && { heroData }),
        ...(problemsData !== undefined && { problemsData }),
        ...(solutionData !== undefined && { solutionData }),
        ...(packagesData !== undefined && { packagesData }),
        ...(includedData !== undefined && { includedData }),
        ...(timelineData !== undefined && { timelineData }),
        ...(nextPhaseData !== undefined && { nextPhaseData }),
        ...(whyUsData !== undefined && { whyUsData }),
        ...(ctaData !== undefined && { ctaData }),
        ...(contactsData !== undefined && { contactsData }),
      },
    });
    res.json(offer);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** DELETE /api/kp/:slug — soft-delete (unpublish) offer (auth required) */
app.delete("/api/kp/:slug", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await prisma.commercialOffer.findUnique({ where: { slug } });
    if (!existing) return res.status(404).json({ error: "КП не найдено" });

    await prisma.commercialOffer.update({
      where: { slug },
      data: { published: false },
    });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ============================================================

process.on("unhandledRejection", (reason) => {
  console.error("[cms-server] unhandledRejection", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[cms-server] uncaughtException", err);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[cms-server] http://127.0.0.1:${PORT} (Prisma)`);
});
