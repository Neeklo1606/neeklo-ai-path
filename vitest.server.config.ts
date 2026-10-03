import { defineConfig } from "vitest/config";

/** Серверные тесты: окружение node, своя база (TEST_DATABASE_URL), без jsdom. */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["server/**/*.test.mjs"],
    globalSetup: ["./server/test/setup-db.mjs"],
    pool: "forks",
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
