import { useState } from "react";
import { Sparkles, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";

const screens = [
  {
    icon: Sparkles,
    title: "Добро пожаловать в neeklo",
    text: "AI-студия цифровых продуктов.\nРасскажи что нужно – мы сделаем.",
    button: "Начать",
  },
  {
    icon: MessageCircle,
    title: "Опиши задачу",
    text: "AI соберёт бриф, подберёт решение\nи рассчитает стоимость за минуту.",
    button: "Далее",
  },
  {
    icon: CheckCircle,
    title: "Получи результат",
    text: "Менеджер возьмёт в работу\nи вы увидите прогресс в реальном времени.",
    button: "Перейти в приложение",
  },
];

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const current = screens[step];
  const Icon = current.icon;

  const next = () => {
    if (step < screens.length - 1) {
      setExiting(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setExiting(false);
      }, 250);
    } else {
      localStorage.setItem("neeklo_onboarded", "1");
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      <div
        className={`flex flex-col items-center text-center max-w-[360px] transition-all duration-250 ${
          exiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Icon size={28} className="text-primary" />
        </div>

        <h1 className="text-[24px] md:text-[28px] font-extrabold leading-tight mb-3">
          {current.title}
        </h1>

        <p className="text-[15px] text-muted-foreground leading-relaxed whitespace-pre-line mb-10">
          {current.text}
        </p>

        <button
          onClick={next}
          className="btn-primary w-full max-w-[280px] flex items-center justify-center gap-2"
        >
          {current.button}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-10">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              i === step ? "bg-foreground" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
