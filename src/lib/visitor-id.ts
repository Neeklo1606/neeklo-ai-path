/**
 * Анонимный идентификатор посетителя для сквозного учёта (чат, аналитика).
 * Хранится в localStorage и дублируется в cookie (на случай очистки только storage).
 */

const STORAGE_KEY = "neeklo_visitor_id";
const COOKIE_NAME = "neeklo_vid";
/** ~400 дней */
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 400;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(value: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SEC}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

/**
 * Гарантирует наличие UUID: при первом заходе создаёт, при следующих — читает.
 * Вызывать один раз при старте приложения (см. main.tsx).
 */
export function ensureNeekloVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = (localStorage.getItem(STORAGE_KEY) ?? "").trim();
    if (!UUID_RE.test(id)) {
      id = (readCookie(COOKIE_NAME) ?? "").trim();
    }
    if (!UUID_RE.test(id)) {
      id = crypto.randomUUID();
    }
    localStorage.setItem(STORAGE_KEY, id);
    writeCookie(id);
    return id;
  } catch {
    let id = (readCookie(COOKIE_NAME) ?? "").trim();
    if (!UUID_RE.test(id)) {
      id = crypto.randomUUID();
    }
    writeCookie(id);
    return id;
  }
}

export function getNeekloVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLs = (localStorage.getItem(STORAGE_KEY) ?? "").trim();
    if (UUID_RE.test(fromLs)) return fromLs;
  } catch {
    /* ignore */
  }
  const fromC = (readCookie(COOKIE_NAME) ?? "").trim();
  return UUID_RE.test(fromC) ? fromC : null;
}

export { STORAGE_KEY as NEEKLO_VISITOR_STORAGE_KEY, COOKIE_NAME as NEEKLO_VISITOR_COOKIE_NAME };
