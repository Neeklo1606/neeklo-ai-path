import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <div className="animate-logo-appear mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-glow-pulse">
            <Zap size={28} className="text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3 animate-slide-up">
          neeklo
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
          От идеи до сделки за минуты
        </p>
        <p className="text-muted-foreground/60 text-sm mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
          AI-ассистент соберёт бриф, подготовит предложение и подключит менеджера
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/chat")}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform duration-150 glow-primary flex items-center justify-center gap-2 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          Начать
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
