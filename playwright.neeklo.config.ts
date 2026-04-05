import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke E2E (desktop Chromium). Заказчик дополнительно проверяет iPhone вручную.
 * Запуск: npm run dev (порт 8080) в другом терминале, затем npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    /** Системный Chrome (см. `npx playwright install` для bundled Chromium). */
    channel: "chrome",
  },
  timeout: 60_000,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
