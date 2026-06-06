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
  it("builds correct Clero API Chat payload shape", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Привет, хочу купить");
    expect(p.sourceid).toBe(176);
    expect(p.sessionid).toBe("avitoabc123");
    expect(p.sessionname).toBe("Avito user 999999");
    expect(p.text).toBe("Привет, хочу купить");
    expect(typeof p.apitoken).toBe("string");
    expect(p.metadata.avitochatid).toBe("abc123");
    expect(p.metadata.clientname).toBe("Avito user 999999");
    expect(p.metadata.authorid).toBe("999999");
  });

  it("preserves message text with separators", async () => {
    const { buildCleroPayload } = await import("../../server/clero-helpers.mjs");
    const p = buildCleroPayload("abc123", "999999", "Сообщение 1\n---\nСообщение 2");
    expect(p.text).toContain("---");
  });
});

import { vi } from "vitest";

describe("sendToCleroRaw", () => {
  it("POSTs correct payload and returns ok on 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const { sendToCleroRaw } = await import("../../server/clero-helpers.mjs?v=send1");
    const result = await sendToCleroRaw("chat1", "999", "Хочу купить", mockFetch);
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://neeklo.ru/api/clero/avito-webhook");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.sourceid).toBe(176);
    expect(body.sessionid).toBe("avitochat1");
    expect(typeof body.apitoken).toBe("string");
    expect(body.text).toBe("Хочу купить");
    expect(body.metadata.avitochatid).toBe("chat1");
  });

  it("throws on non-200 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const { sendToCleroRaw } = await import("../../server/clero-helpers.mjs?v=send2");
    await expect(sendToCleroRaw("c", "a", "t", mockFetch)).rejects.toThrow("Clero 503");
  });
});
