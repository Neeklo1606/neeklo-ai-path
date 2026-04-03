import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "@/lib/auth-token";
import { adminApi } from "@/lib/admin-api";

export default function AdminAuthGuard() {
  const loc = useLocation();
  const [status, setStatus] = useState<"checking" | "ok" | "no">("checking");

  useEffect(() => {
    const t = getAuthToken();
    if (!t) {
      setStatus("no");
      return;
    }
    adminApi
      .get("/auth/me")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("no"));
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <div
          className="h-8 w-8 rounded-full border-2 border-[#E0E0E0] border-t-[#0D0D0B]"
          style={{ animation: "spin 0.6s linear infinite" }}
        />
      </div>
    );
  }

  if (status === "no") {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
