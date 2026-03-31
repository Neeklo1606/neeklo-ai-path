import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import HolographicCard from "@/components/ui/holographic-card";

import workFashion from "@/assets/work-fashion.webp";
import workStudio from "@/assets/work-studio.webp";
import workRacing from "@/assets/work-racing.webp";
import workVision from "@/assets/work-vision.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";
import workAssistant from "@/assets/work-assistant.webp";

const cases = [
  { cat: "AI-видео", title: "Имиджевый ролик", img: workFashion, wide: true },
  { cat: "Сайт", title: "Лендинг студии", img: workStudio },
  { cat: "AI-видео", title: "Промо для бренда", img: workRacing },
  { cat: "Mini App", title: "Vision AI App", img: workVision },
  { cat: "Сайт", title: "Интернет-магазин", img: workEcommerce },
  { cat: "AI", title: "AI-ассистент", img: workAssistant },
];

const ease = [0.16, 1, 0.3, 1] as const;

const CasesSection = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.08);

  return (
    <section id="works" className="mt-8 mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-4 md:mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="font-heading text-[24px] md:text-[36px] font-[800] text-foreground">
            Наши работы
          </h2>
          <button
            onClick={() => navigate("/cases")}
            className="hidden md:flex items-center gap-1.5 font-body text-[13px] font-[600] text-muted-foreground hover:text-foreground transition-colors"
          >
            Все работы
            <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Grid — compact */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              className={c.wide ? "col-span-2 sm:col-span-2" : ""}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={section.visible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}
            >
              <HolographicCard className="group cursor-pointer">
                <button
                  onClick={() => navigate("/cases")}
                  className="relative w-full text-left"
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl ${
                      c.wide
                        ? "aspect-[16/9] sm:aspect-[2.2/1]"
                        : "aspect-[3/4] sm:aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />

                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
                      }}
                    />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <span
                        className="inline-block font-body text-[11px] sm:text-[12px] font-[600] text-white/90 rounded-full backdrop-blur-md"
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          padding: "4px 10px",
                        }}
                      >
                        {c.cat}
                      </span>
                      <p className="font-body text-[14px] sm:text-[15px] font-[700] text-white mt-1.5 leading-tight">
                        {c.title}
                      </p>
                    </div>
                  </div>
                </button>
              </HolographicCard>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <motion.div
          className="flex justify-center mt-5 md:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease, delay: 0.4 }}
        >
          <button
            onClick={() => navigate("/cases")}
            className="font-body text-[13px] font-[600] text-foreground py-2.5 px-5 rounded-xl transition-colors duration-150 hover:bg-muted/30 flex items-center gap-1.5"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            Смотреть все
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
