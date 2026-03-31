import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Hero from "@/components/Hero";
import SolutionCards from "@/components/SolutionCards";
import CasesSection from "@/components/CasesSection";

const steps = [
  { num: "01", title: "Опиши задачу", desc: "напиши в чат что нужно" },
  { num: "02", title: "AI собирает бриф", desc: "формирует ТЗ и цену" },
  { num: "03", title: "Получи результат", desc: "менеджер берёт в работу" },
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
