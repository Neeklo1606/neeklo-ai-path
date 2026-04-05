/** Client-only «logged in» flag for public site (not admin JWT). */
export const CLIENT_SESSION_KEY = "neeklo_client_session";

export function getClientSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CLIENT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setClientSession(): void {
  try {
    localStorage.setItem(CLIENT_SESSION_KEY, "1");
  } catch {
    /* ignore quota */
  }
}

export function clearClientSession(): void {
  try {
    localStorage.removeItem(CLIENT_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Internal navigation only — mitigates open redirects from ?next= */
export function safeInternalPath(next: string | null | undefined, fallback = "/profile"): string {
  if (!next || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("://")) return fallback;
  return t;
}
