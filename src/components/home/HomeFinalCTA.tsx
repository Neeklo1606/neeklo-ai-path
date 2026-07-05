import { motion } from "framer-motion";
import QuickLeadForm from "@/components/QuickLeadForm";

type Props = {
  lang: string;
  onOpenWizard: () => void;
};

export default function HomeFinalCTA({ lang }: Props) {
  const ru = lang === "ru";

  return (
    <section id="cta" style={{ padding: "64px 16px 80px", borderTop: "1px solid var(--bd)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row gap-10 lg:gap-16"
          style={{
            background: "linear-gradient(135deg, #111118 0%, #1a1a2a 100%)",
            borderRadius: 24,
            padding: "clamp(32px, 5vw, 56px)",
          }}
        >
          {/* ── Left column ── */}
          <div className="lg:flex-1">
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              {ru ? "НАЧАТЬ ПРОЕКТ" : "START PROJECT"}
            </p>
            <h2
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(24px, 3.5vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "white",
                marginBottom: 16,
              }}
            >
              {ru ? "Оставьте телефон — остальное сделаем мы" : "Leave your phone — we'll handle the rest"}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 340 }}>
              {ru
                ? "Перезвоним в течение 2 часов, зададим пару вопросов и предложим решение с точной сметой."
                : "We'll call back within 2 hours, ask a couple of questions and propose a solution with an exact estimate."}
            </p>
          </div>

          {/* ── Right column — форма в 1 поле ── */}
          <div className="lg:w-[380px] lg:shrink-0 flex flex-col justify-center">
            <QuickLeadForm variant="panel" source="home-final-cta" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
