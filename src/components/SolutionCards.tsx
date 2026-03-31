import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import iconVideo from "@/assets/icon-video.png";
import iconWeb from "@/assets/icon-web.png";
import iconApp from "@/assets/icon-app.png";
import iconAI from "@/assets/icon-ai.png";
import iconDesign from "@/assets/icon-design.png";
import iconAnalytics from "@/assets/icon-analytics.png";

const solutions = [
  { icon: iconVideo, name: "AI-ролики", slug: "ai-roliki", price: "от 25 000 ₽", badge: "ХИТ" },
  { icon: iconWeb, name: "Сайты", slug: "sajt-pod-klyuch", price: "от 95 000 ₽", badge: null },
  { icon: iconApp, name: "Mini App", slug: "telegram-mini-app", price: "от 65 000 ₽", badge: null },
  { icon: iconAI, name: "AI-агенты", slug: "ai-agent", price: "от 150 000 ₽", badge: "ТОП" },
  { icon: iconDesign, name: "Дизайн", slug: "sajt-pod-klyuch", price: "от 30 000 ₽", badge: null },
  { icon: iconAnalytics, name: "Аналитика", slug: "ai-agent", price: "от 40 000 ₽", badge: null },
];

const ease = [0.16, 1, 0.3, 1] as const;

const SolutionCards = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.15);

  return (
    <section className="mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-heading text-[28px] lg:text-[36px] font-extrabold mb-6 md:mb-8 text-[#0D0D0B]"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          Продукты
        </motion.h2>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-4">
          {solutions.map((s, i) => (
            <motion.button
              key={s.slug + i}
              onClick={() => navigate(`/services/${s.slug}`)}
              className="relative flex flex-col items-center text-center rounded-2xl bg-white border border-[#F0F0F0] p-4 lg:p-5 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={section.visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease, delay: i * 0.07 }}
              whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Badge */}
              {s.badge && (
                <span className="absolute top-2.5 right-2.5 bg-[#0D0D0B] text-white text-[9px] font-bold px-[7px] py-[2px] rounded-full leading-none">
                  {s.badge}
                </span>
              )}

              {/* Icon */}
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mb-3 bg-[#F5F5F0] group-hover:bg-[#EDEDE8] transition-colors">
                <img
                  src={s.icon}
                  alt={s.name}
                  className="w-7 h-7 lg:w-8 lg:h-8 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* Name */}
              <p className="font-heading text-[13px] lg:text-[14px] font-bold text-[#0D0D0B] leading-tight group-hover:text-[#0052FF] transition-colors">
                {s.name}
              </p>

              {/* Price */}
              <p className="font-body text-[11px] lg:text-[12px] font-semibold text-[#6A6860] mt-1">
                {s.price}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionCards;
