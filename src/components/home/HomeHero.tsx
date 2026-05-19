import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SOLUTIONS } from "@/data/homeData";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  lang: string;
  onOpenWizard: (serviceId?: string) => void;
};

export default function HomeHero({ lang, onOpenWizard }: Props) {
  const ru = lang === "ru";

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ padding: "24px 20px 24px" }}
    >
      {/* Dot grid bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--tx) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 200,
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--ac-glow) 18%, transparent), transparent)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-4 w-full" style={{ maxWidth: 680 }}>
        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.04 }}
          style={{
            fontSize: "clamp(36px, 9vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "var(--tx)",
          }}
        >
          {ru ? (
            <>
              Сайт, бот и AI<br />
              от идеи до заявок<br />
              за 48 часов
            </>
          ) : (
            <>
              Site, bot and AI<br />
              from idea to leads<br />
              in 48 hours
            </>
          )}
        </motion.h1>

        {/* Subtitle — single line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          style={{
            fontSize: "clamp(14px, 3.5vw, 17px)",
            color: "var(--tx-muted)",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {ru
            ? "Помогаем малому бизнесу не терять клиентов: быстро и под ключ."
            : "We help small businesses stop losing customers. Fast and turnkey."}
        </motion.p>

        {/* Chips — horizontal scroll, single row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.18 }}
          className="w-full"
        >
          <div
            className="flex gap-2 overflow-x-auto snap-x"
            style={{
              scrollbarWidth: "none",
              marginLeft: -20,
              marginRight: -20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 4,
            }}
          >
            {SOLUTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenWizard(s.id)}
                className="shrink-0 snap-start transition-all duration-150 active:scale-[0.95] touch-manipulation whitespace-nowrap"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 9999,
                  background: "var(--surface-2)",
                  border: "1px solid var(--bd)",
                  color: "var(--tx-muted)",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--bd-hover)";
                  e.currentTarget.style.color = "var(--tx)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--bd)";
                  e.currentTarget.style.color = "var(--tx-muted)";
                }}
              >
                {s.chipLabel[ru ? "ru" : "en"]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Flow hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease, delay: 0.24 }}
          className="flex items-center justify-center gap-1.5 flex-wrap"
          style={{ fontSize: 12, color: "var(--tx-faint)" }}
        >
          <span>{ru ? "Выбираете направление" : "Choose a direction"}</span>
          <span style={{ color: "var(--bd)" }}>→</span>
          <span>{ru ? "Заполняете бриф за 2 мин" : "Fill brief in 2 min"}</span>
          <span style={{ color: "var(--bd)" }}>→</span>
          <span style={{ color: "var(--tx-muted)" }}>{ru ? "Получаете решение за 48 часов" : "Get your solution in 48 hours"}</span>
        </motion.div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.3 }}
          className="w-full sm:w-auto"
        >
          <button
            onClick={() => onOpenWizard()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto transition-all duration-150 active:scale-[0.97] touch-manipulation"
            style={{
              height: 48,
              paddingLeft: 28,
              paddingRight: 22,
              borderRadius: 9999,
              background: "var(--tx)",
              color: "var(--bg)",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "var(--shadow-card-hover)",
            }}
          >
            {ru ? "Начать проект" : "Start project"}
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
