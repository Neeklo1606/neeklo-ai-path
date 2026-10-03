import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { registerLeadRoutes } from "../leads.routes.mjs";
import { prisma, makeApp, resetTables } from "../../test/helpers.mjs";

/** Уведомления подменяем: тест проверяет логику заявок, а не доставку в Telegram. */
let sent = [];
const notifyAll = vi.fn(async (text) => {
  sent.push(text);
  return [{ status: "fulfilled", value: { ok: true, result: { message_id: 1, chat: { id: 111 } } } }];
});

function appWith(overrides = {}) {
  sent = [];
  notifyAll.mockClear();
  return makeApp((a) =>
    registerLeadRoutes(a, {
      prisma,
      notifyAll,
      getApprovedTgChats: async () => ["111"],
      escapeTgHtml: (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      ...overrides,
    }),
  );
}

/** Уведомление уходит после ответа клиенту — даём ему долететь. */
const settle = () => new Promise((r) => setTimeout(r, 50));

beforeEach(async () => {
  await resetTables(["crm_leads"]);
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("приём заявок с сайта", () => {
  it("сохраняет заявку с телефоном и шлёт уведомление", async () => {
    const res = await request(appWith()).post("/crm/public-lead")
      .send({ phone: "+7 (916) 111-22-33", source: "home-final-cta", page: "/" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    await settle();

    const lead = await prisma.lead.findUnique({ where: { id: res.body.id } });
    expect(lead.phone).toBe("+7 (916) 111-22-33");
    expect(lead.intentLabel).toBe("home-final-cta");
    expect(lead.status).toBe("new");
    expect(notifyAll).toHaveBeenCalledTimes(1);
    expect(sent[0]).toContain("Новая заявка с сайта");
  });

  it("принимает заявку визарда: имя, услуга, бюджет, Telegram без телефона", async () => {
    const res = await request(appWith()).post("/crm/public-lead").send({
      name: "Иван", telegram: "@ivan_test", service: "Сайт под ключ",
      budget: "50 000 – 150 000 ₽", source: "brief-wizard-footer", page: "/services",
    });
    expect(res.status).toBe(200);
    await settle();

    const lead = await prisma.lead.findUnique({ where: { id: res.body.id } });
    expect(lead.name).toBe("Иван");
    expect(lead.phone).toBeNull();
    expect(lead.summary).toContain("Услуга: Сайт под ключ");
    expect(lead.summary).toContain("Telegram: @ivan_test");
    expect(sent[0]).toContain("Бюджет: 50 000 – 150 000 ₽");
  });

  it("повтор того же телефона в окне не создаёт второй заявки и не шлёт второго уведомления", async () => {
    const app = appWith();
    const first = await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 777-00-11" });
    const second = await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 777-00-11" });
    await settle();

    expect(second.body.duplicate).toBe(true);
    expect(second.body.id).toBe(first.body.id);
    expect(await prisma.lead.count()).toBe(1);
    expect(notifyAll).toHaveBeenCalledTimes(1);
  });

  it("повтор того же Telegram без телефона тоже отсекается", async () => {
    const app = appWith();
    await request(app).post("/crm/public-lead").send({ name: "A", telegram: "@dup_user" });
    const second = await request(app).post("/crm/public-lead").send({ name: "A", telegram: "@dup_user" });
    expect(second.body.duplicate).toBe(true);
    expect(await prisma.lead.count()).toBe(1);
  });

  it("другой контакт создаёт отдельную заявку", async () => {
    const app = appWith();
    await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 111-00-01" });
    await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 111-00-02" });
    expect(await prisma.lead.count()).toBe(2);
  });

  it("за пределами окна повтор считается новой заявкой", async () => {
    const app = appWith({ dedupWindowMs: 1 });
    await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 222-00-02" });
    await new Promise((r) => setTimeout(r, 15));
    await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 222-00-02" });
    expect(await prisma.lead.count()).toBe(2);
  });

  it("отклоняет некорректный телефон и некорректный Telegram", async () => {
    const app = appWith();
    expect((await request(app).post("/crm/public-lead").send({ phone: "123" })).status).toBe(400);
    expect((await request(app).post("/crm/public-lead").send({})).status).toBe(400);
    expect((await request(app).post("/crm/public-lead").send({ telegram: "@a b!" })).status).toBe(400);
    expect(await prisma.lead.count()).toBe(0);
  });

  it("обрезает длинное имя и экранирует HTML в уведомлении", async () => {
    const app = appWith();
    const res = await request(app).post("/crm/public-lead")
      .send({ name: "<b>" + "Я".repeat(200), telegram: "@longname" });
    await settle();
    const lead = await prisma.lead.findUnique({ where: { id: res.body.id } });
    expect(lead.name.length).toBe(100);
    expect(sent[0]).toContain("&lt;b&gt;");
    expect(sent[0]).not.toContain("<b>");
  });

  it("сбой Telegram не ломает приём заявки", async () => {
    const app = appWith({ notifyAll: async () => { throw new Error("Telegram недоступен"); } });
    const res = await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 333-00-03" });
    expect(res.status).toBe(200);
    await settle();
    expect(await prisma.lead.count()).toBe(1);
  });

  it("превышение лимита запросов отвечает 429 и не создаёт заявку", async () => {
    const app = appWith({ rateLimit: () => false });
    const res = await request(app).post("/crm/public-lead").send({ phone: "+7 (916) 444-00-04" });
    expect(res.status).toBe(429);
    expect(await prisma.lead.count()).toBe(0);
  });
});
