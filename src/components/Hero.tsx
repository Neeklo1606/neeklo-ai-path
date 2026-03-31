import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

const Plasma = lazy(() => import("@/components/Plasma"));

/* ---- Framer stagger helpers ---- */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease, delay },
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
      <p className="font-heading text-[32px] md:text-[40px] font-[800] leading-none text-foreground tracking-tight">
        {value}
        {suffix}
      </p>
      <p
        className="font-body text-[11px] text-[#888] mt-1.5 uppercase"
        style={{ letterSpacing: "0.06em" }}
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
      className="relative flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ paddingTop: 80, paddingBottom: 60 }}
    >
      {/* Plasma background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Plasma
            color="#000000"
            speed={0.6}
            direction="forward"
            scale={1.2}
            opacity={0.15}
            mouseInteractive={true}
          />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Soft radial gradient blob */}
      <div
        className="absolute z-[1] pointer-events-none"
        style={{
          width: 600,
          height: 600,
          left: "50%",
          top: "35%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,155,145,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[780px] mx-auto">
        {/* Eyebrow badge */}
        <motion.div className="mb-8" {...fadeUp(0)}>
          <span
            className="inline-flex items-center gap-1.5 font-body uppercase rounded-full"
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              padding: "6px 14px",
              border: "1px solid rgba(0,0,0,0.1)",
              background: "rgba(0,0,0,0.04)",
              color: "hsl(var(--foreground))",
            }}
          >
            ✦ AI-продакшн студия · Москва
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          className="font-heading font-[800] leading-[1] text-foreground mb-5 md:mb-6"
          style={{
            fontSize: "clamp(44px, 8vw, 96px)",
            letterSpacing: "-0.03em",
          }}
          {...fadeUp(0.1)}
        >
          <span className="block">От идеи</span>
          <span className="block">до результата</span>
          <span className="block bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            за 48 часов
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-body text-[15px] md:text-[17px] text-muted-foreground leading-relaxed mb-10 max-w-[300px] md:max-w-[440px] mx-auto"
          {...fadeUp(0.25)}
        >
          AI-ролики, сайты, Mini App и автоматизация — заказывай онлайн,
          получай результат
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="w-full max-w-[440px] flex flex-col md:flex-row gap-3 mb-14"
          {...fadeUp(0.4)}
        >
          <button
            onClick={() => navigate("/chat")}
            className="hero-btn-primary flex items-center justify-center gap-2 md:flex-1"
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
            className="hero-btn-secondary md:flex-1"
          >
            Смотреть работы ↓
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          ref={stats.ref}
          className="w-full max-w-[540px] py-6"
          {...fadeUp(0.55)}
        >
          {/* Desktop: 3 cols with vertical dividers */}
          <div className="hidden md:grid grid-cols-3 gap-0">
            <StatItem target={150} suffix="+" label="проектов" active={stats.visible} />
            <div className="border-l border-border">
              <StatItem target={48} suffix="ч" label="срок сдачи" active={stats.visible} />
            </div>
            <div className="border-l border-border">
              <StatItem target={95} suffix="%" label="довольны" active={stats.visible} />
            </div>
          </div>

          {/* Mobile: 3 cols with horizontal dividers between rows */}
          <div className="md:hidden">
            <div className="grid grid-cols-3 gap-4">
              <StatItem target={150} suffix="+" label="проектов" active={stats.visible} />
              <StatItem target={48} suffix="ч" label="срок сдачи" active={stats.visible} />
              <StatItem target={95} suffix="%" label="довольны" active={stats.visible} />
            </div>
            <div className="border-t border-border/50 mt-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
