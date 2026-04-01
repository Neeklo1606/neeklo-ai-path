import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot-new.png";

const ease = [0.16, 1, 0.3, 1] as const;

const fade = (delay: number, y = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: y ? 0.55 : 0.4, ease, delay },
});

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
        {/* Mascot */}
        <motion.div
          className="relative mb-6 cursor-pointer"
          {...fade(0)}
          onClick={() => navigate("/chat")}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="hero-mascot-float" style={{ width: 120, height: 120 }}>
            <img
              src={mascotImg}
              alt="Neeklo маскот"
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.15))",
                pointerEvents: "none",
              }}
            />
          </div>
          <style>{`
            .hero-mascot-float { animation: mascot-float 3.5s ease-in-out infinite; }
            @keyframes mascot-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
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
          style={{ fontSize: 16, color: "#9A958B", lineHeight: 1.6, marginBottom: 36 }}
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
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
            style={{ fontSize: 15, fontWeight: 600, padding: "14px 28px", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 14 }}
          >
            Заказать проект
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}
            className="font-body cursor-pointer hover:text-foreground transition-colors"
            style={{ fontSize: 14, fontWeight: 500, padding: "13px 16px", background: "transparent", color: "#6A6860", border: "none" }}
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
