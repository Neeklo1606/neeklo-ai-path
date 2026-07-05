import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type CardType = "crm" | "video" | "booking";

const CARDS: { bg: string; label: string; tagline: string; type: CardType }[] = [
  {
    bg: "bg-sky-100",
    label: "Сайт + ИИ-ассистент + CRM",
    tagline: "Заявки не теряются, система отвечает сама",
    type: "crm",
  },
  {
    bg: "bg-rose-100",
    label: "ИИ видео и визуалы для бизнеса",
    tagline: "Ролик для рекламы или соцсетей. За 3-5 дней",
    type: "video",
  },
  {
    bg: "bg-emerald-100",
    label: "Онлайн-запись и бот для клиентов",
    tagline: "Клиент записывается сам. Вы не теряете ни одного обращения.",
    type: "booking",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onOpenWizard?: (serviceId?: string) => void;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroNew(_props: Props) {
  const [current, setCurrent] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track first render to skip initial animation (fixes FM12 opacity-0 bug)
  const isFirstRender = useRef(true);
  useEffect(() => { isFirstRender.current = false; }, []);

  // Start auto-advance at 5000ms
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % CARDS.length);
    }, 5000);
  }, []);

  // Manual switch: switch immediately, pause auto for 60s
  const handleManualSwitch = useCallback((index: number) => {
    setCurrent(index);
    if (autoRef.current) clearInterval(autoRef.current);
    if (pauseRef.current) clearTimeout(pauseRef.current);
    pauseRef.current = setTimeout(() => startAuto(), 60_000);
  }, [startAuto]);

  useEffect(() => {
    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
      if (pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, [startAuto]);

  // Главная CTA ведёт к форме заявки внизу страницы (#cta)
  const handleCTA = () => {
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = (current + 1) % CARDS.length;
  const next2 = (current + 2) % CARDS.length;

  return (
    <section
      id="hero"
      className="w-full pt-6 pb-16 px-4 overflow-hidden relative"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Hero text block ── */}
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* H1 */}
        <h1
          style={{
            fontFamily: "'Onest', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 7.5vw, 60px)",
            lineHeight: 1.08,
            letterSpacing: "-0.035em",
            color: "var(--tx)",
            textAlign: "center",
          }}
        >
          Ваш бизнес получает
          <br />
          заявки — даже ночью
        </h1>

        {/* Subtitle */}
        <p
          className="mt-3"
          style={{
            fontSize: "clamp(14px, 3.5vw, 17px)",
            color: "var(--tx-muted)",
            textAlign: "center",
            maxWidth: 460,
            lineHeight: 1.6,
          }}
        >
          Сайты, AI-ассистенты и Telegram-боты для малого бизнеса — старт за 48 часов.
        </p>

        {/* CTA buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleCTA()}
            className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold"
          >
            Начать проект
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <Link
            to="/cases"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-colors duration-150"
            style={{
              color: "var(--tx)",
              border: "1px solid var(--bd)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--bd-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--bd)"; }}
          >
            Посмотреть работы
          </Link>
        </div>
      </div>

      {/* ── Card system ── */}
      <div className="relative w-full max-w-xl mx-auto mt-6">
        {/* Decorative background cards */}
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-1000 ease-in-out ${CARDS[next].bg}`}
          style={{ transform: "rotate(2deg) scale(0.95)", opacity: 0.4 }}
        />
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-1000 ease-in-out ${CARDS[next2].bg}`}
          style={{ transform: "rotate(-1deg) scale(0.97)", opacity: 0.3 }}
        />

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={isFirstRender.current ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`relative z-10 w-full rounded-3xl p-5 shadow-xl ${CARDS[current].bg}`}
          >
            {/* Card header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.4)", color: "rgba(0,0,0,0.6)" }}
              >
                neeklo
              </span>
            </div>

            {/* Card label block */}
            <div className="mb-3">
              <p
                style={{
                  fontFamily: "'Onest', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "rgba(0,0,0,0.9)",
                  lineHeight: 1.4,
                }}
              >
                {CARDS[current].label}
              </p>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", marginTop: 2 }}>
                {CARDS[current].tagline}
              </p>
            </div>

            {/* Card content area */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {CARDS[current].type === "crm" && <CRMContent />}
              {CARDS[current].type === "video" && <VideoContent />}
              {CARDS[current].type === "booking" && <BookingContent />}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* ── Indicators ── */}
      <div className="flex items-center gap-5 mt-6 justify-center">
        {CARDS.map((card, i) => (
          <button
            key={i}
            onClick={() => handleManualSwitch(i)}
            className="flex flex-col items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
            aria-label={card.label}
          >
            <div
              className="h-0.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 32 : 12,
                background: i === current ? "var(--tx)" : "var(--bd)",
              }}
            />
            <span
              className="text-[10px] font-medium whitespace-nowrap transition-colors"
              style={{ color: i === current ? "var(--tx)" : "var(--tx-faint)" }}
            >
              {card.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── CRM Card Content ─────────────────────────────────────────────────────────

function CRMContent() {
  const rows = [
    { name: "Алексей М.", text: "Нужен сайт для кафе", time: "2 мин", color: "bg-blue-400" },
    { name: "ИИ-ассистент", text: "Ответил клиенту автоматически", time: "2 мин", color: "bg-green-400" },
    { name: "Марина К.", text: "Интересует бот для записи", time: "18 мин", color: "bg-purple-400" },
  ];

  return (
    <div>
      <p className="text-[13px] font-semibold mb-3" style={{ color: "rgba(0,0,0,0.8)" }}>
        Входящие заявки
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.4)" }}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${row.color}`}
            >
              <span className="text-[11px] font-bold text-white">{row.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: "rgba(0,0,0,0.8)" }}>
                {row.name}
              </p>
              <p className="text-[10px] truncate" style={{ color: "rgba(0,0,0,0.6)" }}>
                {row.text}
              </p>
            </div>
            <span className="text-[10px] shrink-0" style={{ color: "rgba(0,0,0,0.5)" }}>
              {row.time}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.3)" }}
      >
        <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.6)" }}>
          CRM: 3 новые заявки
        </span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
          ИИ ответил
        </span>
      </div>
    </div>
  );
}

// ─── Video Card Content ───────────────────────────────────────────────────────

function VideoContent() {
  const steps: { label: string; done: boolean; progress?: number }[] = [
    { label: "Сценарий", done: true },
    { label: "Озвучка ИИ", done: true },
    { label: "Монтаж", done: false, progress: 72 },
  ];

  return (
    <div>
      <p className="text-[13px] font-semibold mb-3" style={{ color: "rgba(0,0,0,0.8)" }}>
        Рендер ролика для клиента
      </p>

      {/* Preview block */}
      <div className="rounded-xl overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-rose-300 to-orange-200 relative">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/hero-ai.mp4"
            poster="/videos/hero-ai.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-1.5 mt-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            {step.done ? (
              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                <span className="text-[9px] text-white font-bold">✓</span>
              </div>
            ) : (
              <div className="w-16 h-1.5 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.3)" }}>
                <div
                  className="h-full rounded-full bg-rose-400"
                  style={{ width: `${step.progress ?? 0}%` }}
                />
              </div>
            )}
            <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.7)" }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Booking Card Content ─────────────────────────────────────────────────────

function BookingContent() {
  const messages: { bot: boolean; text: string }[] = [
    { bot: true, text: "Привет. Выберите услугу" },
    { bot: false, text: "Стрижка и укладка" },
    { bot: true, text: "Свободно: сегодня 15:00, завтра 11:00" },
    { bot: false, text: "Запишите на сегодня 15:00" },
  ];

  return (
    <div>
      <p className="text-[13px] font-semibold mb-3" style={{ color: "rgba(0,0,0,0.8)" }}>
        Онлайн-запись через бота
      </p>

      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.bot ? "justify-start" : "justify-end"}`}>
            <span
              className="px-3 py-1.5 text-[11px]"
              style={{
                background: msg.bot ? "rgba(255,255,255,0.5)" : "#34d399",
                color: msg.bot ? "rgba(0,0,0,0.7)" : "white",
                borderRadius: msg.bot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                display: "inline-block",
                maxWidth: "80%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.3)" }}
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.6)" }}>
          Запись подтверждена. Клиент получил уведомление
        </span>
      </div>
    </div>
  );
}
