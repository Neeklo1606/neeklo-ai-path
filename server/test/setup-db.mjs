/**
 * Глобальная подготовка для серверных тестов: отдельная база, схема из prisma/schema.prisma.
 * Боевую и dev-базу тесты не трогают — адрес берётся только из TEST_DATABASE_URL.
 */
import { execSync } from "child_process";

export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("Задайте TEST_DATABASE_URL для серверных тестов");
  if (!/test/i.test(url)) {
    throw new Error("TEST_DATABASE_URL должен указывать на тестовую базу (в имени должно быть 'test')");
  }
  process.env.DATABASE_URL = url;
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });
}
