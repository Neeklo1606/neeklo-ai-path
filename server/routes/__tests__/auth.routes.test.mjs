import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { registerAuthRoutes } from "../auth.routes.mjs";
import { prisma, makeApp, resetTables, createUser, auth } from "../../test/helpers.mjs";

const app = makeApp((a) => registerAuthRoutes(a, { prisma }));

beforeEach(async () => {
  await resetTables(["app_users"]);
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("авторизация админки", () => {
  it("пускает с верным паролем и выдаёт токен", async () => {
    const { password } = await createUser({ email: "admin@test.local" });
    const res = await request(app).post("/auth/login").send({ email: "admin@test.local", password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("admin@test.local");
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("не пускает с неверным паролем", async () => {
    await createUser();
    const res = await request(app).post("/auth/login").send({ email: "admin@test.local", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("не раскрывает, существует ли почта", async () => {
    await createUser();
    const known = await request(app).post("/auth/login").send({ email: "admin@test.local", password: "wrong" });
    const unknown = await request(app).post("/auth/login").send({ email: "nobody@test.local", password: "wrong" });
    expect(unknown.status).toBe(known.status);
    expect(unknown.body.error).toBe(known.body.error);
  });

  it("регистрация открыта только для самого первого пользователя", async () => {
    const first = await request(app).post("/auth/register").send({ email: "owner@test.local", password: "password-12345" });
    expect(first.status).toBe(201);
    expect(first.body.user.role).toBe("ADMIN");

    const second = await request(app).post("/auth/register").send({ email: "intruder@test.local", password: "password-12345" });
    expect(second.status).toBe(403);
    expect(await prisma.user.count()).toBe(1);
  });

  it("отклоняет короткий пароль", async () => {
    const res = await request(app).post("/auth/register").send({ email: "a@test.local", password: "123" });
    expect(res.status).toBe(400);
    expect(await prisma.user.count()).toBe(0);
  });

  it("/auth/me требует токен", async () => {
    expect((await request(app).get("/auth/me")).status).toBe(401);
    expect((await request(app).get("/auth/me").set({ Authorization: "Bearer not-a-valid-token" })).status).toBe(401);
  });

  it("/auth/me возвращает текущего пользователя по токену", async () => {
    const { token, user } = await createUser();
    const res = await request(app).get("/auth/me").set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("создавать пользователей может только ADMIN", async () => {
    const manager = await createUser({ email: "manager@test.local", role: "MANAGER" });
    const asManager = await request(app).post("/auth/users").set(auth(manager.token))
      .send({ email: "new@test.local", password: "password-12345" });
    expect(asManager.status).toBe(403);

    const admin = await createUser({ email: "admin2@test.local", role: "ADMIN" });
    const asAdmin = await request(app).post("/auth/users").set(auth(admin.token))
      .send({ email: "new@test.local", password: "password-12345", role: "MANAGER" });
    expect(asAdmin.status).toBe(201);
    expect(asAdmin.body.role).toBe("MANAGER");
  });

  it("не создаёт двух пользователей с одной почтой", async () => {
    const admin = await createUser();
    const payload = { email: "dup@test.local", password: "password-12345" };
    expect((await request(app).post("/auth/users").set(auth(admin.token)).send(payload)).status).toBe(201);
    expect((await request(app).post("/auth/users").set(auth(admin.token)).send(payload)).status).toBe(409);
  });
});
