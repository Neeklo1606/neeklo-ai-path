/**
 * Сводка для дашборда админки (/admin/stats). Раздел существовал, обработчика не было.
 * Подключается из cms-server.mjs: registerStatsRoutes(app, { prisma, requireAuth }).
 */
export function registerStatsRoutes(app, { prisma, requireAuth }) {
  app.get("/admin/stats", requireAuth, async (_req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [leadsToday, leadsWeek, activeCases, publishedPosts, recentLeads] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.case.count({ where: { isActive: true } }),
        prisma.blogPost.count({ where: { isPublished: true } }),
        prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, name: true, phone: true, status: true, summary: true, createdAt: true },
        }),
      ]);

      res.json({ leadsToday, leadsWeek, activeCases, publishedPosts, recentLeads });
    } catch (e) {
      console.error("[stats] failed:", e?.message || e);
      res.status(500).json({ error: "Не удалось собрать статистику" });
    }
  });
}
