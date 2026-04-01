import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const fade = (delay: number, y = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: y ? 0.55 : 0.4, ease, delay },
});

const avatarColors = ["#D4C5B2", "#B8C9D4", "#C4D4B8", "#D4B8C9", "#C9C4D4"];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#F0EEE8", minHeight: "calc(100vh - 64px)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        className="relative mx-auto flex flex-col items-center justify-center text-center px-5 sm:px-8"
        style={{ maxWidth: 800, minHeight: "calc(100vh - 64px)", paddingTop: 40, paddingBottom: 80 }}
      >
        {/* AI Orb — pure CSS */}
        <motion.div
          className="relative mb-5"
          {...fade(0)}
        >
          <div
            className="hero-orb-wrapper"
            style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}
          >
            {/* Main sphere */}
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 32%, #3a3a3a 0%, #1a1a1a 45%, #080808 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3), inset 0 -8px 20px rgba(0,0,0,0.6), inset 0 6px 14px rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "visible",
              }}
            >
              {/* Highlight */}
              <div style={{ position: "absolute", top: 10, left: 15, width: 28, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.10)", transform: "rotate(-25deg)", pointerEvents: "none" }} />
              {/* Small highlight */}
              <div style={{ position: "absolute", top: 20, right: 22, width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

              {/* Eyes */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -52%)", display: "flex", gap: 10 }}>
                <div className="hero-orb-eye" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", boxShadow: "0 0 8px rgba(255,255,255,0.9)" }} />
                <div className="hero-orb-eye hero-orb-eye-2" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", boxShadow: "0 0 8px rgba(255,255,255,0.9)" }} />
              </div>

              {/* Smile */}
              <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", width: 14, height: 6, borderBottom: "2px solid rgba(255,255,255,0.25)", borderRadius: "0 0 8px 8px" }} />
            </div>

            {/* Status dot */}
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#00C853", border: "3px solid #F0EEE8", boxShadow: "0 0 10px rgba(0,200,83,0.6)" }} />
          </div>

          <style>{`
            .hero-orb-wrapper { animation: hero-float 3.5s ease-in-out infinite; }
            @keyframes hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            .hero-orb-eye { animation: hero-blink 4s ease-in-out infinite; }
            .hero-orb-eye-2 { animation: hero-blink 4s ease-in-out infinite 0.1s; }
            @keyframes hero-blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.05)} }
          `}</style>
        </motion.div>

        {/* Headline */}
        <motion.div style={{ marginBottom: 20 }} {...fade(0.1, 20)}>
          <h1
            className="font-heading"
            style={{
              fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 58px)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#0D0D0B",
            }}
          >
            Сайты и AI-агенты
            <br />
            под ключ
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-body"
          style={{
            fontSize: 16,
            color: "#9A958B",
            lineHeight: 1.6,
            marginBottom: 36,
          }}
          {...fade(0.2)}
        >
          Пиши задачу. Получай результат.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          {...fade(0.3)}
        >
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer"
            style={{
              fontSize: 15,
              fontWeight: 600,
              padding: "14px 28px",
              background: "#0D0D0B",
              color: "#fff",
              border: "none",
              borderRadius: 14,
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
              fontSize: 14,
              fontWeight: 500,
              padding: "13px 16px",
              background: "transparent",
              color: "#6A6860",
              border: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0D0D0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6A6860")}
          >
            Смотреть работы
            <ChevronDown size={14} className="inline ml-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
