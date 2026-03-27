import { Play, Globe, Smartphone, Sparkles, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

import workFashion from "@/assets/work-fashion.png";
import workRacing from "@/assets/work-racing.jpg";
import workStudio from "@/assets/work-studio.jpg";
import workVision from "@/assets/work-vision.jpg";
import workAssistant from "@/assets/work-assistant.jpg";
import workEcommerce from "@/assets/work-ecommerce.jpg";

const products = [
  { icon: Play, title: "AI-ролики", price: "от 25 000 ₽", desc: "Рекламные ролики с нейросетями", badge: "ХИТ", slug: "ai-roliki" },
  { icon: Globe, title: "Сайт под ключ", price: "от 95 000 ₽", desc: "Лендинг или корп. сайт с AI", slug: "sajt-pod-klyuch" },
  { icon: Smartphone, title: "Telegram Mini App", price: "от 65 000 ₽", desc: "Приложение прямо в Telegram", slug: "telegram-mini-app" },
  { icon: Sparkles, title: "AI-агент", price: "от 150 000 ₽", desc: "Автоматизация продаж и процессов", badge: "ТОП", slug: "ai-agent" },
];

const works = [
  { img: workFashion, title: "Имиджевый ролик", tag: "AI-видео" },
  { img: workStudio, title: "Лендинг студии", tag: "Сайт" },
  { img: workRacing, title: "Промо для бренда", tag: "AI-видео" },
  { img: workVision, title: "Vision AI App", tag: "Mini App" },
  { img: workEcommerce, title: "Интернет-магазин", tag: "Сайт" },
  { img: workAssistant, title: "AI-ассистент", tag: "AI-агент" },
];

const steps = [
  { num: "01", title: "Опиши задачу", desc: "напиши в чат что нужно" },
  { num: "02", title: "AI собирает бриф", desc: "формирует ТЗ и цену" },
  { num: "03", title: "Получи результат", desc: "менеджер берёт в работу" },
];

/* ---- Animated stat counter ---- */
const StatItem = ({ target, suffix, label, active }: { target: number; suffix: string; label: string; active: boolean }) => {
  const value = useCountUp(target, active);
  return (
    <div className="text-center">
      <p className="text-[28px] md:text-[48px] font-[800] leading-none text-foreground tracking-tight">
        {value}{suffix}
      </p>
      <p className="text-[11px] md:text-[13px] text-muted-foreground mt-1.5 uppercase" style={{ letterSpacing: "2px" }}>{label}</p>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  const stats = useScrollReveal(0.4);
  const worksSection = useScrollReveal(0.15);
  const productsSection = useScrollReveal(0.15);
  const stepsSection = useScrollReveal(0.15);
  const ctaSection = useScrollReveal(0.3);

  /* Shared reveal style helper */
  const revealStyle = (visible: boolean, delay = 0, fromLeft = false): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate(0,0)"
      : fromLeft
        ? "translateX(-24px)"
        : "translateY(20px)",
    transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
  });

  return (
    <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center relative px-4" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[780px] mx-auto">
          {/* Badge */}
          <div className="animate-logo-appear mb-8">
            <span className="inline-flex items-center gap-1.5 text-foreground text-[12px] font-medium px-3.5 py-1.5 rounded-full" style={{ background: "#F5F5F5" }}>
              ✦ AI-продакшн студия · Москва
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-[42px] md:text-[72px] font-[800] leading-[1] tracking-[-2px] mb-5 md:mb-6">
              <span className="inline-block hero-line" style={{ animationDelay: "0ms" }}>От идеи</span>
              <br />
              <span className="inline-block hero-line" style={{ animationDelay: "150ms" }}>до результата</span>
              <br />
              <span className="inline-block hero-line bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text" style={{ animationDelay: "300ms" }}>
                за 48 часов
              </span>
            </h1>

            <p
              className="text-[15px] md:text-[17px] text-muted-foreground leading-relaxed mb-10 max-w-[300px] md:max-w-[440px] mx-auto hero-fade"
              style={{ animationDelay: "500ms" }}
            >
              AI-ролики, сайты, Mini App и автоматизация —
              заказывай онлайн, получай результат
            </p>
          </div>

          {/* Buttons */}
          <div
            className="w-full max-w-[440px] flex flex-col md:flex-row gap-3 mb-14 hero-scale"
            style={{ animationDelay: "700ms" }}
          >
            <button
              onClick={() => navigate("/chat")}
              className="btn-primary flex items-center justify-center gap-2 md:flex-1"
            >
              Заказать проект
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                document.getElementById("works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-hero-secondary md:flex-1"
            >
              Смотреть работы ↓
            </button>
          </div>

          {/* STATS */}
          <div
            ref={stats.ref}
            className="w-full max-w-[500px] border-t border-b border-border py-6 grid grid-cols-3 gap-4"
            style={revealStyle(stats.visible)}
          >
            <StatItem target={150} suffix="+" label="проектов" active={stats.visible} />
            <StatItem target={48} suffix="ч" label="срок сдачи" active={stats.visible} />
            <StatItem target={95} suffix="%" label="довольны" active={stats.visible} />
          </div>
        </div>
      </section>

      {/* WORKS GALLERY */}
      <section id="works" className="mt-8 mb-14 px-4 md:px-0" ref={worksSection.ref}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-5 md:mb-8" style={revealStyle(worksSection.visible)}>
            <h2 className="text-[22px] md:text-[28px] font-bold">Наши работы</h2>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-foreground fill-foreground" />
              <span className="text-[12px] text-muted-foreground font-medium">4.9 / 5</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
            {works.map((w, i) => (
              <button
                key={i}
                onClick={() => navigate("/projects")}
                className={`relative rounded-2xl overflow-hidden group active:scale-[0.97] transition-transform duration-200 ${
                  i === 0 ? "col-span-2 md:col-span-2 aspect-[16/9]" : "aspect-square md:aspect-[4/3]"
                }`}
                style={revealStyle(worksSection.visible, i * 100)}
              >
                <img src={w.img} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <span className="inline-block text-[10px] font-semibold text-white/80 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 mb-1.5">{w.tag}</span>
                  <p className="text-[13px] md:text-[14px] font-semibold text-white leading-tight">{w.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS — fade + slide up on scroll, stagger 100ms */}
      <section className="mb-14 px-4 md:px-0" ref={productsSection.ref}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[22px] md:text-[28px] font-bold mb-5 md:mb-8" style={revealStyle(productsSection.visible)}>Что делаем</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((p, i) => (
              <button
                key={p.title}
                onClick={() => navigate(`/services/${p.slug}`)}
                className="game-card relative text-left active:scale-[0.97] transition-transform duration-100 hover:border-foreground/20"
                style={revealStyle(productsSection.visible, i * 100)}
              >
                {p.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{p.badge}</span>
                )}
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-card border border-border flex items-center justify-center mb-3">
                  <p.icon size={16} className="text-foreground" />
                </div>
                <p className="text-[15px] font-bold mb-1">{p.title}</p>
                <p className="text-[13px] text-muted-foreground font-medium mb-1">{p.price}</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — fade + slide from left, stagger 150ms */}
      <section className="mb-14 px-4 md:px-0" ref={stepsSection.ref}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[22px] md:text-[28px] font-bold mb-5 md:mb-8" style={revealStyle(stepsSection.visible)}>Как это работает</h2>
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="game-card flex items-start gap-4"
                style={revealStyle(stepsSection.visible, i * 150, true)}
              >
                <span className="text-[20px] md:text-[24px] font-extrabold text-muted-foreground/40 mt-0.5">{s.num}</span>
                <div>
                  <p className="text-[15px] font-semibold">{s.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — fade in on scroll */}
      <section className="mb-4 px-4 md:px-0 md:mb-16" ref={ctaSection.ref}>
        <div className="max-w-[600px] mx-auto" style={revealStyle(ctaSection.visible)}>
          <div className="game-card text-center">
            <p className="text-[20px] md:text-[24px] font-bold mb-2">Готов начать?</p>
            <p className="text-[14px] text-muted-foreground mb-5">Первая консультация бесплатно</p>
            <button onClick={() => navigate("/chat")} className="btn-accent max-w-[300px] mx-auto">
              Написать в чат
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default LandingPage;
