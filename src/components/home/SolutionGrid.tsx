import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Globe, Video, CalendarCheck, TrendingUp, Bot, Smartphone,
  ArrowUpRight, Send, Code2,
} from "lucide-react";
import { solutions, type Solution } from "@/data/solutions";

const ease = [0.16, 1, 0.3, 1] as const;

const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Video, CalendarCheck, TrendingUp, Bot, Smartphone, Send, Code2,
};

// ─── Grid ──────────────────────────────────────────────────────────────────────

export function SolutionGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {solutions.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.38, ease, delay: i * 0.04 }}
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
      className={`w-full text-left flex flex-col gap-3 transition-all duration-200 ${s.bg}`}
      style={{ padding: "16px", borderRadius: 16, border: "1px solid var(--bd)", cursor: "pointer", minHeight: 44 }}
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
      <div className="flex items-start justify-between">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color="var(--tx-muted)" strokeWidth={1.8} />
        </div>
        <ArrowUpRight size={15} color="var(--tx-faint)" strokeWidth={1.8} />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", lineHeight: 1.3 }}>{s.title}</h3>
          {s.badge && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ac-b)]/10 text-[var(--ac-b)]"
              style={{ whiteSpace: "nowrap", lineHeight: 1.6 }}
            >
              {s.badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>{s.description}</p>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {s.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sf-2)] text-[var(--tx-2)] border border-[var(--bd)]"
            style={{ lineHeight: 1.6 }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--bd)" }}>
        <p style={{ fontSize: 12, color: "var(--tx-muted)", lineHeight: 1 }}>
          <span style={{ fontWeight: 600 }}>{s.price}</span>
          <span style={{ color: "var(--tx-faint)" }}> · {s.duration}</span>
        </p>
      </div>
    </button>
  );
}
