import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeLeft = (delay: number) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease, delay },
});

const fadeScale = (delay: number) => ({
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease, delay },
});

/* ---- Avatars ---- */
const avatarColors = ["#E8D5C4", "#C4D5E8", "#D5E8C4", "#E8C4D5"];

/* ---- Progress bar with animation ---- */
const AnimatedProgress = () => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setVal(75), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: 3, borderRadius: 9999, background: "#F0F0F0", marginTop: 8 }}
    >
      <div
        style={{
          height: "100%",
          width: `${val}%`,
          background: "#0D0D0B",
          borderRadius: 9999,
          transition: "width 2s ease",
        }}
      />
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const stats = useScrollReveal(0.4);
  const count150 = useCountUp(150, stats.visible, 1200);
  const count48 = useCountUp(48, stats.visible, 1200);
  const count95 = useCountUp(95, stats.visible, 1200);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#F5F4F0", minHeight: "calc(100vh - 64px)" }}
    >
      {/* BG decorative elements */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          width: 500, height: 500, right: -100, top: "50%", transform: "translateY(-50%)",
          borderRadius: "50%", border: "1px solid rgba(0,0,0,0.05)",
        }}
      />
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          width: 200, height: 200, right: 80, top: "30%",
          borderRadius: "50%", background: "rgba(0,0,0,0.02)", filter: "blur(40px)",
        }}
      />

      {/* Container */}
      <div
        className="relative mx-auto flex items-center px-4 lg:px-10"
        style={{ maxWidth: 1200, minHeight: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] w-full gap-8 py-12 lg:py-0">
          {/* ===== LEFT COLUMN ===== */}
          <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            {/* Eyebrow */}
            <motion.div style={{ marginBottom: 20 }} {...fadeLeft(0)}>
              <span
                className="inline-flex items-center gap-1.5 font-body"
                style={{
                  fontSize: 12, padding: "5px 12px 5px 8px", borderRadius: 9999,
                  background: "#fff", border: "1px solid rgba(0,0,0,0.1)", color: "#6A6860",
                }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 6, height: 6, background: "#00C853",
                    boxShadow: "0 0 0 3px rgba(0,200,83,0.2)",
                    animation: "pulse 2s infinite",
                  }}
                />
                В работе · 3 проекта
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              className="font-heading"
              style={{
                fontWeight: 800,
                fontSize: "clamp(34px, 4.2vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#0D0D0B",
                marginBottom: 16,
              }}
              {...fadeLeft(0.1)}
            >
              От идеи до результата
              <br />
              <span className="relative inline-block">
                за&nbsp;48&nbsp;часов
                <span
                  className="absolute font-body select-none"
                  style={{
                    top: -10, right: -48, fontSize: 10, fontWeight: 700,
                    background: "#0D0D0B", color: "#fff", padding: "3px 7px",
                    borderRadius: 6, transform: "rotate(-6deg)",
                    lineHeight: 1.2,
                  }}
                >
                  NEW
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-body"
              style={{
                fontSize: 16, color: "#6A6860", lineHeight: 1.6,
                maxWidth: 420, marginBottom: 28,
              }}
              {...fadeLeft(0.2)}
            >
              Делаем сайты, Mini App, AI-агентов и видео — быстро, чисто, с&nbsp;результатом.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row items-center lg:items-start gap-2.5 w-full sm:w-auto"
              style={{ marginBottom: 36 }}
              {...fadeLeft(0.3)}
            >
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center justify-center gap-2 font-body w-full sm:w-auto rounded-full lg:rounded-xl cursor-pointer"
                style={{
                  fontSize: 14, fontWeight: 600, padding: "13px 24px",
                  background: "#0D0D0B", color: "#fff", border: "none",
                  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                  e.currentTarget.style.background = "#2a2a2a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#0D0D0B";
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              >
                Заказать проект
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() =>
                  document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-body cursor-pointer hidden sm:inline-block"
                style={{
                  fontSize: 14, fontWeight: 500, padding: "13px 16px",
                  background: "transparent", color: "#6A6860", border: "none",
                  textDecoration: "underline", textUnderlineOffset: 3,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0D0D0B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6A6860")}
              >
                Смотреть работы
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center gap-4"
              {...fadeLeft(0.4)}
            >
              {/* Avatars */}
              <div className="flex items-center" style={{ marginRight: -4 }}>
                {avatarColors.map((bg, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 32, height: 32, background: bg,
                      border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8,
                      zIndex: 4 - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="font-body" style={{ fontSize: 13, fontWeight: 500, color: "#0D0D0B" }}>
                  47+ довольных клиентов
                </p>
                <p className="font-body" style={{ fontSize: 11, color: "#6A6860" }}>
                  ★★★★★ 4.9 / 5
                </p>
              </div>
            </motion.div>

            {/* Mobile stats row */}
            <div
              ref={stats.ref}
              className="mt-8 flex lg:hidden justify-center w-full"
            >
              <p className="font-body text-center" style={{ fontSize: 13, color: "#6A6860" }}>
                {count150}+ проектов · {count48}ч срок · {count95}% довольны
              </p>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="hidden lg:block relative" style={{ height: 480 }} ref={stats.ref}>
            {/* Card A — Проект запущен */}
            <motion.div
              className="absolute"
              style={{ left: "0%", top: "5%", width: 200, animation: "floatCard 3s ease-in-out infinite" }}
              {...fadeScale(0.5)}
            >
              <div
                className="flex items-start gap-3"
                style={{
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 20, height: 20, borderRadius: "50%", background: "#E8F8EE" }}
                >
                  <Check size={12} color="#00B341" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                    Проект запущен
                  </p>
                  <p className="font-body" style={{ fontSize: 11, color: "#6A6860" }}>
                    DA-Motors · Mini App
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card B — 150+ */}
            <motion.div
              className="absolute"
              style={{ left: "auto", right: "0%", top: "0%", width: 130, animation: "floatCard 4s ease-in-out 0.5s infinite" }}
              {...fadeScale(0.65)}
            >
              <div
                style={{
                  background: "#0D0D0B", borderRadius: 14, padding: 16,
                }}
              >
                <p className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
                  150+
                </p>
                <p className="font-body" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  проектов
                </p>
              </div>
            </motion.div>

            {/* Card C — AI генерирует */}
            <motion.div
              className="absolute"
              style={{ left: "15%", top: "42%", width: 220 }}
              {...fadeScale(0.8)}
              {...floatY(6, 3.5, 1)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 12, padding: "12px 16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>✦</span>
                  <p className="font-body" style={{ fontSize: 13, fontWeight: 500, color: "#0D0D0B" }}>
                    AI собирает бриф...
                  </p>
                </div>
                <AnimatedProgress />
              </div>
            </motion.div>

            {/* Card D — Review */}
            <motion.div
              className="absolute"
              style={{ left: "55%", top: "68%", width: 190 }}
              {...fadeScale(0.95)}
              {...floatY(10, 4.5, 1.5)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 14, padding: "14px 16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <p style={{ fontSize: 12, color: "#FFB800", marginBottom: 4 }}>★★★★★</p>
                <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                  Всё чётко, в срок!
                </p>
                <p className="font-body" style={{ fontSize: 11, color: "#6A6860" }}>
                  — Максим, Москва
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
