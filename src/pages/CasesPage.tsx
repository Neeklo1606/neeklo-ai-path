import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";
import { cases } from "@/data/cases";

const ease = [0.16, 1, 0.3, 1] as const;

const ALL = "Все";

export default function CasesPage() {
  usePageMeta({
    title: "Наши работы — neeklo",
    description: "Кейсы neeklo: платформы, Telegram Mini App, AI-ассистенты и автоматизация для бизнеса.",
  });
  const categories = [ALL, ...Array.from(new Set(cases.map((c) => c.category)))];
  const [activeCategory, setActiveCategory] = useState(ALL);
  const filtered = activeCategory === ALL ? cases : cases.filter((c) => c.category === activeCategory);

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 6 }}>
            КЕЙСЫ
          </p>
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{ fontFamily: "'Onest', sans-serif", letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 6 }}
          >
            Наши работы
          </h1>
          <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6 }}>
            44+ проектов в области сайтов, AI, Telegram и автоматизации.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease, delay: 0.1 }}
          className="flex flex-wrap gap-2 mt-6 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={[
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-[var(--tx)] text-[var(--bg)]"
                  : "border border-[var(--bd)] text-[var(--tx-2)] hover:border-[var(--bd-hover)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease, delay: i * 0.04 }}
            >
              <CaseCard item={c} />
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

import type { CaseData } from "@/data/cases";

function CaseCard({ item }: { item: CaseData }) {
  const cardContent = (
    <>
      {/* Image area */}
      <div className={`relative aspect-video bg-gradient-to-br ${item.color} overflow-hidden`}>
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Badge top-left */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-semibold bg-black/30 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm">
            {item.badge}
          </span>
        </div>

        {/* External link top-right */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <ArrowUpRight size={14} className="text-white" strokeWidth={2} />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-[15px] text-[var(--tx)]"
          style={{ fontFamily: "'Onest', sans-serif", lineHeight: 1.3 }}
        >
          {item.title}
        </h3>
        <p className="text-[13px] text-[var(--tx-2)] mt-1 leading-relaxed">{item.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sf-2)] text-[var(--tx-2)] border border-[var(--bd)]"
              style={{ lineHeight: 1.6 }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Metric */}
        <div className="mt-3 pt-3 border-t border-[var(--bd)]">
          <span className="text-[var(--ac-b)] text-[13px] font-semibold">↑ {item.metric}</span>
        </div>
      </div>
    </>
  );

  return item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl border border-[var(--bd)] overflow-hidden hover:border-[var(--bd-hover)] hover:shadow-lg transition-all duration-200 group flex flex-col"
      style={{ background: "var(--surface)", textDecoration: "none" }}
    >
      {cardContent}
    </a>
  ) : (
    <div
      className="rounded-2xl border border-[var(--bd)] overflow-hidden hover:border-[var(--bd-hover)] hover:shadow-lg transition-all duration-200 group flex flex-col"
      style={{ background: "var(--surface)" }}
    >
      {cardContent}
    </div>
  );
}
