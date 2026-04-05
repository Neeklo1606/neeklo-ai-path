import { describe, it, expect, beforeEach } from "vitest";
import {
  CLIENT_SESSION_KEY,
  clearClientSession,
  getClientSession,
  safeInternalPath,
  setClientSession,
} from "./client-session";

describe("client-session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("get/set/clear session", () => {
    expect(getClientSession()).toBe(false);
    setClientSession();
    expect(localStorage.getItem(CLIENT_SESSION_KEY)).toBe("1");
    expect(getClientSession()).toBe(true);
    clearClientSession();
    expect(getClientSession()).toBe(false);
  });

  it("safeInternalPath allows only same-origin paths", () => {
    expect(safeInternalPath("/projects", "/profile")).toBe("/projects");
    expect(safeInternalPath(null, "/profile")).toBe("/profile");
    expect(safeInternalPath("//evil.com", "/profile")).toBe("/profile");
    expect(safeInternalPath("https://x.com", "/profile")).toBe("/profile");
  });
});
