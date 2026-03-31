import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const solutions = [
  { emoji: "🎬", name: "AI-ролики", slug: "ai-roliki", price: "от 25 000 ₽", desc: "Рекламные ролики с нейросетями", badge: "ХИТ" },
  { emoji: "🌐", name: "Сайт под ключ", slug: "sajt-pod-klyuch", price: "от 95 000 ₽", desc: "Лендинг или корп. сайт с AI", badge: null },
  { emoji: "📱", name: "Mini App", slug: "telegram-mini-app", price: "от 65 000 ₽", desc: "Приложение прямо в Telegram", badge: null },
  { emoji: "✦", name: "AI-агент", slug: "ai-agent", price: "от 150 000 ₽", desc: "Автоматизация продаж и процессов", badge: "ТОП" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const SolutionCards = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.15);

  return (
    <section className="mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-heading text-[28px] lg:text-[36px] font-extrabold mb-6 md:mb-8 text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          Что делаем
        </motion.h2>

        <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-4 lg:gap-4">
          {solutions.map((s, i) => (
            <motion.div
              key={s.slug}
              className="relative flex flex-col bg-white border border-[#F0F0F0] rounded-2xl p-4 lg:p-5 cursor-pointer group"
              initial={{ opacity: 0, y: 24 }}
              animate={section.visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, ease, delay: i * 0.07 }}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/services/${s.slug}`)}
            >
              {/* Icon + Badge row */}
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "#F5F5F5" }}
                >
                  <span className="text-[20px] leading-none">{s.emoji}</span>
                </div>
                {s.badge && (
                  <span className="bg-[#0D0D0B] text-white text-[10px] font-bold px-2 py-[3px] rounded-full leading-none">
                    {s.badge}
                  </span>
                )}
              </div>

              {/* Name */}
              <p className="font-heading text-[14px] lg:text-[15px] font-bold text-[#0D0D0B] mt-[10px] leading-tight">
                {s.name}
              </p>

              {/* Price */}
              <p className="font-body text-[13px] font-bold text-[#0052FF] mt-[3px]">
                {s.price}
              </p>

              {/* Description — desktop only */}
              <p className="hidden lg:block font-body text-[13px] text-muted-foreground mt-1 leading-snug">
                {s.desc}
              </p>

              {/* Buttons */}
              <div className="mt-auto pt-[10px] flex flex-col lg:flex-row gap-2">
                <button
                  className="hidden lg:block font-body text-[13px] font-semibold border border-[#E0E0E0] text-[#0D0D0B] rounded-lg px-3 py-[9px] hover:bg-[#F5F5F5] transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/services/${s.slug}`); }}
                >
                  Подробнее
                </button>
                <button
                  className="w-full lg:flex-1 font-body text-[13px] font-semibold bg-[#0D0D0B] text-white rounded-lg px-3 py-[9px] hover:bg-[#1a1a18] transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
                >
                  Заказать
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionCards;
