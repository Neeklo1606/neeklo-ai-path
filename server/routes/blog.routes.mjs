/**
 * Блог: публичное чтение + управление из админки (/admin/blog).
 * Раздел админки существовал, а обработчиков не было — страницы блога жили на
 * статическом файле src/data/news.ts. Таблица blog_posts была в схеме с самого начала.
 *
 * Модуль подключается из cms-server.mjs: registerBlogRoutes(app, { prisma, requireAuth }).
 */

/** Поля, которые отдаём наружу (без черновиковых служебных). */
function publicPost(p) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    readTime: p.readTime,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
  };
}

function parseBody(body = {}) {
  const str = (v, max) => (v == null ? null : String(v).trim().slice(0, max));
  return {
    title: str(body.title, 200),
    slug: str(body.slug, 200),
    category: str(body.category, 60) || "AI",
    excerpt: str(body.excerpt, 500),
    content: str(body.content, 100_000),
    coverImage: str(body.coverImage, 500),
    readTime: str(body.readTime, 30) || "5 мин",
    metaTitle: str(body.metaTitle, 200),
    metaDescription: str(body.metaDescription, 400),
    isPublished: Boolean(body.isPublished),
  };
}

export function registerBlogRoutes(app, { prisma, requireAuth }) {
  // ─── Публичное ───
  app.get("/blog", async (_req, res) => {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 100,
      });
      res.json(posts.map(publicPost));
    } catch (e) {
      console.error("[blog] list failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить статьи" });
    }
  });

  app.get("/blog/:slug", async (req, res) => {
    try {
      const post = await prisma.blogPost.findUnique({ where: { slug: String(req.params.slug) } });
      if (!post || !post.isPublished) return res.status(404).json({ error: "Статья не найдена" });
      res.json({ ...publicPost(post), content: post.content, metaTitle: post.metaTitle, metaDescription: post.metaDescription });
    } catch (e) {
      console.error("[blog] get failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить статью" });
    }
  });

  // ─── Админка ───
  app.get("/admin/blog", requireAuth, async (_req, res) => {
    try {
      res.json(await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }));
    } catch (e) {
      console.error("[blog] admin list failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось загрузить статьи" });
    }
  });

  app.post("/admin/blog", requireAuth, async (req, res) => {
    const data = parseBody(req.body);
    if (!data.title || !data.slug) return res.status(400).json({ error: "Нужны заголовок и адрес (slug)" });
    try {
      const post = await prisma.blogPost.create({
        data: { ...data, publishedAt: data.isPublished ? new Date() : null },
      });
      res.status(201).json(post);
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Статья с таким адресом уже есть" });
      console.error("[blog] create failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось создать статью" });
    }
  });

  app.put("/admin/blog/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    const data = parseBody(req.body);
    if (!data.title || !data.slug) return res.status(400).json({ error: "Нужны заголовок и адрес (slug)" });
    try {
      const current = await prisma.blogPost.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: "Статья не найдена" });
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          ...data,
          // дата публикации проставляется один раз — при первой публикации
          publishedAt: data.isPublished ? current.publishedAt ?? new Date() : null,
        },
      });
      res.json(post);
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Статья с таким адресом уже есть" });
      console.error("[blog] update failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось сохранить статью" });
    }
  });

  /** Переключатель «опубликовано/черновик». */
  app.post("/admin/blog/:id/publish", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    try {
      const current = await prisma.blogPost.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: "Статья не найдена" });
      const next = !current.isPublished;
      const post = await prisma.blogPost.update({
        where: { id },
        data: { isPublished: next, publishedAt: next ? current.publishedAt ?? new Date() : null },
      });
      res.json(post);
    } catch (e) {
      console.error("[blog] publish failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось изменить статус" });
    }
  });

  app.delete("/admin/blog/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Некорректный id" });
    try {
      await prisma.blogPost.delete({ where: { id } });
      res.status(204).end();
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Статья не найдена" });
      console.error("[blog] delete failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось удалить статью" });
    }
  });
}
