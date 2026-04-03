import axios, { type AxiosError } from "axios";
import { CMS_BASE } from "@/lib/cms-api";
import { clearAuthToken, getAuthToken } from "@/lib/auth-token";

export const adminApi = axios.create({
  baseURL: CMS_BASE,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const t = getAuthToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ error?: string }>) => {
    if (err.response?.status === 401) {
      clearAuthToken();
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);
