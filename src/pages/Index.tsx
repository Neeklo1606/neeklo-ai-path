import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Hero from "@/components/Hero";
import SolutionCards from "@/components/SolutionCards";

import workFashion from "@/assets/work-fashion.webp";
import workRacing from "@/assets/work-racing.webp";
import workStudio from "@/assets/work-studio.webp";
import workVision from "@/assets/work-vision.webp";
import workAssistant from "@/assets/work-assistant.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";


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

const LandingPage = () => {
  const navigate = useNavigate();

  const worksSection = useScrollReveal(0.15);
  const productsSection = useScrollReveal(0.15);
  const stepsSection = useScrollReveal(0.15);
  const ctaSection = useScrollReveal(0.3);

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
      <Hero />

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
                <img src={w.img} alt={w.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

      <SolutionCards />

      {/* HOW IT WORKS */}
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

      {/* CTA */}
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
