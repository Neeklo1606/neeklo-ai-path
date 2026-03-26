import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full">
        {/* Logo */}
        <div className="animate-logo-appear mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-glow-pulse">
            <Sparkles size={24} className="text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-2 animate-slide-up">
          neeklo
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-1.5 animate-slide-up" style={{ animationDelay: "80ms" }}>
          От идеи до сделки за минуты
        </p>
        <p className="text-muted-foreground/50 text-[13px] leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: "160ms" }}>
          AI соберёт бриф, подготовит предложение и подключит менеджера
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/chat")}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-[15px] active:scale-[0.97] transition-transform duration-150 glow-primary flex items-center justify-center gap-2 animate-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          Начать
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
