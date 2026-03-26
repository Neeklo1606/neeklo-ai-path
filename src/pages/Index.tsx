import { Play, Globe, Smartphone, Sparkles, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

import workFashion from "@/assets/work-fashion.png";
import workRacing from "@/assets/work-racing.jpg";
import workStudio from "@/assets/work-studio.jpg";
import workVision from "@/assets/work-vision.jpg";
import workAssistant from "@/assets/work-assistant.jpg";
import workEcommerce from "@/assets/work-ecommerce.jpg";

const products = [
  {
    icon: Play,
    title: "AI-ролики",
    price: "от 25 000 ₽",
    desc: "Рекламные ролики с нейросетями",
    badge: "ХИТ",
    slug: "ai-roliki",
  },
  {
    icon: Globe,
    title: "Сайт под ключ",
    price: "от 95 000 ₽",
    desc: "Лендинг или корп. сайт с AI",
    slug: "sajt-pod-klyuch",
  },
  {
    icon: Smartphone,
    title: "Telegram Mini App",
    price: "от 65 000 ₽",
    desc: "Приложение прямо в Telegram",
    slug: "telegram-mini-app",
  },
  {
    icon: Sparkles,
    title: "AI-агент",
    price: "от 150 000 ₽",
    desc: "Автоматизация продаж и процессов",
    badge: "ТОП",
    slug: "ai-agent",
  },
];

const works = [
  { img: workFashion, title: "Имиджевый ролик", tag: "AI-видео", aspect: "video" as const },
  { img: workStudio, title: "Лендинг студии", tag: "Сайт", aspect: "wide" as const },
  { img: workRacing, title: "Промо для бренда", tag: "AI-видео", aspect: "tall" as const },
  { img: workVision, title: "Vision AI App", tag: "Mini App", aspect: "wide" as const },
  { img: workEcommerce, title: "Интернет-магазин", tag: "Сайт", aspect: "wide" as const },
  { img: workAssistant, title: "AI-ассистент", tag: "AI-агент", aspect: "wide" as const },
];

const steps = [
  { num: "01", title: "Опиши задачу", desc: "напиши в чат что нужно" },
  { num: "02", title: "AI собирает бриф", desc: "формирует ТЗ и цену" },
  { num: "03", title: "Получи результат", desc: "менеджер берёт в работу" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="px-5">
        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center relative">
          <div className="relative z-10 flex flex-col items-center text-center w-full">
            <div className="animate-logo-appear">
              <p className="text-[32px] font-extrabold tracking-tight mb-0.5">neeklo</p>
              <p className="text-[13px] text-muted-foreground tracking-widest uppercase">AI-продакшн студия</p>
            </div>

            <div className="mt-12 animate-slide-up" style={{ animationDelay: "150ms" }}>
              <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight mb-5">
                От идеи
                <br />
                до результата
                <br />
                <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">за 48 часов</span>
              </h1>

              <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-[300px] mx-auto">
                AI-ролики, сайты, Mini App и автоматизация —
                заказывай онлайн, получай результат
              </p>
            </div>

            <div className="w-full space-y-3 mb-14 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <button
                onClick={() => navigate("/chat")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Заказать проект
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  document.getElementById("works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full bg-transparent text-foreground font-semibold text-[14px] rounded-xl border border-border active:scale-[0.97] transition-transform duration-100"
                style={{ padding: "13px 0", WebkitTapHighlightColor: "transparent" }}
              >
                Смотреть работы ↓
              </button>
            </div>

            {/* STATS */}
            <div className="w-full grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "450ms" }}>
              {[
                { num: "150+", label: "проектов" },
                { num: "48ч", label: "срок сдачи" },
                { num: "95%", label: "довольны" },
              ].map((s) => (
                <div key={s.num} className="text-center">
                  <p className="text-[24px] font-extrabold text-foreground">{s.num}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKS GALLERY */}
        <section id="works" className="mt-8 mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-bold">Наши работы</h2>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-foreground fill-foreground" />
              <span className="text-[12px] text-muted-foreground font-medium">4.9 / 5</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {works.map((w, i) => (
              <button
                key={i}
                onClick={() => navigate("/projects")}
                className={`relative rounded-2xl overflow-hidden group active:scale-[0.97] transition-transform duration-200 ${
                  i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                }`}
              >
                <img
                  src={w.img}
                  alt={w.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <span className="inline-block text-[10px] font-semibold text-white/80 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 mb-1.5">
                    {w.tag}
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-tight">{w.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mb-14">
          <h2 className="text-[22px] font-bold mb-5">Что делаем</h2>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <button
                key={p.title}
                onClick={() => navigate(`/services/${p.slug}`)}
                className="game-card relative text-left active:scale-[0.97] transition-transform duration-100"
              >
                {p.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {p.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center mb-3">
                  <p.icon size={16} className="text-foreground" />
                </div>
                <p className="text-[15px] font-bold mb-1">{p.title}</p>
                <p className="text-[13px] text-muted-foreground font-medium mb-1">{p.price}</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{p.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-14">
          <h2 className="text-[22px] font-bold mb-5">Как это работает</h2>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="game-card flex items-start gap-4 animate-message-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-[20px] font-extrabold text-muted-foreground/40 mt-0.5">{s.num}</span>
                <div>
                  <p className="text-[15px] font-semibold">{s.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4">
          <div className="game-card text-center">
            <p className="text-[20px] font-bold mb-2">Готов начать?</p>
            <p className="text-[14px] text-muted-foreground mb-5">Первая консультация бесплатно</p>
            <button
              onClick={() => navigate("/chat")}
              className="btn-accent"
            >
              Написать в чат
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default LandingPage;
