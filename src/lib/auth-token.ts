const KEY = "neeklo_admin_jwt";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(KEY);
}
