import { useState } from "react";
import { ArrowRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";

const filters = ["Все", "Сайты", "Ролики", "Mini App", "AI"] as const;
type Filter = (typeof filters)[number];

const cases = [
  { name: "Fashion Brand Promo", tag: "Ролики", result: "+40% конверсия" },
  { name: "Корпоративный сайт", tag: "Сайты", result: "+120% заявок" },
  { name: "Loyalty Mini App", tag: "Mini App", result: "50K пользователей" },
  { name: "AI-ассистент продаж", tag: "AI", result: "−60% времени ответа" },
  { name: "Интернет-магазин", tag: "Сайты", result: "+85% продаж" },
  { name: "Промо-ролик запуска", tag: "Ролики", result: "2M просмотров" },
];

const CasesPage = () => {
  const [active, setActive] = useState<Filter>("Все");
  const navigate = useNavigate();

  const filtered = active === "Все" ? cases : cases.filter((c) => c.tag === active);

  return (
    <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 pt-10 md:pt-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight">
            Наши работы
          </h1>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
            150+ проектов
          </span>
        </div>
        <p className="text-[15px] text-muted-foreground mb-8">
          Реальные кейсы и результаты наших клиентов
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                active === f
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-14">
          {filtered.map((c, i) => (
            <div
              key={i}
              className="game-card group overflow-hidden"
            >
              {/* Placeholder image */}
              <div className="aspect-video bg-muted mb-4 flex items-center justify-center" style={{ borderRadius: 12 }}>
                <Briefcase size={28} className="text-muted-foreground/40" />
              </div>

              {/* Tag */}
              <span className="inline-block text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 mb-2">
                {c.tag}
              </span>

              {/* Name */}
              <p className="text-[16px] md:text-[18px] font-bold mb-1">{c.name}</p>

              {/* Result */}
              <p className="text-[13px] text-muted-foreground mb-3">
                Результат: <span className="text-foreground font-medium">{c.result}</span>
              </p>

              {/* Link */}
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
              >
                Смотреть
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CasesPage;
