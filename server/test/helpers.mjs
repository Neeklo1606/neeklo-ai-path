/** Общие помощники серверных тестов: приложение, чистая база, токен админа. */
import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth.mjs";

export const prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });

/** Express без лишних middleware — каждый тест подключает только нужные модули. */
export function makeApp(register) {
  const app = express();
  app.use(express.json());
  register(app);
  return app;
}

export async function resetTables(tables) {
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`);
  }
}

export async function createUser({ email = "admin@test.local", password = "password-12345", role = "ADMIN" } = {}) {
  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 4), role },
  });
  return { user, password, token: signToken(user) };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });
