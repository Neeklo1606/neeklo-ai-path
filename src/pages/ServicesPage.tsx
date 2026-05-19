import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePageTitle } from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";

const ease = [0.16, 1, 0.3, 1] as const;

interface ServiceCard {
  slug: string;
  emoji: string;
  badge?: string;
  title: { ru: string; en: string };
  desc: { ru: string; en: string };
  includes: string[];
  tags: string[];
  price: string;
  duration: { ru: string; en: string };
}

const SERVICES: ServiceCard[] = [
  {
    slug: "ai-video",
    emoji: "🎬",
    badge: "ХИТ",
    title: { ru: "AI-видеоролики", en: "AI Video" },
    desc: { ru: "Рекламные ролики, reels и презентации с нейросетями без съёмочной группы.", en: "Ad videos, reels and presentations with AI. No film crew needed." },
    includes: ["Сценарий и раскадровка", "Генерация (Runway / Kling / HeyGen)", "Монтаж и озвучка"],
    tags: ["Runway", "HeyGen", "Kling"],
    price: "от 25 000 ₽",
    duration: { ru: "от 3 дней", en: "from 3 days" },
  },
  {
    slug: "web",
    emoji: "🌐",
    title: { ru: "Сайт под ключ", en: "Website" },
    desc: { ru: "Лендинг или корпоративный сайт с AI-ассистентом, SEO и удобной CMS.", en: "Landing or corporate site with AI assistant, SEO and easy CMS." },
    includes: ["Дизайн и вёрстка (React)", "AI-ассистент на сайте", "CMS для редактирования"],
    tags: ["React", "Next.js", "Tailwind"],
    price: "от 80 000 ₽",
    duration: { ru: "от 14 дней", en: "from 14 days" },
  },
  {
    slug: "ai-assistant",
    emoji: "🤖",
    title: { ru: "AI-ассистент", en: "AI Assistant" },
    desc: { ru: "Отвечает на вопросы, обрабатывает заявки и работает 24/7 вместо менеджера.", en: "Answers questions, handles leads and works 24/7 instead of a manager." },
    includes: ["GPT-4 / Claude база", "Квалификация лидов", "CRM-интеграция"],
    tags: ["GPT-4", "Claude", "RAG"],
    price: "от 50 000 ₽",
    duration: { ru: "от 7 дней", en: "from 7 days" },
  },
  {
    slug: "telegram",
    emoji: "✈️",
    badge: "POPULAR",
    title: { ru: "Telegram-бот / Mini App", en: "Telegram Bot / Mini App" },
    desc: { ru: "AI-продавец в Telegram, который квалифицирует заявки и не теряет клиентов.", en: "AI sales assistant in Telegram that qualifies leads and never loses customers." },
    includes: ["AI-ответы в диалоге", "Квалификация лидов", "Mini App (опционально)"],
    tags: ["Telegram", "Python", "Mini App"],
    price: "от 40 000 ₽",
    duration: { ru: "от 7 дней", en: "from 7 days" },
  },
  {
    slug: "education",
    emoji: "📚",
    title: { ru: "Обучение по нейросетям", en: "AI Training" },
    desc: { ru: "Практический курс для предпринимателей и команд. Внедряешь AI сразу в работу.", en: "Hands-on AI course for entrepreneurs and teams. Learn by doing." },
    includes: ["Под вашу нишу и задачи", "ChatGPT, Claude, Midjourney", "Промпты и шаблоны"],
    tags: ["ChatGPT", "Claude", "Midjourney"],
    price: "от 8 900 ₽",
    duration: { ru: "от 1 дня", en: "from 1 day" },
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const ru = lang === "ru";
  usePageTitle(ru ? "Услуги · neeklo" : "Services · neeklo");

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      {/* Hero */}
      <section style={{ padding: "48px 20px 40px", borderBottom: "1px solid var(--bd)" }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
              {ru ? "Услуги" : "Services"}
            </p>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--tx)", marginBottom: 12 }}>
              {ru ? "Готовые решения для бизнеса" : "Ready-made solutions for business"}
            </h1>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.6, maxWidth: 480 }}>
              {ru
                ? "Сайты, боты, AI-ассистенты и видео с нейросетями. От идеи до результата."
                : "Websites, bots, AI assistants and neural video. From idea to result."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cards grid */}
      <section style={{ padding: "32px 20px" }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: i * 0.05 }}
              >
                <ServiceCard svc={s} ru={ru} onOpen={() => navigate(`/services/${s.slug}`)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "0 20px 32px" }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--bd)",
              borderRadius: 20,
              padding: "40px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
              {ru ? "Не знаете что выбрать?" : "Not sure what to pick?"}
            </p>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 10 }}>
              {ru ? "Опишите задачу, подберём решение" : "Describe the task, we'll find the solution"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--tx-muted)", marginBottom: 24, lineHeight: 1.6 }}>
              {ru ? "Смета и план за 24 часа. Бесплатно." : "Estimate and plan in 24 hours. Free."}
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-2 transition-all duration-150 active:scale-[0.97]"
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "var(--tx)",
                color: "var(--bg)",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              {ru ? "Начать проект" : "Start project"}
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ svc, ru, onOpen }: { svc: ServiceCard; ru: boolean; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className="flex flex-col h-full transition-all duration-200 cursor-pointer"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--bd)",
        borderRadius: 16,
        padding: "20px",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--bd-hover)";
        el.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--bd)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Badge + external link */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 28 }}>{svc.emoji}</span>
        <div className="flex items-center gap-2">
          {svc.badge && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 6,
              background: "var(--surface-2)",
              color: "var(--ac-b)",
              border: "1px solid var(--bd)",
            }}>
              {svc.badge}
            </span>
          )}
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, background: "var(--surface-2)", border: "1px solid var(--bd)" }}
          >
            <ArrowUpRight size={14} strokeWidth={2} style={{ color: "var(--tx-faint)" }} />
          </div>
        </div>
      </div>

      {/* Title + desc */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.3 }}>
        {svc.title[ru ? "ru" : "en"]}
      </h3>
      <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
        {svc.desc[ru ? "ru" : "en"]}
      </p>

      {/* Includes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {svc.includes.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "var(--ac-b)", flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 12, color: "var(--tx-muted)" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 14 }}>
        {svc.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 6,
              background: "var(--surface-2)",
              color: "var(--tx-faint)",
              border: "1px solid var(--bd)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ borderTop: "1px solid var(--bd)", paddingTop: 12, marginTop: "auto" }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ac-b)" }}>{svc.price}</div>
          <div style={{ fontSize: 11, color: "var(--tx-faint)", marginTop: 2 }}>
            {svc.duration[ru ? "ru" : "en"]}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tx-muted)" }}>
          {ru ? "Подробнее →" : "Details →"}
        </span>
      </div>
    </div>
  );
}
