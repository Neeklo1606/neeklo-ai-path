/**
 * Прайс услуг. Публичный GET /prices + админский CRUD.
 * Эти же цены получает Avito-агент как контекст (см. cms-server.mjs).
 *
 * Вынесено из server/cms-server.mjs без изменения поведения:
 * монолит на 5000+ строк обслуживал сайт, CRM, Avito и биллинг одновременно.
 */
export function registerPriceRoutes(app, { prisma, requireAuth, upsertPriceToKb }) {
  /** GET /admin/prices — list all prices */
  app.get("/admin/prices", requireAuth, async (_req, res) => {
    try {
      const prices = await prisma.servicePrice.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      res.json(prices);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /** GET /prices — public price list (active only) */
  app.get("/prices", async (_req, res) => {
    try {
      const prices = await prisma.servicePrice.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      res.json(prices);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /** POST /admin/prices — create price item */
  app.post("/admin/prices", requireAuth, async (req, res) => {
    try {
      const { title, description, priceFrom, priceTo, currency, category, isActive, sortOrder } = req.body || {};
      if (!title) return res.status(400).json({ error: "title required" });
      const price = await prisma.servicePrice.create({
        data: {
          title: String(title),
          description: description != null ? String(description) : null,
          priceFrom: priceFrom != null ? Number(priceFrom) : null,
          priceTo: priceTo != null ? Number(priceTo) : null,
          currency: currency || "RUB",
          category: category || "general",
          isActive: isActive !== false,
          sortOrder: sortOrder != null ? Number(sortOrder) : 0,
        },
      });
      upsertPriceToKb(price).catch((e) => console.warn("[pricing-kb]", e?.message));
      res.status(201).json(price);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /** PUT /admin/prices/:id — update price item */
  app.put("/admin/prices/:id", requireAuth, async (req, res) => {
    try {
      const { title, description, priceFrom, priceTo, currency, category, isActive, sortOrder } = req.body || {};
      const price = await prisma.servicePrice.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title: String(title) }),
          ...(description !== undefined && { description: description === null ? null : String(description) }),
          ...(priceFrom !== undefined && { priceFrom: priceFrom === null ? null : Number(priceFrom) }),
          ...(priceTo !== undefined && { priceTo: priceTo === null ? null : Number(priceTo) }),
          ...(currency !== undefined && { currency: String(currency) }),
          ...(category !== undefined && { category: String(category) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
          ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        },
      });
      upsertPriceToKb(price).catch((e) => console.warn("[pricing-kb]", e?.message));
      res.json(price);
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
      res.status(500).json({ error: e.message });
    }
  });

  /** DELETE /admin/prices/:id — delete price item */
  app.delete("/admin/prices/:id", requireAuth, async (req, res) => {
    try {
      await prisma.servicePrice.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
      res.status(500).json({ error: e.message });
    }
  });
}
