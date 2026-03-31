import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Hero from "@/components/Hero";
import SolutionCards from "@/components/SolutionCards";
import CasesSection from "@/components/CasesSection";

const steps = [
  { num: "01", title: "Опиши задачу", desc: "Напиши в чат — AI задаст уточняющие вопросы" },
  { num: "02", title: "AI собирает бриф", desc: "Формирует ТЗ, срок и предварительную стоимость" },
  { num: "03", title: "Менеджер берёт в работу", desc: "Обсуждаете детали, подписываете, стартуем" },
];

const LandingPage = () => {
  const navigate = useNavigate();

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
    <div className="flex-1 bg-background text-foreground pb-20 sm:pb-0">
      <Hero />

      <CasesSection />

      <SolutionCards />

      {/* HOW IT WORKS */}
      <section className="mb-14 px-4 md:px-0" ref={stepsSection.ref}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[22px] md:text-[28px] font-bold mb-5 md:mb-8" style={revealStyle(stepsSection.visible)}>Как это работает</h2>
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {steps.map((s, i) => (
              <button
                key={s.num}
                onClick={() => navigate(s.action)}
                className="game-card w-full text-left flex items-start gap-4 group cursor-pointer hover:border-foreground/20 active:scale-[0.98] transition-all duration-150"
                style={revealStyle(stepsSection.visible, i * 150, true)}
              >
                <span className="text-[20px] md:text-[24px] font-extrabold text-muted-foreground/40 mt-0.5 group-hover:text-primary transition-colors">{s.num}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold flex items-center gap-2">
                    {s.title}
                    <s.icon size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
              </button>
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
    </div>
  );
};

export default LandingPage;
