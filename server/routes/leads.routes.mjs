/**
 * Приём заявок с сайта: быстрая форма (телефон) и визард брифа.
 * Единственный путь, по которому заявка попадает в CRM и в Telegram, — поэтому вынесен
 * отдельным модулем и покрыт тестами (server/routes/__tests__/leads.routes.test.mjs).
 *
 * Зависимости передаются явно, чтобы в тестах подменить уведомления и лимит запросов:
 *   registerLeadRoutes(app, { prisma, notifyAll, getApprovedTgChats, escapeTgHtml,
 *                             rateLimit, dedupWindowMs })
 */

/** Окно, в котором повторная заявка с тем же контактом считается дублем. */
const DEFAULT_DEDUP_WINDOW_MS = Number(process.env.PUBLIC_LEAD_DEDUP_WINDOW_MS || 10 * 60 * 1000);

export function registerLeadRoutes(
  app,
  {
    prisma,
    notifyAll,
    getApprovedTgChats = async () => [],
    escapeTgHtml = (s) => String(s ?? ""),
    rateLimit = () => true,
    dedupWindowMs = DEFAULT_DEDUP_WINDOW_MS,
  },
) {
  /**
   * Telegram-уведомление о заявке: всем одобренным в /admin/telegram, до 3 попыток на чат.
   * Вызывается после ответа посетителю — сбой Telegram не задерживает форму.
   */
  async function notifyLead(leadId, text) {
    const tag = () => `[public-lead] ${new Date().toISOString()} lead=${leadId}`;
    try {
      const chats = await getApprovedTgChats().catch(() => []);
      const results = await notifyAll(text);
      if (!results.length) {
        console.warn(`${tag()} tg SKIP: нет одобренных чатов в /admin/telegram`);
        return;
      }
      results.forEach((r, i) => {
        const v = r.status === "fulfilled" ? r.value : { ok: false, description: r.reason?.message || String(r.reason) };
        const chat = v?.result?.chat?.id ?? (chats.length === results.length ? chats[i] : "?");
        if (v?.ok) {
          console.log(`${tag()} tg OK chat=${chat} message_id=${v.result?.message_id ?? "?"}`);
        } else {
          console.warn(`${tag()} tg FAIL chat=${chat} error_code=${v?.error_code ?? "-"} description=${v?.description || JSON.stringify(v)}`);
        }
      });
    } catch (e) {
      console.error(`${tag()} tg ERROR:`, e?.message || e);
    }
  }

  app.post("/crm/public-lead", async (req, res) => {
    try {
      if (!rateLimit(req)) {
        return res.status(429).json({ error: "Rate limit exceeded", retry_after_seconds: 60 });
      }

      // Базовые поля (быстрая форма): { phone, source, page }.
      // Поля визарда брифа: { name, telegram, service, budget } — все необязательные.
      const rawPhone = String(req.body?.phone || "").trim();
      const digits = rawPhone.replace(/\D/g, "");
      const name = String(req.body?.name || "").trim().slice(0, 100);
      const rawTelegram = String(req.body?.telegram || "").trim();
      const service = String(req.body?.service || "").trim().slice(0, 64);
      const budget = String(req.body?.budget || "").trim().slice(0, 64);

      let telegram = "";
      if (rawTelegram) {
        if (!/^@?[A-Za-z0-9_]{3,32}$/.test(rawTelegram)) {
          return res.status(400).json({ error: "Некорректный Telegram" });
        }
        telegram = `@${rawTelegram.replace(/^@/, "")}`;
      }

      if (rawPhone || !telegram) {
        // Телефон проверяется, если передан; без Telegram он обязателен
        if (digits.length !== 11) {
          return res.status(400).json({ error: "Некорректный телефон" });
        }
      }

      const source = String(req.body?.source || "quick-form").slice(0, 64);
      const page = String(req.body?.page || "").slice(0, 256);

      const extraLines = [
        service ? `Услуга: ${service}` : "",
        budget ? `Бюджет: ${budget}` : "",
        telegram ? `Telegram: ${telegram}` : "",
      ].filter(Boolean);

      // Отсечка повторов: тот же контакт в пределах окна не плодит лидов и уведомлений
      const since = new Date(Date.now() - dedupWindowMs);
      const duplicate = await prisma.lead
        .findFirst({
          where: {
            createdAt: { gte: since },
            ...(rawPhone ? { phone: rawPhone.slice(0, 32) } : { summary: { contains: `Telegram: ${telegram}` } }),
          },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => null);
      if (duplicate) {
        console.log(`[public-lead] ${new Date().toISOString()} повтор заявки (${source}), лид ${duplicate.id} — пропускаем`);
        return res.json({ ok: true, id: duplicate.id, duplicate: true });
      }

      const lead = await prisma.lead.create({
        data: {
          ...(name ? { name } : {}),
          phone: rawPhone ? rawPhone.slice(0, 32) : null,
          status: "new",
          intentLabel: source,
          summary:
            `Быстрая заявка с сайта${page ? ` · ${page}` : ""} (источник: ${source})` +
            (extraLines.length ? `\n${extraLines.join("\n")}` : ""),
        },
      });

      res.json({ ok: true, id: lead.id });

      // Telegram — после ответа посетителю. sendTgMessage шлёт parse_mode HTML,
      // поэтому пользовательский ввод экранируем.
      const tgLines = [
        "🔔 Новая заявка с сайта",
        name ? `Имя: ${escapeTgHtml(name)}` : "",
        `Телефон: ${escapeTgHtml(rawPhone) || "—"}`,
        ...extraLines.map(escapeTgHtml),
        `Страница: ${escapeTgHtml(page) || "—"}`,
        `Источник: ${escapeTgHtml(source)}`,
      ].filter(Boolean);
      notifyLead(lead.id, tgLines.join("\n"));
    } catch (e) {
      console.error("[public-lead] failed:", e?.message || e);
      if (!res.headersSent) res.status(500).json({ error: e.message || "Failed" });
    }
  });
}
