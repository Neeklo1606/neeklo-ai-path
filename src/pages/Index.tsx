import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { usePageTitle } from "@/hooks/usePageTitle";
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
  usePageTitle("neeklo — AI-продакшн студия");

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
          <h2
            className="font-heading text-[28px] lg:text-[36px] font-extrabold mb-6 md:mb-8 text-[#0D0D0B]"
            style={revealStyle(stepsSection.visible)}
          >
            Как это работает
          </h2>

          {/* Mobile: vertical list */}
          <div className="flex flex-col gap-6 md:hidden">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="flex items-start gap-[14px]"
                style={revealStyle(stepsSection.visible, i * 150, true)}
              >
                <span className="font-heading text-[40px] font-extrabold text-[#E8E8E8] leading-none min-w-[48px]">
                  {s.num}
                </span>
                <div>
                  <p className="font-body text-[16px] font-bold text-[#0D0D0B]">{s.title}</p>
                  <p className="font-body text-[14px] text-[#6A6860] mt-[3px]">{s.desc}</p>
                </div>
              </div>
            ))}
            <div className="text-center mt-[20px]" style={revealStyle(stepsSection.visible, 500)}>
              <p className="font-body text-[13px] text-[#6A6860]">
                <span className="text-[#00B341] mr-1">✓</span>
                Первая консультация — бесплатно
              </p>
            </div>
          </div>

          {/* Desktop: 3 columns with dashed connector */}
          <div className="hidden md:block">
            <div className="relative grid grid-cols-3 gap-8">
              {/* Dashed line connecting numbers */}
              <div
                className="absolute left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] border-t border-dashed border-[#E0E0E0]"
                style={{ top: 20 }}
              />
              {steps.map((s, i) => (
                <div
                  key={s.num}
                  className="relative flex flex-col items-center text-center"
                  style={revealStyle(stepsSection.visible, i * 150)}
                >
                  <span className="font-heading text-[40px] font-extrabold text-[#E8E8E8] leading-none relative z-10 bg-background px-3">
                    {s.num}
                  </span>
                  <p className="font-body text-[16px] font-bold text-[#0D0D0B] mt-4">{s.title}</p>
                  <p className="font-body text-[14px] text-[#6A6860] mt-[3px]">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8" style={revealStyle(stepsSection.visible, 500)}>
              <p className="font-body text-[13px] text-[#6A6860]">
                <span className="text-[#00B341] mr-1">✓</span>
                Первая консультация — бесплатно
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-5 md:px-10" style={{ background: "#F0EEE8" }} ref={ctaSection.ref}>
        <div className="max-w-[600px] mx-auto" style={revealStyle(ctaSection.visible)}>
          <div className="text-center">
            <p className="font-heading text-[20px] md:text-[24px] font-extrabold text-[#0D0D0B] mb-2">Готов начать?</p>
            <p className="font-body text-[14px] text-[#6A6860] mb-5">Первая консультация бесплатно</p>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center justify-center gap-2 font-body text-[14px] font-semibold text-white mx-auto cursor-pointer"
              style={{
                background: "#0D0D0B",
                borderRadius: 12,
                padding: "13px 24px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#1a1a1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#0D0D0B"; }}
            >
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
