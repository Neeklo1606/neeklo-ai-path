import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-primary/4 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[280px]">
        <div className="animate-logo-appear mb-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center animate-glow-pulse">
            <Sparkles size={22} className="text-primary" />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-3 animate-slide-up">
          neeklo
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed animate-slide-up" style={{ animationDelay: "80ms" }}>
          От идеи до сделки за минуты
        </p>
        <p className="text-muted-foreground/40 text-[13px] leading-relaxed mt-1.5 mb-14 animate-slide-up" style={{ animationDelay: "140ms" }}>
          AI соберёт бриф, подготовит предложение
          <br />и подключит менеджера
        </p>

        <button
          onClick={() => navigate("/chat")}
          className="w-full btn-primary flex items-center justify-center gap-2 animate-slide-up"
          style={{ animationDelay: "220ms" }}
        >
          Начать
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
