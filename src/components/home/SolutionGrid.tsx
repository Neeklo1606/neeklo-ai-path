import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Globe, Video, Bot, ArrowRight } from "lucide-react";
import { solutions, type Solution } from "@/data/solutions";

const ease = [0.16, 1, 0.3, 1] as const;

const ICON_MAP: Record<string, React.ElementType> = { Globe, Video, Bot };

// ─── Grid ──────────────────────────────────────────────────────────────────────

export function SolutionGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {solutions.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.42, ease, delay: i * 0.08 }}
        >
          <SolutionCard s={s} onOpen={() => navigate(s.href)} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export function SolutionCard({ s, onOpen }: { s: Solution; onOpen: () => void }) {
  const Icon = ICON_MAP[s.icon] ?? Globe;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left flex flex-col gap-4 group"
      style={{
        padding: "20px",
        borderRadius: 20,
        border: "1px solid var(--bd)",
        background: "var(--surface)",
        cursor: "pointer",
        minHeight: 220,
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = s.accentColor + "66";
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = `0 8px 32px ${s.accentColor}18`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--bd)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: s.accentColor + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} style={{ color: s.accentColor }} strokeWidth={1.8} />
        </div>
        {s.badge && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: s.accentColor + "18",
              color: s.accentColor,
              whiteSpace: "nowrap",
              lineHeight: 1.8,
            }}
          >
            {s.badge}
          </span>
        )}
      </div>

      {/* Title & subtitle */}
      <div className="flex-1">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--tx)", lineHeight: 1.25, marginBottom: 2 }}>
          {s.title}
        </h3>
        <p style={{ fontSize: 12, color: s.accentColor, fontWeight: 500, marginBottom: 8 }}>
          {s.subtitle}
        </p>
        <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.5 }}>
          {s.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {s.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 99,
              background: "var(--surface-2)",
              color: "var(--tx-muted)",
              border: "1px solid var(--bd)",
              lineHeight: 1.8,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Price + CTA */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--bd)" }}
      >
        <p style={{ fontSize: 13, lineHeight: 1 }}>
          <span style={{ fontWeight: 700, color: "var(--tx)" }}>{s.price}</span>
          <span style={{ color: "var(--tx-faint)", marginLeft: 4 }}>· {s.duration}</span>
        </p>
        <div
          className="flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
          style={{ fontSize: 12, fontWeight: 600, color: s.accentColor }}
        >
          Подробнее <ArrowRight size={13} />
        </div>
      </div>
    </button>
  );
}
