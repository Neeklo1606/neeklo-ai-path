/**
 * Коммерческие предложения (/kp на сайте). Публичное чтение + админский CRUD через API.
 *
 * Вынесено из server/cms-server.mjs без изменения поведения:
 * монолит на 5000+ строк обслуживал сайт, CRM, Avito и биллинг одновременно.
 */
export function registerKpRoutes(app, { prisma, requireAuth }) {
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
}
