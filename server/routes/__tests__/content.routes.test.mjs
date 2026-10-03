import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { registerBlogRoutes } from "../blog.routes.mjs";
import { registerVideoRoutes } from "../videos.routes.mjs";
import { registerCaseRoutes } from "../cases.routes.mjs";
import { requireAuth } from "../../lib/auth.mjs";
import { prisma, makeApp, resetTables, createUser, auth } from "../../test/helpers.mjs";
import os from "os";

const app = makeApp((a) => {
  registerBlogRoutes(a, { prisma, requireAuth });
  registerVideoRoutes(a, { prisma, requireAuth, uploadDir: os.tmpdir() });
  registerCaseRoutes(a, { prisma, requireAuth });
});

let token;
beforeEach(async () => {
  await resetTables(["blog_posts", "case_videos", "video_categories", "cases", "app_users"]);
  token = (await createUser()).token;
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("контент сайта: блог", () => {
  it("черновик не виден публично, опубликованная статья видна", async () => {
    const created = await request(app).post("/admin/blog").set(auth(token))
      .send({ title: "Статья", slug: "article-1", excerpt: "Кратко", content: "Текст" });
    expect(created.status).toBe(201);
    expect((await request(app).get("/blog")).body).toHaveLength(0);

    await request(app).post(`/admin/blog/${created.body.id}/publish`).set(auth(token));
    const list = await request(app).get("/blog");
    expect(list.body).toHaveLength(1);
    expect(list.body[0].slug).toBe("article-1");

    const single = await request(app).get("/blog/article-1");
    expect(single.status).toBe(200);
    expect(single.body.content).toBe("Текст");
  });

  it("снятие с публикации убирает статью с сайта", async () => {
    const c = await request(app).post("/admin/blog").set(auth(token)).send({ title: "T", slug: "s1", isPublished: true });
    expect((await request(app).get("/blog")).body).toHaveLength(1);
    await request(app).post(`/admin/blog/${c.body.id}/publish`).set(auth(token));
    expect((await request(app).get("/blog")).body).toHaveLength(0);
    expect((await request(app).get("/blog/s1")).status).toBe(404);
  });

  it("дата публикации проставляется один раз", async () => {
    const c = await request(app).post("/admin/blog").set(auth(token)).send({ title: "T", slug: "s2", isPublished: true });
    const first = (await prisma.blogPost.findUnique({ where: { id: c.body.id } })).publishedAt;
    await request(app).put(`/admin/blog/${c.body.id}`).set(auth(token)).send({ title: "T2", slug: "s2", isPublished: true });
    const second = (await prisma.blogPost.findUnique({ where: { id: c.body.id } })).publishedAt;
    expect(second.toISOString()).toBe(first.toISOString());
  });

  it("требует заголовок и адрес, не допускает дубль адреса", async () => {
    expect((await request(app).post("/admin/blog").set(auth(token)).send({ title: "Без адреса" })).status).toBe(400);
    await request(app).post("/admin/blog").set(auth(token)).send({ title: "A", slug: "dup" });
    expect((await request(app).post("/admin/blog").set(auth(token)).send({ title: "B", slug: "dup" })).status).toBe(409);
  });

  it("управление блогом закрыто без токена", async () => {
    expect((await request(app).get("/admin/blog")).status).toBe(401);
    expect((await request(app).post("/admin/blog").send({ title: "X", slug: "x" })).status).toBe(401);
    expect((await request(app).delete("/admin/blog/1")).status).toBe(401);
  });
});

describe("контент сайта: видео", () => {
  it("публикует видео с категорией и отдаёт его на сайт", async () => {
    const cat = await request(app).post("/admin/video-categories").set(auth(token)).send({ name: "Реклама", slug: "ads" });
    const video = await request(app).post("/admin/videos").set(auth(token))
      .send({ title: "Ролик", videoUrl: "/uploads/a.mp4", categoryId: cat.body.id });
    expect(video.status).toBe(201);

    const list = await request(app).get("/videos");
    expect(list.body).toHaveLength(1);
    expect(list.body[0].category.name).toBe("Реклама");
  });

  it("скрытое видео не отдаётся публично", async () => {
    await request(app).post("/admin/videos").set(auth(token))
      .send({ title: "Скрытое", videoUrl: "/uploads/b.mp4", isPublished: false });
    expect((await request(app).get("/videos")).body).toHaveLength(0);
    expect((await request(app).get("/admin/videos").set(auth(token))).body).toHaveLength(1);
  });

  it("не даёт удалить категорию, пока в ней есть видео", async () => {
    const cat = await request(app).post("/admin/video-categories").set(auth(token)).send({ name: "C", slug: "c" });
    await request(app).post("/admin/videos").set(auth(token))
      .send({ title: "V", videoUrl: "/uploads/c.mp4", categoryId: cat.body.id });
    expect((await request(app).delete(`/admin/video-categories/${cat.body.id}`).set(auth(token))).status).toBe(409);
  });

  it("отклоняет файл, который не является видео", async () => {
    const res = await request(app).post("/admin/upload-video").set(auth(token))
      .attach("file", Buffer.from("это просто текст"), { filename: "fake.mp4", contentType: "video/mp4" });
    expect(res.status).toBe(400);
  });
});

describe("контент сайта: кейсы", () => {
  it("создаёт кейс и отдаёт активные на сайт", async () => {
    const res = await request(app).post("/admin/cases").set(auth(token)).send({ title: "Кейс", slug: "case-1" });
    expect(res.status).toBe(201);
    expect((await request(app).get("/cases")).body).toHaveLength(1);
  });

  it("требует обязательные поля и уникальный адрес", async () => {
    expect((await request(app).post("/admin/cases").set(auth(token)).send({})).status).toBe(400);
    await request(app).post("/admin/cases").set(auth(token)).send({ title: "A", slug: "same" });
    expect((await request(app).post("/admin/cases").set(auth(token)).send({ title: "B", slug: "same" })).status).toBe(409);
  });

  it("управление кейсами закрыто без токена", async () => {
    expect((await request(app).get("/admin/cases")).status).toBe(401);
    expect((await request(app).post("/admin/cases").send({ title: "X", slug: "x" })).status).toBe(401);
  });
});
