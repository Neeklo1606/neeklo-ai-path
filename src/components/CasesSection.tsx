import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import workFashion from "@/assets/work-fashion.webp";
import workStudio from "@/assets/work-studio.webp";
import workRacing from "@/assets/work-racing.webp";
import workVision from "@/assets/work-vision.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";
import workAssistant from "@/assets/work-assistant.webp";

const gradients: Record<string, string> = {
  "AI-видео": "linear-gradient(135deg, #1a1a2e, #16213e)",
  "Сайт": "linear-gradient(135deg, #0f3460, #533483)",
  "Mini App": "linear-gradient(135deg, #0d0d0d, #1a1a1a)",
  "AI": "linear-gradient(135deg, #0a0a0a, #2d2d2d)",
};

const cases = [
  { cat: "AI-видео", title: "Имиджевый ролик", emoji: "🎬", img: workFashion, wide: true },
  { cat: "Сайт", title: "Лендинг студии", emoji: "🌐", img: workStudio },
  { cat: "AI-видео", title: "Промо для бренда", emoji: "🏎️", img: workRacing },
  { cat: "Mini App", title: "Vision AI App", emoji: "📱", img: workVision },
  { cat: "Сайт", title: "Интернет-магазин", emoji: "🛍️", img: workEcommerce },
  { cat: "AI", title: "AI-ассистент", emoji: "✦", img: workAssistant },
];

const ease = [0.16, 1, 0.3, 1] as const;

const CasesSection = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.1);

  return (
    <section id="works" className="mt-8 mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-5 md:mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="font-heading text-[28px] md:text-[36px] font-[800] text-foreground">
            Наши работы
          </h2>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#FFB800" }} className="text-[14px]">★</span>
            <span className="font-body text-[14px] font-[600] text-muted-foreground">4.9 / 5</span>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {cases.map((c, i) => (
            <motion.button
              key={i}
              onClick={() => navigate("/cases")}
              className={`relative overflow-hidden cursor-pointer text-left ${
                c.wide ? "md:col-span-2" : ""
              }`}
              style={{
                borderRadius: 16,
                height: i < 2 ? undefined : undefined, // handled by classes
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={section.visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: i * 0.07 }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
              whileTap={{ scale: 0.99 }}
            >
              <div
                className={`relative w-full ${
                  i < 2
                    ? "h-[200px] md:h-[280px]"
                    : "h-[200px] md:h-[220px]"
                }`}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: gradients[c.cat] || gradients["AI"],
                }}
              >
                {/* Image or emoji placeholder */}
                {c.img ? (
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[48px]">{c.emoji}</span>
                  </div>
                )}

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)",
                  }}
                />

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span
                    className="inline-block font-body text-[11px] font-[600] text-white rounded-full backdrop-blur-sm"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "4px 10px",
                    }}
                  >
                    {c.cat}
                  </span>
                  <p className="font-body text-[15px] font-[700] text-white mt-1.5 leading-tight">
                    {c.title}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.5 }}
        >
          <button
            onClick={() => navigate("/cases")}
            className="font-body text-[14px] font-[600] text-foreground py-[10px] px-6 rounded-xl transition-colors duration-150 hover:bg-muted/30 flex items-center gap-2"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            Смотреть все работы
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
