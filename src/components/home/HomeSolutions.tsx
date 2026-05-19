import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Globe, Video, CalendarCheck, TrendingUp, Bot, Smartphone,
  ArrowUpRight, X,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Data ─────────────────────────────────────────────────────────────────────

type Color = "sky" | "rose" | "emerald" | "violet" | "purple" | "cyan";

type Solution = {
  id: string;
  icon: React.ElementType;
  color: Color;
  title: string;
  description: string;
  tags: string[];
  badge?: string;
};

const bgMap: Record<Color, string> = {
  sky:     "color-mix(in srgb, #0ea5e9 12%, var(--surface))",
  rose:    "color-mix(in srgb, #f43f5e 12%, var(--surface))",
  emerald: "color-mix(in srgb, #10b981 12%, var(--surface))",
  violet:  "color-mix(in srgb, #7c3aed 12%, var(--surface))",
  purple:  "color-mix(in srgb, #a855f7 12%, var(--surface))",
  cyan:    "color-mix(in srgb, #06b6d4 12%, var(--surface))",
};

const gradientMap: Record<Color, string> = {
  sky:     "linear-gradient(135deg, #bae6fd 0%, #e0f2fe 100%)",
  rose:    "linear-gradient(135deg, #fecdd3 0%, #fff1f2 100%)",
  emerald: "linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%)",
  violet:  "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 100%)",
  purple:  "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)",
  cyan:    "linear-gradient(135deg, #a5f3fc 0%, #cffafe 100%)",
};

const SOLUTIONS: Solution[] = [
  {
    id: "site-ai-crm",
    icon: Globe,
    color: "sky",
    title: "Сайт + ИИ-ассистент + CRM",
    description: "Система, которая помогает получать обращения и не терять заявки.",
    tags: ["Сайт", "ИИ-ассистент", "CRM", "Заявки"],
    badge: "Популярный",
  },
  {
    id: "ai-video",
    icon: Video,
    color: "rose",
    title: "ИИ видео и визуалы для бизнеса",
    description: "Ролик для рекламы или соцсетей за 3-5 дней: сценарий, озвучка ИИ, монтаж.",
    tags: ["Видео", "Reels", "Визуалы", "Контент"],
  },
  {
    id: "booking-bot",
    icon: CalendarCheck,
    color: "emerald",
    title: "Онлайн-запись и бот для клиентов",
    description: "Клиент записывается сам, бот напоминает и не даёт потерять заявку.",
    tags: ["Запись", "Бот", "Telegram", "Напоминания"],
  },
  {
    id: "landing-funnel",
    icon: TrendingUp,
    color: "violet",
    title: "Сайт с воронкой заявок",
    description: "Страница, которая не просто висит, а помогает получать обращения и заявки.",
    tags: ["Лендинг", "Оффер", "Формы", "SEO"],
  },
  {
    id: "ai-assistant-site",
    icon: Bot,
    color: "purple",
    title: "ИИ-ассистент для сайта",
    description: "Отвечает клиентам автоматически и помогает не терять обращения.",
    tags: ["GPT", "Claude", "RAG", "Автоответ"],
  },
  {
    id: "telegram-mini-app",
    icon: Smartphone,
    color: "cyan",
    title: "Telegram Mini App",
    description: "Мини-приложение внутри Telegram: запись, каталог или кабинет клиента.",
    tags: ["Mini App", "Каталог", "Кабинет", "Telegram"],
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = { lang: string };

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomeSolutions({ lang }: Props) {
  const ru = lang === "ru";
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCard = SOLUTIONS.find((s) => s.id === activeId) ?? null;

  const close = useCallback(() => setActiveId(null), []);

  // Close on Escape
  useEffect(() => {
    if (!activeId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeId, close]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeId]);

  return (
    <section style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
              {ru ? "Продукты" : "Products"}
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
              {ru ? "Готовые решения" : "Ready solutions"}
            </h2>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.38, ease, delay: i * 0.04 }}
            >
              <SolutionCard s={s} onOpen={() => setActiveId(s.id)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal portal */}
      <AnimatePresence>
        {activeCard && (
          <SolutionModal card={activeCard} onClose={close} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Solution Card ─────────────────────────────────────────────────────────────

function SolutionCard({ s, onOpen }: { s: Solution; onOpen: () => void }) {
  const Icon = s.icon;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left flex flex-col gap-3 transition-all duration-200"
      style={{
        padding: "16px",
        borderRadius: 16,
        background: bgMap[s.color],
        border: "1px solid var(--bd)",
        cursor: "pointer",
        minHeight: 44,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--bd-hover)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--bd)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top row: icon + arrow */}
      <div className="flex items-start justify-between">
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={18} color="var(--tx-muted)" strokeWidth={1.8} />
        </div>
        <ArrowUpRight size={15} color="var(--tx-faint)" strokeWidth={1.8} />
      </div>

      {/* Title + badge */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", lineHeight: 1.3 }}>
            {s.title}
          </h3>
          {s.badge && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 9999,
              background: "color-mix(in srgb, var(--ac-b) 15%, transparent)",
              color: "var(--ac-b)",
              whiteSpace: "nowrap",
              lineHeight: 1.6,
            }}>
              {s.badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>
          {s.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-auto">
        {s.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 9999,
              background: "var(--surface-2)",
              color: "var(--tx-faint)",
              border: "1px solid var(--bd)",
              lineHeight: 1.6,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Solution Modal ────────────────────────────────────────────────────────────

function SolutionModal({ card, onClose }: { card: Solution; onClose: () => void }) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 640;

  const handleCTA = () => {
    onClose();
    navigate("/chat");
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 40,
        }}
      />

      {/* Panel */}
      {isMobile ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <ModalContent card={card} onClose={onClose} onCTA={handleCTA} isMobile />
        </motion.div>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              maxWidth: 480,
              width: "100%",
              background: "var(--bg)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "var(--shadow-modal)",
              border: "1px solid var(--bd)",
            }}
          >
            <ModalContent card={card} onClose={onClose} onCTA={handleCTA} isMobile={false} />
          </motion.div>
        </div>
      )}
    </>,
    document.body
  );
}

// ─── Modal Content ─────────────────────────────────────────────────────────────

function ModalContent({
  card,
  onClose,
  onCTA,
  isMobile,
}: {
  card: Solution;
  onClose: () => void;
  onCTA: () => void;
  isMobile: boolean;
}) {
  return (
    <div>
      {/* Drag handle (mobile only) */}
      {isMobile && (
        <div style={{ width: 40, height: 4, background: "var(--bd)", borderRadius: 9999, margin: "0 auto 20px" }} />
      )}

      {/* Close button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--tx)", lineHeight: 1.2 }}>
            {card.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center flex-shrink-0 ml-3"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--bd)",
            cursor: "pointer",
            minWidth: 36,
          }}
          aria-label="Закрыть"
        >
          <X size={16} color="var(--tx-muted)" strokeWidth={2} />
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6, marginBottom: 14 }}>
        {card.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {card.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 9999,
              background: "var(--surface-2)",
              color: "var(--tx-faint)",
              border: "1px solid var(--bd)",
              lineHeight: 1.6,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Preview block */}
      <div
        style={{
          aspectRatio: "16/9",
          borderRadius: 14,
          background: gradientMap[card.color],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          overflow: "hidden",
          border: "1px solid var(--bd)",
        }}
      >
        <span style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>
          Пример проекта
        </span>
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={onCTA}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold"
        style={{ minHeight: 44 }}
      >
        Обсудить проект
      </button>
    </div>
  );
}
