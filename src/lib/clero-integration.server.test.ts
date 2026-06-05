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

  it("trims and joins multiple messages", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Сообщение 1\n---\nСообщение 2");
    expect(p.message).toContain("---");
  });
});
