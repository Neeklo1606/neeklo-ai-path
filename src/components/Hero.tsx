import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const fade = (delay: number, y = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: y ? 0.55 : 0.4, ease, delay },
});

const avatarColors = ["#D4C5B2", "#B8C9D4", "#C4D4B8", "#D4B8C9", "#C9C4D4"];

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width:768px)").matches;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const eyeOffsetX = useTransform(springX, [-300, 300], [-6, 6]);
  const eyeOffsetY = useTransform(springY, [-300, 300], [-4, 4]);

  const handleMouseMove = isMobile ? undefined : (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#F0EEE8", minHeight: "calc(100vh - 64px)" }}
      onMouseMove={handleMouseMove}
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
        {/* AI Orb */}
        <motion.div
          className="relative mb-8"
          {...fade(0)}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
          >
            {/* Main orb */}
            <div
              className="relative rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 120,
                height: 120,
                background: "#0D0D0B",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              {/* Highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  top: 10,
                  left: 14,
                  width: 28,
                  height: 18,
                  background: "rgba(255,255,255,0.07)",
                  transform: "rotate(-20deg)",
                }}
              />

              {/* Eyes */}
              <motion.div
                className="flex items-center justify-center"
                style={{ gap: 10, x: eyeOffsetX, y: eyeOffsetY, marginTop: -4 }}
              >
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 12,
                      height: 12,
                      background: "#FFFFFF",
                      boxShadow: "0 0 6px rgba(255,255,255,0.6)",
                    }}
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                  />
                ))}
              </motion.div>

              {/* Smile */}
              <div
                className="absolute"
                style={{
                  bottom: 22,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 8,
                  borderBottom: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "0 0 10px 10px",
                }}
              />
            </div>

            {/* Status dot */}
            <motion.div
              className="absolute"
              style={{
                width: 12,
                height: 12,
                bottom: 4,
                right: 4,
                background: "#00C853",
                borderRadius: "50%",
                border: "2px solid #F0EEE8",
                boxShadow: "0 0 6px rgba(0,200,83,0.5)",
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="font-body"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#6A6860",
            letterSpacing: "0.04em",
            marginBottom: 24,
          }}
          {...fade(0.06)}
        >
          AI-продакшн студия
        </motion.p>

        {/* Headline */}
        <motion.div style={{ marginBottom: 20 }} {...fade(0.12, 20)}>
          <h1
            className="font-heading"
            style={{
              fontWeight: 800,
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#0D0D0B",
            }}
          >
            От идеи до результата
          </h1>
          <p
            className="font-heading"
            style={{
              fontWeight: 700,
              fontSize: "clamp(26px, 3.5vw, 44px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#6A6860",
              marginTop: 6,
            }}
          >
            за 48 часов
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-body"
          style={{
            fontSize: 16,
            color: "#6A6860",
            lineHeight: 1.65,
            maxWidth: 400,
            marginBottom: 36,
          }}
          {...fade(0.2)}
        >
          Сайты, Mini App, AI-агенты и видео.
          <br />
          Быстро. Чисто. С результатом.
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
