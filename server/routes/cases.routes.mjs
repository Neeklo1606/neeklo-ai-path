/**
 * Кейсы: публичный список для сайта + управление из админки.
 *
 * Вынесено из server/cms-server.mjs без изменения поведения:
 * монолит на 5000+ строк обслуживал сайт, CRM, Avito и биллинг одновременно.
 */
export function registerCaseRoutes(app, { prisma, requireAuth }) {
  // Public: list active cases
  app.get("/cases", async (_req, res) => {
    try {
      const cases = await prisma.case.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      res.json(cases);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin: list all cases
  app.get("/admin/cases", requireAuth, async (_req, res) => {
    try {
      const cases = await prisma.case.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      res.json(cases);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin: create case
  app.post("/admin/cases", requireAuth, async (req, res) => {
    try {
      const { title, slug, category = "Сайты", badge, description, metric, url, color, coverImage, isActive = true, isFeatured = false } = req.body;
      if (!title || !slug) return res.status(400).json({ error: "title and slug are required" });
      const existing = await prisma.case.findUnique({ where: { slug } });
      if (existing) return res.status(409).json({ error: "slug already exists" });
      const maxOrder = await prisma.case.aggregate({ _max: { sortOrder: true } });
      const c = await prisma.case.create({
        data: { title, slug, category, badge: badge || null, description: description || null, metric: metric || null, url: url || null, color: color || "from-slate-100 to-zinc-200", coverImage: coverImage || null, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1, isActive, isFeatured },
      });
      res.status(201).json(c);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin: update case
  app.put("/admin/cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, slug, category, badge, description, metric, url, color, coverImage, sortOrder, isActive, isFeatured } = req.body;
      const data = {};
      if (title !== undefined) data.title = title;
      if (slug !== undefined) data.slug = slug;
      if (category !== undefined) data.category = category;
      if (badge !== undefined) data.badge = badge || null;
      if (description !== undefined) data.description = description || null;
      if (metric !== undefined) data.metric = metric || null;
      if (url !== undefined) data.url = url || null;
      if (color !== undefined) data.color = color;
      if (coverImage !== undefined) data.coverImage = coverImage || null;
      if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
      if (isActive !== undefined) data.isActive = Boolean(isActive);
      if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
      const c = await prisma.case.update({ where: { id }, data });
      res.json(c);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin: delete case
  app.delete("/admin/cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.case.delete({ where: { id } });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });
}
