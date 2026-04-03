/**
 * CMS API + JWT auth (Prisma). Run: node server/cms-server.mjs
 * Env: DATABASE_URL, JWT_SECRET, SUPABASE_*, OPENAI_API_KEY (optional)
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const PORT = Number(process.env.PORT || process.env.CMS_SERVER_PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const OPENAI_FALLBACK = process.env.OPENAI_API_KEY || "";

const prisma = new PrismaClient();

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.warn("[cms-server] Missing SUPABASE_URL, SERVICE_ROLE or ANON key.");
}
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.warn("[cms-server] Set JWT_SECRET (min 32 chars) for production.");
}

const supabaseAdmin = createClient(SUPABASE_URL || "", SERVICE_KEY || "", {
  auth: { persistSession: false, autoRefreshToken: false },
});
const supabasePublic = createClient(SUPABASE_URL || "", ANON_KEY || "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function supabaseConfigHint() {
  if (!SUPABASE_URL || !ANON_KEY) {
    return "Укажите в .env SUPABASE_URL и SUPABASE_ANON_KEY (или VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY).";
  }
  return null;
}

function supabaseFailureHint(message) {
  const m = (message || "").toLowerCase();
  if (m.includes("relation") && m.includes("does not exist")) {
    return "Таблица не создана. В Supabase: SQL Editor → выполните файл supabase/migrations/20260403120000_cms_core.sql.";
  }
  if (m.includes("jwt") || m.includes("invalid api key") || m.includes("api key")) {
    return "Проверьте anon key (public), не service_role, в SUPABASE_ANON_KEY.";
  }
  return "После миграций выполните: node server/seed-cms-content.mjs (нужен SUPABASE_SERVICE_ROLE_KEY).";
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

// ─── Public settings (no secrets) ───
app.get("/settings/public", async (_req, res) => {
  const { data, error } = await supabasePublic.from("cms_settings").select("key, value").eq("is_public", true);
  if (error) return res.status(500).json({ error: error.message });
  const map = {};
  for (const row of data || []) {
    map[row.key] = row.value;
  }
  res.json(map);
});

// ─── Chat bootstrap (welcome + public site key reference) ───
app.get("/chat/bootstrap", async (req, res) => {
  const locale = (req.query.locale || "ru").toString();
  let welcomeMessage = "Здравствуйте! Чем могу помочь?";
  const { data: page } = await supabasePublic
    .from("cms_pages")
    .select("blocks, meta")
    .eq("slug", "chat")
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();

  if (page?.blocks && Array.isArray(page.blocks)) {
    const cfg = page.blocks.find((b) => b?.type === "chat_config");
    if (cfg?.welcomeMessage) welcomeMessage = cfg.welcomeMessage;
  }
  if (page?.meta?.welcomeMessage) welcomeMessage = page.meta.welcomeMessage;

  const { data: settings } = await supabasePublic.from("cms_settings").select("key, value").eq("is_public", true);
  let siteApiKeyHint = null;
  for (const row of settings || []) {
    if (row.key === "public.chat.site_api_key" && row.value) {
      siteApiKeyHint = typeof row.value === "string" ? row.value : row.value;
    }
  }
  res.json({ welcomeMessage, siteApiKey: siteApiKeyHint });
});

// ─── Pages ───
app.get("/pages", requireAuth, async (req, res) => {
  const locale = (req.query.locale || "ru").toString();
  const { data, error } = await supabaseAdmin
    .from("cms_pages")
    .select("*")
    .eq("locale", locale)
    .order("updated_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get("/pages/slug/:slug", async (req, res) => {
  const cfg = supabaseConfigHint();
  if (cfg) {
    return res.status(503).json({ error: "Supabase не настроен", hint: cfg });
  }
  const locale = (req.query.locale || "ru").toString();
  const { data, error } = await supabasePublic
    .from("cms_pages")
    .select("*")
    .eq("slug", req.params.slug)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.error("[cms-server] GET /pages/slug", req.params.slug, locale, error);
    return res.status(500).json({ error: error.message, hint: supabaseFailureHint(error.message) });
  }
  if (!data) {
    return res.status(404).json({
      error: "Not found",
      hint: "Страница не в БД или не опубликована. Запустите: node server/seed-cms-content.mjs",
    });
  }
  res.json(data);
});

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
    const { data, error } = await supabaseAdmin.from("cms_pages").select("*").eq("id", param).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Not found" });
    return res.json(data);
  }
  const { data, error } = await supabasePublic
    .from("cms_pages")
    .select("*")
    .eq("slug", param)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

app.post("/pages", requireAuth, async (req, res) => {
  const row = {
    slug: req.body.slug,
    title: req.body.title ?? "",
    locale: req.body.locale ?? "ru",
    blocks: req.body.blocks ?? [],
    published: !!req.body.published,
    meta: req.body.meta ?? {},
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("cms_pages").insert(row).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.patch("/pages/:id", requireAuth, async (req, res) => {
  const patch = { ...req.body, updated_at: new Date().toISOString() };
  delete patch.id;
  const { data, error } = await supabaseAdmin.from("cms_pages").update(patch).eq("id", req.params.id).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

app.delete("/pages/:id", requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin.from("cms_pages").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// ─── Media ───
app.get("/media", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from("cms_media").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post("/media/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  const ext = (req.file.originalname.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = `uploads/${name}`;
  const { error: upErr } = await supabaseAdmin.storage.from("cms-media").upload(path, req.file.buffer, {
    contentType: req.file.mimetype || "application/octet-stream",
    upsert: true,
  });
  if (upErr) return res.status(400).json({ error: upErr.message });
  const { data: pub } = supabaseAdmin.storage.from("cms-media").getPublicUrl(path);
  const row = {
    storage_path: path,
    public_url: pub?.publicUrl,
    mime: req.file.mimetype,
    alt: (req.body.alt || "").toString() || null,
  };
  const { data, error } = await supabaseAdmin.from("cms_media").insert(row).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.delete("/media/:id", requireAuth, async (req, res) => {
  const { data: row, error: f1 } = await supabaseAdmin.from("cms_media").select("storage_path").eq("id", req.params.id).maybeSingle();
  if (f1) return res.status(400).json({ error: f1.message });
  if (row?.storage_path) {
    await supabaseAdmin.storage.from("cms-media").remove([row.storage_path]);
  }
  const { error } = await supabaseAdmin.from("cms_media").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// ─── Settings ───
app.get("/settings", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from("cms_settings").select("*").order("key");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.patch("/settings/:key", requireAuth, async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const row = {
    key,
    value: req.body.value ?? null,
    is_public: !!req.body.is_public,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("cms_settings").upsert(row, { onConflict: "key" }).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── Assistants ───
app.get("/assistants", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("cms_assistants")
    .select("id,name,api_key_prefix,provider,base_url,model,system_prompt,active,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get("/assistants/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("cms_assistants")
    .select("id,name,api_key_prefix,provider,base_url,model,system_prompt,active,created_at,updated_at,provider_api_key")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

app.post("/assistants", requireAuth, async (req, res) => {
  const plain = genApiKey();
  const api_key_hash = hashKey(plain);
  const api_key_prefix = plain.slice(0, 10);
  const row = {
    name: req.body.name || "Assistant",
    api_key_hash,
    api_key_prefix,
    provider: req.body.provider || "openai",
    base_url: req.body.base_url || null,
    model: req.body.model || "gpt-4o-mini",
    system_prompt: req.body.system_prompt || null,
    provider_api_key: req.body.provider_api_key || null,
    active: req.body.active !== false,
  };
  const { data, error } = await supabaseAdmin.from("cms_assistants").insert(row).select("id,name,api_key_prefix,provider,base_url,model,system_prompt,active,created_at").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ ...data, api_key: plain });
});

app.patch("/assistants/:id/regenerate-key", requireAuth, async (req, res) => {
  const plain = genApiKey();
  const { data, error } = await supabaseAdmin
    .from("cms_assistants")
    .update({
      api_key_hash: hashKey(plain),
      api_key_prefix: plain.slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .select("id,name,api_key_prefix")
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, api_key: plain });
});

app.patch("/assistants/:id", requireAuth, async (req, res) => {
  const patch = { ...req.body, updated_at: new Date().toISOString() };
  delete patch.id;
  delete patch.api_key_hash;
  delete patch.api_key_prefix;
  const { data, error } = await supabaseAdmin
    .from("cms_assistants")
    .update(patch)
    .eq("id", req.params.id)
    .select("id,name,api_key_prefix,provider,base_url,model,system_prompt,active")
    .single();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

// ─── Chat ───
app.post("/chat", async (req, res) => {
  const { apiKey, messages, assistantId } = req.body || {};
  if (!apiKey || !Array.isArray(messages)) {
    return res.status(400).json({ error: "apiKey and messages[] required" });
  }
  const h = hashKey(apiKey);
  let q = supabaseAdmin.from("cms_assistants").select("*").eq("api_key_hash", h).eq("active", true);
  if (assistantId) q = q.eq("id", assistantId);
  const { data: asst, error } = await q.maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!asst) return res.status(401).json({ error: "Invalid api key" });

  const apiToken = asst.provider_api_key || OPENAI_FALLBACK;
  if (!apiToken) return res.status(503).json({ error: "Provider API key not configured for this assistant" });

  const base = (asst.base_url || "https://api.openai.com/v1").replace(/\/$/, "");
  const url = `${base}/chat/completions`;
  const body = {
    model: asst.model || "gpt-4o-mini",
    messages: [...(asst.system_prompt ? [{ role: "system", content: asst.system_prompt }] : []), ...messages],
  };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: json.error?.message || json.error || "Upstream error", details: json });
    }
    const text = json.choices?.[0]?.message?.content ?? "";
    res.json({ reply: text, raw: json });
  } catch (e) {
    res.status(502).json({ error: e.message || "Fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`[cms-server] http://127.0.0.1:${PORT}`);
});
