/**
 * Видео портфолио: публичный список для /cases + управление из админки.
 * Раздел админки и вкладка «Видео» на сайте существовали, но обработчиков не было:
 * /cms-api/videos отдавал редирект статики, /admin/videos — 404.
 *
 * Подключается из cms-server.mjs: registerVideoRoutes(app, { prisma, requireAuth, uploadDir, publicUrlPrefix }).
 */
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const MAX_VIDEO_BYTES = Number(process.env.CMS_VIDEO_MAX_FILE_BYTES || 200 * 1024 * 1024);
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/** Проверка по сигнатуре файла: расширение и заголовок Content-Type подделать легко. */
function validateVideoSignature(buf, mime) {
  if (!ALLOWED_VIDEO_MIMES.has(mime)) return { ok: false, error: `Тип не разрешён: ${mime}` };
  if (!buf || buf.length < 16) return { ok: false, error: "Файл пустой или слишком маленький" };
  // mp4/mov: "ftyp" на 4-м байте; webm: 0x1A45DFA3 в начале
  const isIsoBmff = buf.slice(4, 8).toString("ascii") === "ftyp";
  const isWebm = buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
  if (mime === "video/webm" && !isWebm) return { ok: false, error: "Содержимое не похоже на webm" };
  if ((mime === "video/mp4" || mime === "video/quicktime") && !isIsoBmff) {
    return { ok: false, error: "Содержимое не похоже на mp4/mov" };
  }
  return { ok: true };
}

function parseVideoBody(body = {}) {
  const str = (v, max) => (v == null || v === "" ? null : String(v).trim().slice(0, max));
  const num = (v) => (v == null || v === "" ? null : Number(v));
  return {
    title: str(body.title, 200),
    description: str(body.description, 2000),
    client: str(body.client, 120),
    videoUrl: str(body.videoUrl, 500),
    thumbnailUrl: str(body.thumbnailUrl, 500),
    duration: num(body.duration),
    fileSize: num(body.fileSize),
    categoryId: num(body.categoryId),
    caseId: num(body.caseId),
    sortOrder: Number(body.sortOrder) || 0,
    isPublished: body.isPublished !== false,
  };
}

export function registerVideoRoutes(app, { prisma, requireAuth, uploadDir, publicUrlPrefix = "/uploads" }) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = (file.originalname.split(".").pop() || "mp4").toLowerCase().slice(0, 8);
        cb(null, `video-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`);
      },
    }),
    limits: { fileSize: MAX_VIDEO_BYTES },
    fileFilter: (_req, file, cb) =>
      ALLOWED_VIDEO_MIMES.has(file.mimetype) ? cb(null, true) : cb(new Error(`Тип не разрешён: ${file.mimetype}`)),
  });

  // ─── Публичное ───
  app.get("/videos", async (_req, res) => {
    try {
      const videos = await prisma.caseVideo.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
      res.json(videos);
    } catch (e) {
      console.error("[videos] list failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить видео" });
    }
  });

  app.get("/video-categories", async (_req, res) => {
    try {
      res.json(await prisma.videoCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }));
    } catch (e) {
      console.error("[videos] categories failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить категории" });
    }
  });

  // ─── Админка: видео ───
  app.get("/admin/videos", requireAuth, async (_req, res) => {
    try {
      res.json(
        await prisma.caseVideo.findMany({
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          include: { category: { select: { id: true, name: true, slug: true } } },
        }),
      );
    } catch (e) {
      console.error("[videos] admin list failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить видео" });
    }
  });

  app.post("/admin/videos", requireAuth, async (req, res) => {
    const data = parseVideoBody(req.body);
    if (!data.title || !data.videoUrl) return res.status(400).json({ error: "Нужны название и ссылка на видео" });
    try {
      res.status(201).json(await prisma.caseVideo.create({ data }));
    } catch (e) {
      console.error("[videos] create failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось создать видео" });
    }
  });

  app.put("/admin/videos/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    const data = parseVideoBody(req.body);
    if (!data.title || !data.videoUrl) return res.status(400).json({ error: "Нужны название и ссылка на видео" });
    try {
      res.json(await prisma.caseVideo.update({ where: { id }, data }));
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Видео не найдено" });
      console.error("[videos] update failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось сохранить видео" });
    }
  });

  app.delete("/admin/videos/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    try {
      await prisma.caseVideo.delete({ where: { id } });
      res.status(204).end();
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Видео не найдено" });
      console.error("[videos] delete failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось удалить видео" });
    }
  });

  // ─── Админка: категории ───
  app.get("/admin/video-categories", requireAuth, async (_req, res) => {
    try {
      res.json(await prisma.videoCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }));
    } catch (e) {
      console.error("[videos] admin categories failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить категории" });
    }
  });

  app.post("/admin/video-categories", requireAuth, async (req, res) => {
    const name = String(req.body?.name || "").trim().slice(0, 120);
    const slug = String(req.body?.slug || "").trim().slice(0, 120);
    if (!name || !slug) return res.status(400).json({ error: "Нужны название и адрес (slug)" });
    try {
      res.status(201).json(
        await prisma.videoCategory.create({
          data: {
            name,
            slug,
            description: req.body?.description ? String(req.body.description).slice(0, 500) : null,
            sortOrder: Number(req.body?.sortOrder) || 0,
          },
        }),
      );
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Категория с таким адресом уже есть" });
      console.error("[videos] category create failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось создать категорию" });
    }
  });

  app.delete("/admin/video-categories/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    try {
      const used = await prisma.caseVideo.count({ where: { categoryId: id } });
      if (used > 0) return res.status(409).json({ error: `Категория используется в ${used} видео` });
      await prisma.videoCategory.delete({ where: { id } });
      res.status(204).end();
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Категория не найдена" });
      console.error("[videos] category delete failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось удалить категорию" });
    }
  });

  // ─── Загрузка файла видео ───
  app.post(
    "/admin/upload-video",
    requireAuth,
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || "Загрузка отклонена" });
        next();
      });
    },
    async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "Файл не передан" });
      const filePath = path.join(uploadDir, req.file.filename);
      try {
        const handle = await fs.open(filePath, "r");
        const head = Buffer.alloc(32);
        await handle.read(head, 0, 32, 0);
        await handle.close();
        const check = validateVideoSignature(head, req.file.mimetype);
        if (!check.ok) {
          await fs.unlink(filePath).catch(() => {});
          return res.status(400).json({ error: check.error });
        }
        res.status(201).json({
          url: `${publicUrlPrefix}/${req.file.filename}`,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        });
      } catch (e) {
        await fs.unlink(filePath).catch(() => {});
        console.error("[videos] upload failed:", e?.message || e);
        res.status(500).json({ error: "Не удалось загрузить файл" });
      }
    },
  );
}
