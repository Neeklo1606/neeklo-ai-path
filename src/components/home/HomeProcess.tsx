import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = {
  num: string;
  title: { ru: string; en: string };
  short: { ru: string; en: string };
  detail: { ru: string; en: string };
  result: { ru: string; en: string };
  cta?: { label: { ru: string; en: string }; href: string };
};

const STEPS: Step[] = [
  {
    num: "01",
    title: { ru: "Задача", en: "Task" },
    short: { ru: "Расскажите о проекте", en: "Tell us about the project" },
    detail: {
      ru: "Заполните бриф за 2 минуты или напишите в Telegram. Мы изучим задачу и ответим в течение 2 часов.",
      en: "Fill out the brief in 2 minutes or write us in Telegram. We will review the task and reply within 2 hours.",
    },
    result: { ru: "Ответ и первая оценка в течение 2 часов", en: "Reply and first estimate within 2 hours" },
    cta: { label: { ru: "Заполнить бриф", en: "Fill brief" }, href: "/brief" },
  },
  {
    num: "02",
    title: { ru: "Концепт", en: "Concept" },
    short: { ru: "Идея, смета, сроки", en: "Idea, estimate, timeline" },
    detail: {
      ru: "Подготовим концепцию, подробную смету и план проекта. Созвон 30 минут, обсудим детали.",
      en: "We prepare a concept, detailed estimate and project plan. A 30-minute call to discuss the details.",
    },
    result: { ru: "Смета и план проекта на руках", en: "Estimate and project plan in hand" },
  },
  {
    num: "03",
    title: { ru: "Разработка", en: "Development" },
    short: { ru: "Итерации и согласование", en: "Iterations and approval" },
    detail: {
      ru: "Делаем итерациями: показываем промежуточный результат каждые 2–3 дня. Вы всегда в курсе.",
      en: "We build in iterations: showing intermediate results every 2–3 days. You're always in the loop.",
    },
    result: { ru: "Промежуточные показы каждые 2–3 дня", en: "Demos every 2–3 days" },
  },
  {
    num: "04",
    title: { ru: "Запуск", en: "Launch" },
    short: { ru: "Релиз и поддержка", en: "Release and support" },
    detail: {
      ru: "Деплоим, настраиваем аналитику, передаём все доступы и документацию. После запуска остаёмся на связи.",
      en: "We deploy, set up analytics, hand over all access and documentation. We stay in touch after launch.",
    },
    result: { ru: "Все доступы и документация ваши", en: "All access and documentation are yours" },
  },
];

type Props = { lang: string };

export default function HomeProcess({ lang }: Props) {
  const ru = lang === "ru";
  const [open, setOpen] = useState<string | null>("01");

  return (
    <section style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 24 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 4, textTransform: "uppercase" }}>
            {ru ? "Процесс" : "Process"}
          </p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
            {ru ? "Как это работает" : "How it works"}
          </h2>
        </motion.div>

        <div style={{ borderTop: "1px solid var(--bd)" }}>
          {STEPS.map((step) => {
            const isOpen = open === step.num;
            return (
              <div key={step.num} style={{ borderBottom: "1px solid var(--bd)" }}>
                {/* Row — always visible */}
                <button
                  onClick={() => setOpen(isOpen ? null : step.num)}
                  className="w-full flex items-center gap-4 text-left transition-colors duration-150"
                  style={{ padding: "18px 0", background: "none", border: "none", cursor: "pointer" }}
                >
                  {/* Number circle */}
                  <span
                    className="flex items-center justify-center rounded-full shrink-0 transition-colors duration-200"
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 12,
                      fontWeight: 700,
                      background: isOpen ? "var(--tx)" : "var(--surface-2)",
                      color: isOpen ? "var(--bg)" : "var(--tx-faint)",
                      border: isOpen ? "none" : "1px solid var(--bd)",
                    }}
                  >
                    {step.num}
                  </span>

                  {/* Title + short */}
                  <div className="flex-1">
                    <span style={{ fontSize: 16, fontWeight: 700, color: isOpen ? "var(--tx)" : "var(--tx-muted)" }}>
                      {step.title[ru ? "ru" : "en"]}
                    </span>
                    {!isOpen && (
                      <span style={{ fontSize: 13, color: "var(--tx-faint)", marginLeft: 8 }}>
                        · {step.short[ru ? "ru" : "en"]}
                      </span>
                    )}
                  </div>

                  {/* Toggle icon */}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 22, lineHeight: 1, color: "var(--tx-faint)", flexShrink: 0, userSelect: "none" }}
                  >
                    +
                  </motion.span>
                </button>

                {/* Expandable detail */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ paddingLeft: 56, paddingBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.65, maxWidth: 480 }}>
                          {step.detail[ru ? "ru" : "en"]}
                        </p>
                        <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: "var(--ac-b)", fontWeight: 500 }}>
                          <span>→</span>
                          <span>{step.result[ru ? "ru" : "en"]}</span>
                        </div>
                        {step.cta && (
                          <a
                            href={step.cta.href}
                            className="inline-flex items-center gap-2 transition-colors duration-150"
                            style={{
                              alignSelf: "flex-start",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--tx)",
                              background: "var(--surface-2)",
                              border: "1px solid var(--bd)",
                              padding: "8px 16px",
                              borderRadius: 9999,
                              textDecoration: "none",
                              marginTop: 4,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--bd-hover)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--bd)"; }}
                          >
                            {step.cta.label[ru ? "ru" : "en"]} →
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ fontSize: 13, color: "var(--tx-faint)", marginTop: 20 }}
        >
          {ru ? "⚡ Средний срок старта: 48 часов" : "⚡ Avg. start time: 48 hours"}
        </motion.p>
      </div>
    </section>
  );
}
