/**
 * Upserts primary admin (and optional extra user from env).
 * Run: npx prisma db seed
 * Env: DATABASE_URL
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Пароль и почта берутся только из окружения: пароль по умолчанию в репозитории
// означал, что на любом стенде, где запускали seed, живёт админ с известным паролем.
const PRIMARY_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL;
const PRIMARY_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const PRIMARY_NAME = process.env.BOOTSTRAP_ADMIN_NAME || "Администратор";

if (!PRIMARY_EMAIL || !PRIMARY_PASSWORD || PRIMARY_PASSWORD.length < 12) {
  console.error(
    "[seed] задайте BOOTSTRAP_ADMIN_EMAIL и BOOTSTRAP_ADMIN_PASSWORD (от 12 символов):\n" +
      "  BOOTSTRAP_ADMIN_EMAIL=you@example.com BOOTSTRAP_ADMIN_PASSWORD=\"$(openssl rand -hex 12)\" npx prisma db seed",
  );
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(PRIMARY_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: PRIMARY_EMAIL },
    update: {
      passwordHash: hash,
      role: "ADMIN",
      name: PRIMARY_NAME,
    },
    create: {
      email: PRIMARY_EMAIL,
      passwordHash: hash,
      role: "ADMIN",
      name: PRIMARY_NAME,
    },
  });
  console.log(`[seed] Upserted ADMIN: ${PRIMARY_EMAIL} (${PRIMARY_NAME})`);

  const altEmail = process.env.BOOTSTRAP_SECOND_EMAIL;
  const altPassword = process.env.BOOTSTRAP_SECOND_PASSWORD;
  if (altEmail && altPassword && altEmail !== PRIMARY_EMAIL) {
    const altHash = await bcrypt.hash(altPassword, 12);
    await prisma.user.upsert({
      where: { email: altEmail },
      update: { passwordHash: altHash },
      create: {
        email: altEmail,
        passwordHash: altHash,
        role: "MANAGER",
        name: process.env.BOOTSTRAP_SECOND_NAME || null,
      },
    });
    console.log(`[seed] Upserted user: ${altEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
