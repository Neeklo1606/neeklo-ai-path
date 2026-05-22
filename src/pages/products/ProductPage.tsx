import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, ChevronRight,
  Globe, Video, Bot, Smartphone, Code2, Send,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBrief } from "@/context/BriefContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";
import { getProduct, type ProductData } from "@/data/products";

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Video, Bot, Smartphone, Code2, Send,
};

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Hero visual per product ─────────────────────────────────────────────────

function HeroVisual({ product }: { product: ProductData }) {
  const Icon = ICON_MAP[product.heroIcon] ?? Globe;
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[260px] md:min-h-[320px]">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 280, height: 280,
          background: "var(--ac-b)",
          filter: "blur(60px)",
        }}
      />
      {/* Inner card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="relative z-10 rounded-3xl p-8 flex flex-col items-center gap-4"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--bd)",
          boxShadow: "var(--shadow-modal)",
          minWidth: 200,
        }}
      >
        <div
          className={`rounded-2xl flex items-center justify-center ${product.heroAccent}`}
          style={{ width: 72, height: 72 }}
        >
          <Icon size={36} strokeWidth={1.5} color="white" />
        </div>
        <div className="text-center">
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--tx)", marginBottom: 2 }}>
            {product.price}
          </p>
          <p style={{ fontSize: 11, color: "var(--tx-faint)" }}>{product.duration}</p>
        </div>
        {/* Decorative dots */}
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6, height: 6,
                background: i === 0 ? "var(--ac-b)" : "var(--bd)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { open: openBrief } = useBrief();
  const product = getProduct(slug ?? "");

  usePageMeta({
    title: product?.seoTitle ?? "Продукт · neeklo",
    description: product?.seoDescription,
    og: { url: slug ? `/products/${slug}` : "/" },
  });

  if (!product) {
    navigate("/services", { replace: true });
    return null;
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      {/* ── BLOCK 1: HERO ─────────────────────────────────────────────────── */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 mb-6 flex-wrap"
            style={{ fontSize: 12, color: "var(--tx-faint)" }}
          >
            <Link to="/" style={{ color: "var(--tx-faint)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--tx)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--tx-faint)")}
            >Главная</Link>
            <ChevronRight size={12} />
            <Link to="/services" style={{ color: "var(--tx-faint)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--tx)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--tx-faint)")}
            >Услуги</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--tx-muted)" }}>{product.h1}</span>
          </motion.nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              {/* Meta label */}
              <p
                className="mb-4"
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--ac-b)",
                }}
              >
                {product.metaLabel}
              </p>

              {/* H1 */}
              <h1
                style={{
                  fontFamily: "'Onest', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(26px, 5vw, 46px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "var(--tx)",
                  marginBottom: 16,
                }}
              >
                {product.h1}
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: 16, color: "var(--tx-muted)", lineHeight: 1.6, marginBottom: 24 }}>
                {product.subtitle}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-8">
                <span
                  style={{
                    fontFamily: "'Onest', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(22px, 4vw, 32px)",
                    color: "var(--tx)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {product.price}
                </span>
                <span style={{ fontSize: 14, color: "var(--tx-faint)" }}>
                  · {product.duration}
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openBrief()}
                  className="btn-primary flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold"
                >
                  Обсудить проект
                  <ArrowRight size={15} strokeWidth={2.2} />
                </button>
              </div>
            </motion.div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              className="hidden md:flex items-center justify-center"
            >
              <HeroVisual product={product} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BLOCK 2: ДЛЯ КОГО ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionLabel>Аудитория</SectionLabel>
          <SectionTitle>Кому подойдёт</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {product.audience.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.38, ease, delay: i * 0.06 }}
                className="rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
              >
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>
                  {item.emoji}
                </span>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.3 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCK 3: ЧТО ВХОДИТ ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionLabel>Состав</SectionLabel>
          <SectionTitle>Что вы получите</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            {product.included.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, ease, delay: i * 0.04 }}
                className="flex gap-4 rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
              >
                <div
                  className="flex items-center justify-center shrink-0 rounded-full mt-0.5"
                  style={{ width: 24, height: 24, background: "var(--ac-b)", minWidth: 24 }}
                >
                  <Check size={13} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", marginBottom: 4, lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCK 4: РЕЗУЛЬТАТ ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ background: "var(--surface)", borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionLabel>Эффект</SectionLabel>
          <SectionTitle>Результат в цифрах</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {product.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, ease, delay: i * 0.1 }}
                className="text-center rounded-2xl py-8 px-6"
                style={{ background: "var(--bg)", border: "1px solid var(--bd)" }}
              >
                <p
                  style={{
                    fontFamily: "'Onest', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(28px, 5vw, 40px)",
                    letterSpacing: "-0.025em",
                    color: "var(--tx)",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.4 }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCK 5: КАК РАБОТАЕМ ────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionLabel>Процесс</SectionLabel>
          <SectionTitle>Как работаем</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {product.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.38, ease, delay: i * 0.08 }}
                className="flex md:flex-col gap-4 md:gap-3"
              >
                {/* Number */}
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 44, height: 44, minWidth: 44,
                    background: "var(--tx)", color: "var(--bg)",
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--tx)", marginBottom: 6 }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCK 6: СТОИМОСТЬ ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionLabel>Цена</SectionLabel>
          <SectionTitle>Стоимость</SectionTitle>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease }}
            className="mt-10 rounded-3xl p-8 md:p-10"
            style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
          >
            <p
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(32px, 6vw, 52px)",
                letterSpacing: "-0.025em",
                color: "var(--tx)",
                marginBottom: 16,
                lineHeight: 1,
              }}
            >
              {product.price}
            </p>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
              {product.pricingNote}
            </p>
            <button
              onClick={() => openBrief()}
              className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold"
            >
              Рассчитать стоимость
              <ArrowRight size={15} strokeWidth={2.2} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── BLOCK 7: FAQ ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <SectionLabel>Вопросы</SectionLabel>
          <SectionTitle>Частые вопросы</SectionTitle>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease }}
            className="mt-10"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {product.faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-2xl overflow-hidden border-0"
                  style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
                >
                  <AccordionTrigger
                    className="px-5 py-4 text-left hover:no-underline"
                    style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)" }}
                  >
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent
                    className="px-5 pb-4"
                    style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.7 }}
                  >
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── BLOCK 8: ФИНАЛЬНЫЙ CTA ────────────────────────────────────────── */}
      <section className="py-16 md:py-24" style={{ background: "var(--tx)" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease }}
          >
            <h2
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(24px, 5vw, 38px)",
                letterSpacing: "-0.025em",
                color: "var(--bg)",
                marginBottom: 12,
                lineHeight: 1.1,
              }}
            >
              Готовы начать?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 36, lineHeight: 1.6 }}>
              Отвечаем в течение 2 часов. Без оплаты на старте.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => openBrief()}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-opacity duration-150 hover:opacity-85"
                style={{ background: "var(--bg)", color: "var(--tx)" }}
              >
                Начать проект
                <ArrowRight size={15} strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Small shared primitives ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Onest', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(22px, 4vw, 32px)",
        letterSpacing: "-0.02em",
        color: "var(--tx)",
        lineHeight: 1.15,
      }}
    >
      {children}
    </h2>
  );
}
