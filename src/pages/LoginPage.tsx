import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[340px]">
        <div className="flex flex-col items-center mb-10 animate-logo-appear">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Войти в neeklo</h1>
        </div>

        <div className="space-y-3 mb-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-background rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-foreground/20 transition-colors duration-200"
            style={{ padding: "13px 16px" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-background rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-foreground/20 transition-colors duration-200"
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
            <button onClick={() => navigate("/register")} className="text-foreground font-medium underline">
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
