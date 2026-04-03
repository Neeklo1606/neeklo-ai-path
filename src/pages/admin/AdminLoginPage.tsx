import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { CMS_BASE } from "@/lib/cms-api";
import { setAuthToken } from "@/lib/auth-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLoginPage() {
  usePageTitle("Admin — вход");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<{ token: string }>(`${CMS_BASE}/auth/login`, { email, password });
      setAuthToken(data.token);
      toast.success("Вход выполнен");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || err.message : "Ошибка входа";
      toast.error(typeof msg === "string" ? msg : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D0B] px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-center text-2xl text-white">✦</p>
        <h1 className="mt-2 text-center font-heading text-xl font-extrabold text-white">neeklo admin</h1>
        <p className="mt-1 text-center text-sm text-white/50">Вход по email и паролю</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="em" className="text-white/80">
              Email
            </Label>
            <Input
              id="em"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw" className="text-white/80">
              Пароль
            </Label>
            <Input
              id="pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-white text-[#0D0D0B] hover:bg-white/90">
            {loading ? "Вход…" : "Войти"}
          </Button>
        </form>
      </div>
      <p className="mt-8 text-xs text-white/25">© 2026 neeklo</p>
    </div>
  );
}
