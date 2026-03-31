import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const categories = ["Все", "Видео", "Разработка", "AI"] as const;
type Category = typeof categories[number];

const services = [
  {
    emoji: "🎬",
    name: "AI-ролики",
    description: "Короткие видеоролики с помощью нейросетей для рекламы и соцсетей",
    category: "Видео" as Category,
    slug: "ai-roliki",
  },
  {
    emoji: "🌐",
    name: "Сайт под ключ",
    description: "Полный цикл разработки сайта: дизайн, вёрстка, запуск",
    category: "Разработка" as Category,
    slug: "sajt-pod-klyuch",
  },
  {
    emoji: "📱",
    name: "Telegram Mini App",
    description: "Мини-приложения внутри Telegram для бизнеса и автоматизации",
    category: "Разработка" as Category,
    slug: "telegram-mini-app",
  },
  {
    emoji: "✦",
    name: "AI-агент",
    description: "Интеллектуальный ассистент для автоматизации процессов",
    category: "AI" as Category,
    slug: "ai-agent",
  },
  {
    emoji: "🎨",
    name: "Дизайн",
    description: "Фирменный стиль, UI/UX дизайн, презентации и креативы",
    category: "Разработка" as Category,
    slug: "sajt-pod-klyuch",
  },
  {
    emoji: "📊",
    name: "Аналитика",
    description: "Настройка метрик, дашбордов и сквозной аналитики",
    category: "AI" as Category,
    slug: "ai-agent",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const ServicesPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<Category>("Все");

  const filtered = active === "Все" ? services : services.filter((s) => s.category === active);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="font-heading text-[28px] md:text-[36px] font-extrabold text-foreground tracking-tight">
            Услуги
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px]">
            Выберите подходящее решение
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="font-body text-[13px] font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all duration-150 flex-shrink-0"
              style={{
                background: active === cat ? "#0D0D0B" : "#F5F4F0",
                color: active === cat ? "#fff" : "#6A6860",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((s, i) => (
            <motion.button
              key={s.slug + s.name}
              onClick={() => navigate(`/services/${s.slug}`)}
              className="flex flex-col items-start p-4 md:p-5 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow duration-200 cursor-pointer text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: i * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "#F5F4F0" }}
              >
                <span className="text-[24px] md:text-[28px] leading-none">{s.emoji}</span>
              </div>
              <span className="font-body text-[15px] md:text-[16px] font-bold text-foreground leading-tight">
                {s.name}
              </span>
              <span className="font-body text-[12px] md:text-[13px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
                {s.description}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ServicesPage;
