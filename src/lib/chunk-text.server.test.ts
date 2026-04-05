import { describe, it, expect, vi } from "vitest";

describe("chunkText (server ai.service)", async () => {
  const { chunkText } = await import("../../server/services/ai.service.mjs");

  it("short Russian text yields a small number of chunks", () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
      logs.push(String(a[0]));
    });
    try {
      const chunks = chunkText("Компания продаёт красные носки. Тест RAG.");
      expect(chunks.length).toBeLessThan(10);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    } finally {
      spy.mockRestore();
    }
  });
});
