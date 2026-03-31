import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const fade = (delay: number, y = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: y ? 0.55 : 0.4, ease, delay },
});

const cardEntry = (delay: number) => ({
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease, delay },
});

const avatarColors = ["#D4C5B2", "#B8C9D4", "#C4D4B8", "#D4B8C9", "#C9C4D4"];

const AnimatedProgress = () => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(72), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height: 3, borderRadius: 9999, background: "#F0F0F0", marginTop: 10 }}>
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          background: "#0D0D0B",
          borderRadius: 9999,
          transition: "width 1.8s ease-out",
        }}
      />
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#F0EEE8", minHeight: "calc(100vh - 64px)" }}
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Container */}
      <div
        className="relative mx-auto flex items-center px-5 sm:px-8 lg:px-12"
        style={{ maxWidth: 1200, minHeight: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] w-full gap-8 py-14 lg:py-0">
          {/* ===== LEFT ===== */}
          <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start px-0 sm:px-0"
            style={{ padding: "56px 20px 40px" }}
          >
            {/* Category */}
            <motion.p
              className="font-body"
              style={{
                fontSize: 13, fontWeight: 500, color: "#6A6860",
                letterSpacing: "0.04em", marginBottom: 28,
              }}
              {...fade(0)}
            >
              AI-продакшн студия
            </motion.p>

            {/* Headline */}
            <motion.div style={{ marginBottom: 20 }} {...fade(0.08, 20)}>
              <h1
                className="font-heading"
                style={{
                  fontWeight: 800,
                  fontSize: "clamp(40px, 4.8vw, 68px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  color: "#0D0D0B",
                }}
              >
                От идеи
                <br />
                до результата
              </h1>
              <p
                className="font-heading"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(28px, 3.2vw, 44px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  color: "#6A6860",
                  marginTop: 8,
                }}
              >
                за 48 часов
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="font-body"
              style={{
                fontSize: 16, color: "#6A6860", lineHeight: 1.65,
                maxWidth: 400, marginBottom: 36,
              }}
              {...fade(0.18)}
            >
              Сайты, Mini App, AI-агенты и видео.
              <br />
              Быстро. Чисто. С результатом.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
              {...fade(0.28)}
            >
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer"
                style={{
                  fontSize: 15, fontWeight: 600, padding: "13px 24px",
                  background: "#0D0D0B", color: "#fff", border: "none",
                  borderRadius: 10,
                  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.18)";
                  e.currentTarget.style.background = "#1a1a1a";
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
                className="font-body cursor-pointer"
                style={{
                  fontSize: 14, fontWeight: 500, padding: "13px 16px",
                  background: "transparent", color: "#6A6860", border: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#0D0D0B";
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.textUnderlineOffset = "3px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6A6860";
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Смотреть работы
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center gap-3.5 w-full justify-center lg:justify-start"
              style={{
                marginTop: 36, paddingTop: 28,
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
              {...fade(0.38)}
            >
              <div className="flex items-center">
                {avatarColors.map((bg, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 28, height: 28, background: bg,
                      border: "2px solid #F0EEE8",
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: 5 - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                  47 клиентов доверяют
                </p>
                <p className="font-body" style={{ fontSize: 12, color: "#6A6860" }}>
                  <span style={{ color: "#F5A623" }}>★★★★★</span> 4.9
                </p>
              </div>
            </motion.div>
          </div>

          {/* ===== RIGHT ===== */}
          <div className="hidden lg:block relative" style={{ height: 520, overflow: "visible" }}>
            {/* Decorative circle */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 420, height: 420, right: -40, top: "50%",
                transform: "translateY(-50%)",
                borderRadius: "50%", border: "1px solid rgba(0,0,0,0.06)",
                zIndex: 0,
              }}
            />

            {/* Card 1 — Проект сдан */}
            <motion.div
              className="absolute"
              style={{ left: "2%", top: "8%", width: 195, zIndex: 1, animation: "heroFloat1 3.2s ease-in-out infinite" }}
              {...cardEntry(0.5)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 20, height: 20, borderRadius: "50%", background: "#EDFAF2" }}
                  >
                    <Check size={11} color="#00B341" strokeWidth={3} />
                  </div>
                  <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                    Проект сдан
                  </p>
                </div>
                <p className="font-body" style={{ fontSize: 11, color: "#6A6860", marginTop: 3, marginLeft: 30 }}>
                  DA-Motors · Mini App
                </p>
              </div>
            </motion.div>

            {/* Card 2 — dark stat */}
            <motion.div
              className="absolute"
              style={{ right: "4%", top: "2%", width: 140, zIndex: 1, animation: "heroFloat2 4s ease-in-out 0.6s infinite" }}
              {...cardEntry(0.62)}
            >
              <div
                style={{
                  background: "#0D0D0B", borderRadius: 16, padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)",
                }}
              >
                <p className="font-heading" style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  150+
                </p>
                <p className="font-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                  клиентов
                </p>
              </div>
            </motion.div>

            {/* Card 3 — AI progress */}
            <motion.div
              className="absolute"
              style={{ left: "8%", top: "44%", width: 210, zIndex: 1, animation: "heroFloat3 3.6s ease-in-out 1s infinite" }}
              {...cardEntry(0.74)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13 }}>✦</span>
                  <p className="font-body" style={{ fontSize: 13, fontWeight: 500, color: "#0D0D0B" }}>
                    AI собирает бриф
                  </p>
                </div>
                <AnimatedProgress />
              </div>
            </motion.div>

            {/* Card 4 — review */}
            <motion.div
              className="absolute"
              style={{ right: "2%", bottom: "10%", width: 185, zIndex: 1, animation: "heroFloat4 4.4s ease-in-out 1.4s infinite" }}
              {...cardEntry(0.86)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)",
                }}
              >
                <p style={{ fontSize: 11, color: "#F5A623", letterSpacing: 1 }}>★★★★★</p>
                <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginTop: 6 }}>
                  Всё чётко, в срок!
                </p>
                <p className="font-body" style={{ fontSize: 11, color: "#6A6860", marginTop: 3 }}>
                  Максим, Москва
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
