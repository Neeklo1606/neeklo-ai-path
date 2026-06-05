import { describe, it, expect } from "vitest";

describe("isClientAvitoMessage", () => {
  it("returns false for Nikita's authorId", async () => {
    const { isClientAvitoMessage } = await import("../../server/clero-helpers.mjs");
    expect(isClientAvitoMessage("104436874")).toBe(false);
  });

  it("returns true for any other authorId", async () => {
    const { isClientAvitoMessage } = await import("../../server/clero-helpers.mjs");
    expect(isClientAvitoMessage("999999")).toBe(true);
    expect(isClientAvitoMessage(12345)).toBe(true);
  });

  it("uses NIKITA_AVITO_AUTHOR_ID env var when set", async () => {
    const originalEnv = process.env.NIKITA_AVITO_AUTHOR_ID;
    try {
      process.env.NIKITA_AVITO_AUTHOR_ID = "999888777";
      // Re-import to pick up env change — use a cache-busting query param
      const { isClientAvitoMessage: fn } = await import(
        "../../server/clero-helpers.mjs?envtest=1"
      );
      expect(fn("999888777")).toBe(false);  // custom owner ID → blocked
      expect(fn("104436874")).toBe(true);   // old default → now a client
    } finally {
      if (originalEnv === undefined) {
        delete process.env.NIKITA_AVITO_AUTHOR_ID;
      } else {
        process.env.NIKITA_AVITO_AUTHOR_ID = originalEnv;
      }
    }
  });
});

describe("buildCleroPayload", () => {
  it("builds correct payload shape", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Привет, хочу купить");
    expect(p.chatid).toBe("avitoabc123");
    expect(p.clientname).toBe("999999");
    expect(p.message).toBe("Привет, хочу купить");
    expect(p.source).toBe("avito");
    expect(typeof p.timestamp).toBe("string");
    expect(() => new Date(p.timestamp).toISOString()).not.toThrow();
  });

  it("preserves message text with separators", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Сообщение 1\n---\nСообщение 2");
    expect(p.message).toContain("---");
  });
});
