import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot-nobg.webp";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        background: "#F0EEE8",
        height: "calc(100dvh - 52px)",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative z-10 flex flex-col items-center px-5 sm:px-8" style={{ maxWidth: 700 }}>
        <motion.div
          className="relative cursor-pointer"
          style={{ marginBottom: 20 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => navigate("/chat")}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.06 }}
        >
          <div className="hero-mascot-float" style={{ width: "clamp(140px, 22vw, 200px)", height: "clamp(140px, 22vw, 200px)" }}>
            <img
              src={mascotImg}
              alt="Neeklo маскот"
              width={200}
              height={200}
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.18)) saturate(1.15) contrast(1.05)",
                pointerEvents: "none",
              }}
            />
          </div>
        </motion.div>

        <motion.h1
          className="font-heading"
          style={{ fontWeight: 800, fontSize: "clamp(30px, 5.5vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "#0D0D0B" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Сайты и AI-агенты<br />под ключ
        </motion.h1>

        <motion.p
          className="font-body"
          style={{ fontSize: 16, color: "#807B72", lineHeight: 1.6, marginTop: 14, marginBottom: 28 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Пиши задачу. Получай результат.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
        >
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
            style={{ fontSize: 15, fontWeight: 600, padding: "14px 28px", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 14 }}
          >
            Заказать проект <ArrowRight size={16} />
          </button>
          <button
            onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}
            className="font-body cursor-pointer hover:text-foreground transition-colors"
            style={{ fontSize: 14, fontWeight: 500, padding: "13px 16px", background: "transparent", color: "#6A6860", border: "none" }}
          >
            Смотреть работы <ChevronDown size={14} className="inline ml-1" />
          </button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={20} color="#B0ADA8" />
      </motion.div>

      <style>{`
        .hero-mascot-float { animation: mascot-float 3.5s ease-in-out infinite; will-change: transform; }
        @keyframes mascot-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </section>
  );
};

export default Hero;
