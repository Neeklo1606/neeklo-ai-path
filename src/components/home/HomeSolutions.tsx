import { motion } from "framer-motion";
import { SolutionGrid } from "./SolutionGrid";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = { lang: string };

export default function HomeSolutions({ lang }: Props) {
  const ru = lang === "ru";

  return (
    <section id="solutions" style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
              {ru ? "Решения" : "Solutions"}
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
              {ru ? "С какой задачей пришли?" : "What problem are you solving?"}
            </h2>
          </div>
        </motion.div>

        <SolutionGrid />
      </div>
    </section>
  );
}
