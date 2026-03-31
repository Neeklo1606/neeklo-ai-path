import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ---- Framer helpers ---- */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease, delay },
});

/* ---- Stat counter ---- */
const StatItem = ({
  target,
  suffix,
  label,
  active,
}: {
  target: number;
  suffix: string;
  label: string;
  active: boolean;
}) => {
  const value = useCountUp(target, active, 1200);
  return (
    <div className="text-center">
      <p
        className="font-heading leading-none tracking-tight"
        style={{ fontSize: 32, fontWeight: 800, color: "#0D0D0B" }}
      >
        {value}
        {suffix}
      </p>
      <p
        className="font-body uppercase"
        style={{
          fontSize: 11,
          color: "#6A6860",
          letterSpacing: "0.06em",
          marginTop: 2,
        }}
      >
        {label}
      </p>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const stats = useScrollReveal(0.4);

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#F5F4F0",
        paddingTop: 80,
        paddingBottom: 60,
      }}
    >
      {/* Subtle radial blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 300,
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.03)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <div
        className="relative flex flex-col items-center text-center w-full mx-auto px-4 sm:px-0"
        style={{ maxWidth: 760, zIndex: 1 }}
      >
        {/* Eyebrow */}
        <motion.div style={{ marginBottom: 24 }} {...fadeUp(0)}>
          <span
            className="inline-flex items-center font-body uppercase"
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              padding: "6px 14px",
              borderRadius: 9999,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "rgba(0,0,0,0.04)",
              color: "#6A6860",
            }}
          >
            ✦ AI-продакшн студия · Москва
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          className="font-heading"
          style={{
            fontWeight: 800,
            fontSize: "clamp(36px, 5.5vw, 68px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#0D0D0B",
            marginBottom: 16,
          }}
          {...fadeUp(0.08)}
        >
          От идеи до результата за&nbsp;48&nbsp;часов
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-body"
          style={{
            fontSize: 17,
            color: "#6A6860",
            lineHeight: 1.5,
            maxWidth: 480,
            margin: "0 auto",
            marginBottom: 32,
          }}
          {...fadeUp(0.18)}
        >
          AI-ролики, сайты, Mini App и автоматизация — заказывай онлайн,
          получай результат
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full sm:w-auto"
          style={{ marginBottom: 48 }}
          {...fadeUp(0.28)}
        >
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto rounded-full sm:rounded-xl cursor-pointer"
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "13px 26px",
              background: "#0D0D0B",
              color: "#fff",
              border: "none",
              transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          >
            Заказать проект
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() =>
              document
                .getElementById("works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-body w-full sm:w-auto rounded-full sm:rounded-xl cursor-pointer"
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "13px 26px",
              background: "#fff",
              color: "#0D0D0B",
              border: "1px solid #D0D0D0",
              transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          >
            Смотреть работы ↓
          </button>
        </motion.div>

        {/* Divider */}
        <div
          className="w-full"
          style={{
            height: 1,
            background: "rgba(0,0,0,0.06)",
            marginBottom: 28,
          }}
        />

        {/* Stats */}
        <motion.div
          ref={stats.ref}
          className="flex items-center justify-center"
          style={{ gap: 48 }}
          {...fadeUp(0.4)}
        >
          {/* Desktop with dividers */}
          <div className="hidden sm:flex items-center" style={{ gap: 48 }}>
            <StatItem target={150} suffix="+" label="проектов" active={stats.visible} />
            <div style={{ width: 1, height: 32, background: "rgba(0,0,0,0.08)" }} />
            <StatItem target={48} suffix="ч" label="срок сдачи" active={stats.visible} />
            <div style={{ width: 1, height: 32, background: "rgba(0,0,0,0.08)" }} />
            <StatItem target={95} suffix="%" label="довольны" active={stats.visible} />
          </div>
          {/* Mobile without dividers */}
          <div className="flex sm:hidden items-center justify-center" style={{ gap: 20 }}>
            <StatItem target={150} suffix="+" label="проектов" active={stats.visible} />
            <StatItem target={48} suffix="ч" label="срок сдачи" active={stats.visible} />
            <StatItem target={95} suffix="%" label="довольны" active={stats.visible} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
