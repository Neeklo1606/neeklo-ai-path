import { Zap, ArrowRight, Loader2, Clock, Star } from "lucide-react";
import { useState } from "react";

interface ProposalOption {
  label: string;
  badge?: string;
  recommended?: boolean;
  price: string;
  timeline: string;
  description: string;
}

interface ProposalCardProps {
  onConnect: () => void;
}

const options: ProposalOption[] = [
  {
    label: "Быстрее",
    badge: "⚡",
    price: "$1 200",
    timeline: "7 дней",
    description: "Ускоренная разработка, приоритет в очереди",
  },
  {
    label: "Рекомендуем",
    recommended: true,
    price: "$850",
    timeline: "14 дней",
    description: "Оптимальный баланс цены, качества и сроков",
  },
  {
    label: "Лучшее качество",
    badge: "★",
    price: "$1 800",
    timeline: "21 день",
    description: "Расширенный дизайн, аналитика и 60 дней поддержки",
  },
];

const ProposalCard = ({ onConnect }: ProposalCardProps) => {
  const [selected, setSelected] = useState(1);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (connecting) return;
    setConnecting(true);
    setTimeout(() => onConnect(), 1200);
  };

  return (
    <div className="animate-proposal-in ml-[42px]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-xl bg-card flex items-center justify-center">
          <Zap size={14} className="text-foreground" />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground">
          Предложение
        </span>
      </div>

      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={opt.label}
              onClick={() => setSelected(i)}
              className={`w-full text-left rounded-2xl border transition-all duration-100 active:scale-[0.98] ${
                isSelected
                  ? "border-foreground/20 bg-background shadow-sm"
                  : "border-border bg-background"
              }`}
              style={{
                padding: "16px",
                WebkitTapHighlightColor: "transparent",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {opt.recommended ? (
                    <Star size={12} className="text-foreground" />
                  ) : opt.label === "Быстрее" ? (
                    <Clock size={12} className="text-muted-foreground" />
                  ) : (
                    <Star size={12} className="text-muted-foreground" />
                  )}
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      opt.recommended ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
                <div
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors duration-100 ${
                    isSelected ? "border-foreground" : "border-border"
                  }`}
                >
                  {isSelected && (
                    <div className="w-[8px] h-[8px] rounded-full bg-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[20px] font-bold text-foreground tracking-tight leading-none">
                  {opt.price}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  · {opt.timeline}
                </span>
              </div>

              <p className="text-[13px] text-muted-foreground leading-snug">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 mb-3">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-foreground fill-foreground" />
          <span className="text-[12px] font-medium text-foreground">4.9</span>
        </div>
        <span className="w-px h-3 bg-border" />
        <span className="text-[12px] text-muted-foreground">150+ проектов</span>
        <span className="w-px h-3 bg-border" />
        <span className="text-[12px] text-muted-foreground">проверенная студия</span>
      </div>

      <button
        onClick={handleConnect}
        disabled={connecting}
        className="btn-accent"
      >
        {connecting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Подключаем...
          </>
        ) : (
          <>
            Подключить менеджера
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
};

export default ProposalCard;
