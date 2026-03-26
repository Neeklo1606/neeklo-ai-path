import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/chat");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-primary/4 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[340px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-logo-appear">
          <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center animate-glow-pulse mb-4">
            <Sparkles size={20} className="text-primary" />
          </div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Войти в neeklo</h1>
        </div>

        {/* Form */}
        <div className="space-y-3 mb-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-card rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/25 transition-colors duration-200"
            style={{ padding: "13px 16px" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-card rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/25 transition-colors duration-200"
            style={{ padding: "13px 16px" }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 animate-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          {loading ? "Входим..." : "Войти"}
          {!loading && <ArrowRight size={16} />}
        </button>

        <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: "240ms" }}>
          <p className="text-[13px] text-muted-foreground">
            Нет аккаунта?{" "}
            <button onClick={() => navigate("/register")} className="text-primary font-medium">
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
