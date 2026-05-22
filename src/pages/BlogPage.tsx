import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";
import { news } from "@/data/news";

const ease = [0.16, 1, 0.3, 1] as const;

export default function BlogPage() {
  usePageMeta({
    title: "Блог — neeklo",
    description: "Статьи о сайтах, AI-ассистентах, Telegram-ботах и автоматизации бизнеса.",
  });

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-12 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 6 }}>
            БЛОГ
          </p>
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{ fontFamily: "'Onest', sans-serif", letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 6 }}
          >
            Статьи
          </h1>
          <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6 }}>
            О сайтах, AI-ассистентах и автоматизации для бизнеса.
          </p>
        </motion.div>

        {/* Article list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.1 }}
          className="flex flex-col divide-y divide-[var(--bd)] mt-8"
        >
          {news.map((item) => (
            <a
              key={item.slug}
              href={`/blog/${item.slug}`}
              className="flex items-center gap-3 py-3.5 hover:bg-[var(--sf)] rounded-lg px-2 -mx-2 transition-colors group"
              style={{ textDecoration: "none" }}
            >
              {/* Category badge */}
              <span
                className="shrink-0 text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[var(--sf-2)] text-[var(--tx-2)] whitespace-nowrap"
              >
                {item.category}
              </span>

              {/* Title */}
              <span
                className="flex-1 text-[14px] text-[var(--tx)] leading-snug group-hover:text-[var(--ac-b)] transition-colors line-clamp-2"
              >
                {item.title}
              </span>

              {/* Date */}
              <span className="shrink-0 text-[11px] text-[var(--tx-2)] whitespace-nowrap">
                {item.date}
              </span>
            </a>
          ))}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
