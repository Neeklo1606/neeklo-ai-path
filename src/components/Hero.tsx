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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const eyeOffsetX = useTransform(springX, [-300, 300], [-6, 6]);
  const eyeOffsetY = useTransform(springY, [-300, 300], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set(e.clientX - cx);
    mouseY.set(e.clientY - cy);
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
          {/* Sparkles around orb */}
          {[
            { x: -44, y: -20, size: 4, delay: 0 },
            { x: 48, y: -14, size: 3, delay: 0.8 },
            { x: -30, y: 40, size: 3, delay: 1.6 },
            { x: 40, y: 36, size: 4, delay: 0.4 },
            { x: 0, y: -48, size: 3.5, delay: 1.2 },
            { x: -50, y: 10, size: 2.5, delay: 2.0 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                marginLeft: s.x,
                marginTop: s.y,
                width: s.size,
                height: s.size,
                background: "#0D0D0B",
                borderRadius: "1px",
                transform: "rotate(45deg)",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                width: 96,
                height: 96,
                background: "radial-gradient(circle, rgba(0,82,255,0.08) 0%, transparent 70%)",
                transform: "scale(1.6)",
              }}
            />

            {/* Main orb */}
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: 96,
                height: 96,
                background: "linear-gradient(145deg, #FFFFFF 0%, #F0EEE8 100%)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {/* Face highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 60,
                  height: 30,
                  top: 18,
                  left: 18,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                  borderRadius: "50%",
                }}
              />

              {/* Eyes */}
              <div className="relative flex gap-4" style={{ marginTop: -4 }}>
                <motion.div
                  className="rounded-full bg-[#0D0D0B]"
                  style={{
                    width: 10,
                    height: 10,
                    x: eyeOffsetX,
                    y: eyeOffsetY,
                  }}
                />
                <motion.div
                  className="rounded-full bg-[#0D0D0B]"
                  style={{
                    width: 10,
                    height: 10,
                    x: eyeOffsetX,
                    y: eyeOffsetY,
                  }}
                />
              </div>

              {/* Smile */}
              <div
                className="absolute"
                style={{
                  width: 16,
                  height: 8,
                  bottom: 30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderBottom: "2.5px solid #0D0D0B",
                  borderRadius: "0 0 50% 50%",
                }}
              />
            </div>

            {/* Status dot */}
            <div
              className="absolute"
              style={{
                width: 14,
                height: 14,
                bottom: 4,
                right: 4,
                background: "#00B341",
                borderRadius: "50%",
                border: "3px solid #F0EEE8",
              }}
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
