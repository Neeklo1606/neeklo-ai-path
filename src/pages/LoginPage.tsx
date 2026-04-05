import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { safeInternalPath, setClientSession } from "@/lib/client-session";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      toast("Введите email и пароль");
      return;
    }
    setClientSession();
    toast("Вход выполнен");
    const next = safeInternalPath(searchParams.get("next"), "/profile");
    navigate(next, { replace: true });
  };

  const inputStyle =
    "w-full font-body bg-[#F5F5F5] border border-transparent rounded-xl px-4 py-3 outline-none transition-colors duration-150 focus:border-[#0D0D0B] focus:bg-white";

  return (
    <div className="flex-1 flex items-start justify-center px-4 pb-[100px]" style={{ background: "#F0EEE8", minHeight: "100dvh", paddingTop: 64 }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#0D0D0B] flex items-center justify-center flex-shrink-0">
              <span className="text-white" style={{ fontSize: 14 }}>✦</span>
            </div>
            <span className="font-heading" style={{ fontSize: 17, fontWeight: 700 }}>neeklo</span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-center" style={{ fontSize: 24, fontWeight: 800 }}>Войти</h1>
          <p className="font-body text-center mt-1 mb-6" style={{ fontSize: 14, color: "#6A6860" }}>
            Введите данные для входа
          </p>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={inputStyle}
              style={{ fontSize: 15 }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={inputStyle}
              style={{ fontSize: 15 }}
            />
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full mt-2 font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all"
            style={{ background: "#0D0D0B", padding: "14px 0", fontSize: 15, fontWeight: 600 }}
          >
            Войти
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-4 mb-4">
            <div className="flex-1 h-px bg-[#E0E0E0]" />
            <span className="font-body" style={{ fontSize: 13, color: "#B0B0B0" }}>или</span>
            <div className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          {/* Telegram button */}
          <button
            onClick={handleLogin}
            className="w-full font-body text-white rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all"
            style={{ background: "#2AABEE", padding: "14px 0", fontSize: 15, fontWeight: 600 }}
          >
            Войти через Telegram
          </button>

          {/* Register link */}
          <p className="text-center mt-4 font-body" style={{ fontSize: 14, color: "#6A6860" }}>
            Нет аккаунта?{" "}
            <Link to="/register" className="font-medium underline" style={{ color: "#0D0D0B" }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
