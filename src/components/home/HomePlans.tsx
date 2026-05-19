import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PLANS } from "@/data/homeData";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  lang: string;
  onOpenWizard: () => void;
};

export default function HomePlans({ lang, onOpenWizard }: Props) {
  const ru = lang === "ru";

  return (
    <section style={{ padding: "80px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="mb-10"
        >
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
            {ru ? "Сопровождение" : "Support plans"}
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
            {ru ? "После запуска мы остаёмся рядом" : "We stay with you after launch"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ maxWidth: 720 }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease, delay: i * 0.08 }}
              style={{
                background: plan.featured ? "var(--surface-2)" : "var(--surface)",
                border: plan.featured ? "1px solid var(--bd-hover)" : "1px solid var(--bd)",
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {plan.featured && (
                <span
                  className="absolute top-4 right-4"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: "var(--ac-b)",
                    color: "var(--bg)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {ru ? "Популярный" : "Popular"}
                </span>
              )}

              {/* Name + desc */}
              <p style={{ fontSize: 17, fontWeight: 700, color: "var(--tx)", marginBottom: 4 }}>
                {plan.name[ru ? "ru" : "en"]}
              </p>
              <p style={{ fontSize: 13, color: "var(--tx-muted)", marginBottom: 20 }}>
                {plan.desc[ru ? "ru" : "en"]}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--tx)" }}>
                  {plan.price[ru ? "ru" : "en"]}
                </span>
                <span style={{ fontSize: 13, color: "var(--tx-faint)" }}>
                  {plan.period[ru ? "ru" : "en"]}
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      style={{ color: "var(--ac-b)", flexShrink: 0, marginTop: 2 }}
                    />
                    <span style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.5 }}>
                      {f[ru ? "ru" : "en"]}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={onOpenWizard}
                className="w-full flex items-center justify-center transition-all duration-150 active:scale-[0.97]"
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: plan.featured ? "var(--tx)" : "var(--surface-3)",
                  color: plan.featured ? "var(--bg)" : "var(--tx)",
                  fontSize: 14,
                  fontWeight: 600,
                  border: plan.featured ? "none" : "1px solid var(--bd)",
                  cursor: "pointer",
                }}
              >
                {plan.cta[ru ? "ru" : "en"]}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
