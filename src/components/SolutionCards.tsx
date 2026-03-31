import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const solutions = [
  { emoji: "🎬", badge: "ХИТ", badgeColor: "#0D0D0B", name: "AI-ролики", price: "от 25 000 ₽", desc: "Рекламные ролики с нейросетями", slug: "ai-roliki" },
  { emoji: "🌐", name: "Сайт под ключ", price: "от 95 000 ₽", desc: "Лендинг или корп. сайт с AI", slug: "sajt-pod-klyuch" },
  { emoji: "📱", name: "Telegram Mini App", price: "от 65 000 ₽", desc: "Приложение прямо в Telegram", slug: "telegram-mini-app" },
  { emoji: "✦", badge: "ТОП", badgeColor: "#0052FF", name: "AI-агент", price: "от 150 000 ₽", desc: "Автоматизация продаж и процессов", slug: "ai-agent" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const SolutionCards = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.15);

  return (
    <section className="mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-heading text-[22px] md:text-[28px] font-bold mb-5 md:mb-8 text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          Что делаем
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {solutions.map((s, i) => (
            <motion.div
              key={s.slug}
              className="solution-card relative flex flex-col bg-white text-left"
              style={{
                border: "1px solid #F0F0F0",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={section.visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.10)", transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Top row: icon + badge */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 44, height: 44, background: "#F5F4F0" }}
                >
                  <span className="text-[20px] leading-none">{s.emoji}</span>
                </div>
                {s.badge && (
                  <span
                    className="font-body font-[700] uppercase"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      padding: "4px 8px",
                      borderRadius: 9999,
                      background: s.badgeColor,
                      color: "white",
                    }}
                  >
                    {s.badge}
                  </span>
                )}
              </div>

              {/* Name */}
              <p className="font-heading text-[16px] font-[700] text-foreground">{s.name}</p>

              {/* Price */}
              <p className="font-body text-[15px] font-[700] mt-1" style={{ color: "#0052FF" }}>
                {s.price}
              </p>

              {/* Description */}
              <p className="font-body text-[13px] mt-1 mb-4 leading-[1.5]" style={{ color: "#888" }}>
                {s.desc}
              </p>

              {/* Buttons */}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/services/${s.slug}`)}
                  className="font-body text-[13px] font-medium py-[10px] px-4 rounded-lg text-foreground transition-colors duration-150 hover:bg-[#F5F4F0]"
                  style={{ border: "1px solid #E5E5E5", background: "white" }}
                >
                  Подробнее
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="font-body text-[13px] font-medium py-[10px] px-4 rounded-lg text-white transition-colors duration-150 hover:opacity-90"
                  style={{ background: "#0D0D0B" }}
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
