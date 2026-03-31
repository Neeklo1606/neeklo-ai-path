import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const solutions = [
  { emoji: "🎬", name: "AI-ролики", slug: "ai-roliki" },
  { emoji: "🌐", name: "Сайты", slug: "sajt-pod-klyuch" },
  { emoji: "📱", name: "Mini App", slug: "telegram-mini-app" },
  { emoji: "✦", name: "AI-агенты", slug: "ai-agent" },
  { emoji: "🎨", name: "Дизайн", slug: "sajt-pod-klyuch" },
  { emoji: "📊", name: "Аналитика", slug: "ai-agent" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const SolutionCards = () => {
  const navigate = useNavigate();
  const section = useScrollReveal(0.15);

  return (
    <section className="mb-14 px-4 md:px-0" ref={section.ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-heading text-[22px] md:text-[28px] font-bold mb-6 md:mb-8 text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={section.visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          Что делаем
        </motion.h2>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {solutions.map((s, i) => (
            <motion.button
              key={s.slug + i}
              onClick={() => navigate(`/services/${s.slug}`)}
              className="flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={section.visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, ease, delay: i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "#F5F4F0" }}
              >
                <span className="text-[26px] md:text-[30px] leading-none">{s.emoji}</span>
              </div>
              <span className="font-body text-[13px] md:text-[14px] font-semibold text-foreground text-center leading-tight">
                {s.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionCards;
