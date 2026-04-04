#!/usr/bin/env node
/**
 * One-off: print a short-lived JWT for the first app user (admin/media API tests).
 * Usage on server: cd /var/www/neeklo.ru && node scripts/gen-admin-jwt.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { PrismaClient } from "@prisma/client";

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error("JWT_SECRET missing or too short in .env");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const u = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!u) {
    console.error("No users in app_users — create one via CMS or seed.");
    process.exit(1);
  }
  const token = jwt.sign({ sub: u.id, role: u.role }, secret, { expiresIn: "15m" });
  process.stdout.write(token);
} finally {
  await prisma.$disconnect();
}
