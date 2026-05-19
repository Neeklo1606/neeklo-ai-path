import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { NEWS } from "@/data/news";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = { lang: string };

export default function HomeNews({ lang }: Props) {
  const ru = lang === "ru";
  const items = NEWS.slice(0, 5);

  return (
    <section style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="flex items-end justify-between mb-5"
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 4, textTransform: "uppercase" }}>
              {ru ? "Блог" : "Blog"}
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
              {ru ? "Статьи" : "Articles"}
            </h2>
          </div>
          <Link
            to="/blog"
            className="flex items-center gap-1 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-muted)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-muted)"; }}
          >
            {ru ? "Блог" : "Blog"}
            <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--bd)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {items.map((item, i) => (
            <div key={item.slug}>
              <a
                href={item.href}
                className="flex items-start gap-3 group"
                style={{
                  padding: "14px 16px",
                  textDecoration: "none",
                  display: "flex",
                  transition: "background 0.15s",
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                {/* Category badge */}
                <span
                  className="shrink-0 mt-0.5"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "var(--surface-2)",
                    color: "var(--tx-faint)",
                    border: "1px solid var(--bd)",
                    whiteSpace: "nowrap",
                    lineHeight: 1.8,
                  }}
                >
                  {item.category}
                </span>

                {/* Title */}
                <span
                  className="flex-1"
                  style={{
                    fontSize: 14,
                    color: "var(--tx)",
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.title}
                </span>

                {/* Date */}
                <span
                  className="shrink-0 mt-0.5 text-right"
                  style={{
                    fontSize: 11,
                    color: "var(--tx-faint)",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {item.date}
                </span>
              </a>

              {/* Divider — not after last */}
              {i < items.length - 1 && (
                <hr style={{ margin: 0, border: "none", borderTop: "1px solid var(--bd)" }} />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
