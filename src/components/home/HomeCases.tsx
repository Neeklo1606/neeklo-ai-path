import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cases, type CaseData } from "@/data/cases";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = { lang: string };

export default function HomeCases({ lang }: Props) {
  const ru = lang === "ru";
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);

  const close = useCallback(() => setActiveCase(null), []);

  useEffect(() => {
    if (!activeCase) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeCase, close]);

  useEffect(() => {
    document.body.style.overflow = activeCase ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeCase]);

  return (
    <section id="cases" style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="flex items-end justify-between mb-6 md:mb-8"
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 4, textTransform: "uppercase" }}>
              {ru ? "Кейсы" : "Cases"}
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
              {ru ? "Наши работы" : "Our work"}
            </h2>
          </div>
          <Link
            to="/cases"
            className="flex items-center gap-1 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-muted)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-muted)"; }}
          >
            {ru ? "Все кейсы" : "All cases"}
            <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
          {cases.slice(0, 3).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.38, ease, delay: i * 0.05 }}
            >
              <CaseCard item={c} onOpenModal={setActiveCase} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case preview modal */}
      <AnimatePresence>
        {activeCase && (
          <CaseModal case_={activeCase} onClose={close} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Case Card ────────────────────────────────────────────────────────────────

function CaseCard({ item, onOpenModal }: { item: CaseData; onOpenModal: (c: CaseData) => void }) {
  const isExternal = !!item.url;

  const content = (
    <>
      {/* Image area */}
      <div
        className={`relative overflow-hidden aspect-video bg-gradient-to-br ${item.color}`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", letterSpacing: "0.08em", fontWeight: 600 }}>
              {item.badge}
            </span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span style={{
            padding: "3px 10px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            backdropFilter: "blur(4px)",
          }}>
            {item.badge}
          </span>
        </div>

        {/* Indicator */}
        <div
          className="absolute top-3 right-3 flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            color: "#fff",
          }}
        >
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--tx)", marginBottom: 4, lineHeight: 1.3 }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--tx-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          {item.subtitle}
        </p>

        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 14 }}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "2px 8px",
                borderRadius: 9999,
                fontSize: 11,
                background: "var(--surface-2)",
                color: "var(--tx-faint)",
                border: "1px solid var(--bd)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="flex items-center"
          style={{ paddingTop: 12, borderTop: "1px solid var(--bd)" }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ac-b)" }}>
            ↑ {item.metric}
          </span>
        </div>
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--bd)",
    textDecoration: "none",
  };

  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "var(--bd-hover)";
    el.style.boxShadow = "var(--shadow-card-hover)";
  };
  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "var(--bd)";
    el.style.boxShadow = "none";
  };

  if (isExternal) {
    return (
      <a
        href={item.url!}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-2xl overflow-hidden group transition-all duration-200 cursor-pointer flex flex-col"
        style={cardStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenModal(item)}
      className="rounded-2xl overflow-hidden group transition-all duration-200 cursor-pointer flex flex-col w-full text-left"
      style={cardStyle}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
      {content}
    </button>
  );
}

// ─── Case Modal ───────────────────────────────────────────────────────────────

function CaseModal({ case_: c, onClose }: { case_: CaseData; onClose: () => void }) {
  const navigate = useNavigate();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const handleCTA = () => {
    onClose();
    navigate("/brief");
  };

  const modalContent = (
    <div>
      {/* Drag handle (mobile) */}
      {isMobile && (
        <div style={{ width: 40, height: 4, background: "var(--bd)", borderRadius: 9999, margin: "0 auto 20px" }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-3">
          <span style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "2px 10px",
            borderRadius: 6,
            background: "var(--surface-2)",
            color: "var(--tx-faint)",
            border: "1px solid var(--bd)",
            marginBottom: 8,
          }}>
            {c.badge}
          </span>
          <h3 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--tx)", lineHeight: 1.2 }}>
            {c.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--bd)",
            cursor: "pointer",
          }}
          aria-label="Закрыть"
        >
          <X size={16} color="var(--tx-muted)" strokeWidth={2} />
        </button>
      </div>

      {/* Subtitle */}
      <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6, marginBottom: 16 }}>
        {c.subtitle}
      </p>

      {/* Preview */}
      <div
        className={`aspect-video rounded-[14px] flex items-center justify-center mb-4 overflow-hidden border border-[var(--bd)] bg-gradient-to-br ${c.color}`}
      >
        {c.image ? (
          <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", fontWeight: 600, letterSpacing: "0.08em" }}>{c.badge}</span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {c.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 9999,
              background: "var(--surface-2)",
              color: "var(--tx-faint)",
              border: "1px solid var(--bd)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Metric */}
      <div style={{
        padding: "12px 16px",
        borderRadius: 12,
        background: "var(--surface-2)",
        border: "1px solid var(--bd)",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--ac-b)",
        marginBottom: 20,
      }}>
        ↑ {c.metric}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleCTA}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold"
        style={{ minHeight: 44 }}
      >
        Обсудить похожий проект
      </button>
    </div>
  );

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
          {modalContent}
        </motion.div>
      ) : (
        <div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "20px",
        }}>
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
            {modalContent}
          </motion.div>
        </div>
      )}
    </>,
    document.body
  );
}
