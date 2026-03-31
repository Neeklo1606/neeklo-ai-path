import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useState, useRef } from "react";
import HolographicCard from "@/components/ui/holographic-card";
import Footer from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";
import workAssistant from "@/assets/work-assistant.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";
import workFashion from "@/assets/work-fashion.webp";
import workRacing from "@/assets/work-racing.webp";
import workStudio from "@/assets/work-studio.webp";
import workVision from "@/assets/work-vision.webp";
import iconVideo from "@/assets/icon-video.png";
import iconWeb from "@/assets/icon-web.png";
import iconApp from "@/assets/icon-app.png";
import iconAi from "@/assets/icon-ai.png";
import iconDesign from "@/assets/icon-design.png";
import iconAnalytics from "@/assets/icon-analytics.png";

/* ─── animation helpers ─── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease, delay },
});

/* ─── static data ─── */
const services = [
  { icon: iconVideo, name: "AI-ролики", price: "от 25 000 ₽", badge: "ХИТ", badgeColor: "#0D0D0B" },
  { icon: iconWeb, name: "Сайты", price: "от 95 000 ₽" },
  { icon: iconApp, name: "Mini App", price: "от 65 000 ₽" },
  { icon: iconAi, name: "AI-агенты", price: "от 150 000 ₽", badge: "ТОП", badgeColor: "#0D0D0B" },
  { icon: iconDesign, name: "Дизайн", price: "от 30 000 ₽" },
  { icon: iconAnalytics, name: "Аналитика", price: "от 40 000 ₽" },
];

const portfolioItems = [
  { id: 1, cat: "AI-видео", title: "Имиджевый ролик", result: "+40% узнаваемость", bg: "linear-gradient(135deg,#1a1a2e,#16213e)", img: workFashion, featured: true },
  { id: 2, cat: "Сайт", title: "Лендинг студии", result: "+60% заявок", bg: "linear-gradient(135deg,#0f3460,#533483)", img: workStudio },
  { id: 3, cat: "AI-видео", title: "Промо для бренда", result: "2M просмотров", bg: "linear-gradient(135deg,#1a0a0a,#3d1515)", img: workRacing },
  { id: 4, cat: "Mini App", title: "Vision AI App", result: "50K пользователей", bg: "linear-gradient(135deg,#0d0d0d,#1a1a2a)", img: workVision },
  { id: 5, cat: "Сайты", title: "Интернет-магазин", result: "+120% конверсия", bg: "linear-gradient(135deg,#0a1628,#1e3a5f)", img: workEcommerce },
  { id: 6, cat: "AI", title: "AI-ассистент", result: "80% автоматизация", bg: "linear-gradient(135deg,#0a0a0a,#2d2d2d)", img: workAssistant },
];

const filters = ["Все", "AI-видео", "Сайт", "Mini App", "AI"];

const steps = [
  { num: "01", title: "Опиши задачу", desc: "Напиши в чат – AI задаст уточняющие вопросы" },
  { num: "02", title: "AI собирает бриф", desc: "Формирует ТЗ, срок и предварительную стоимость" },
  { num: "03", title: "Менеджер берёт в работу", desc: "Обсуждаете детали, подписываете, стартуем" },
];



const Divider = () => <div className="w-full" style={{ height: 1, background: "#E8E6E0" }} />;

/* ━━━ MAIN PAGE ━━━ */
const LandingPage = () => {
  const navigate = useNavigate();
  usePageTitle("neeklo – AI-продакшн студия");

  return (
    <div className="flex-1 bg-background text-foreground pb-[100px] sm:pb-0 overflow-x-hidden">
      <HeroSection navigate={navigate} />
      <Divider />
      <ServicesSection navigate={navigate} />
      <Divider />
      <WorksSection />
      <Divider />
      <HowSection />
      <CTASection navigate={navigate} />
      <Footer />
    </div>
  );
};

/* ━━━ HERO ━━━ */
const HeroSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width:768px)").matches;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18 });
  const eyeX = useTransform(springX, [-400, 400], [-7, 7]);
  const eyeY = useTransform(springY, [-400, 400], [-5, 5]);

  const handleMouse = isMobile ? undefined : (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  };
  const handleMouseLeave = isMobile ? undefined : () => { mouseX.set(0); mouseY.set(0); };

  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        background: "#F0EEE8",
        minHeight: "100vh",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative z-10 flex flex-col items-center px-5 sm:px-8" style={{ maxWidth: 640 }}>
        {/* Orb */}
        <motion.div
          className="relative mb-8"
          style={{ width: 96, height: 96, flexShrink: 0 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "relative", width: 96, height: 96 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ inset: -6, zIndex: 0, background: "radial-gradient(circle, rgba(0,0,0,0.12) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main sphere */}
            <div
              className="rounded-full"
              style={{
                width: 96, height: 96, position: "relative", zIndex: 1, overflow: "hidden",
                background: "radial-gradient(circle at 35% 35%, #3a3a3a 0%, #1a1a1a 40%, #0a0a0a 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.3), inset 0 -8px 20px rgba(0,0,0,0.5), inset 0 8px 16px rgba(255,255,255,0.06), inset 2px 3px 8px rgba(255,255,255,0.04)",
              }}
            >
              {/* Top-left shine */}
              <div className="absolute pointer-events-none" style={{ top: 12, left: 16, width: 30, height: 20, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)", transform: "rotate(-25deg)" }} />
              {/* Secondary shine */}
              <div className="absolute pointer-events-none" style={{ top: 18, right: 20, width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              {/* Bottom rim light */}
              <div className="absolute pointer-events-none" style={{ bottom: 8, left: "50%", transform: "translateX(-50%)", width: 60, height: 20, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />

              {/* Face */}
              <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -46%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 2 }}>
                {/* Eyes */}
                <motion.div className="flex items-center" style={{ gap: 9, x: eyeX, y: eyeY }}>
                  <motion.div className="rounded-full" style={{ width: 8, height: 8, background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.3)" }} animate={{ scaleY: [1, 1, 0.05, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.42, 0.48, 0.54, 1] }} />
                  <motion.div className="rounded-full" style={{ width: 8, height: 8, background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.3)" }} animate={{ scaleY: [1, 1, 0.05, 1, 1] }} transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.42, 0.48, 0.54, 1], delay: 0.08 }} />
                </motion.div>
                {/* Smile */}
                <div style={{ width: 14, height: 6, borderBottom: "2px solid rgba(255,255,255,0.3)", borderRadius: "0 0 8px 8px", marginTop: 2 }} />
              </div>
            </div>

            {/* Status dot */}
            <div className="absolute" style={{ bottom: 2, right: 2, width: 16, height: 16, zIndex: 10 }}>
              {/* Pulse ring */}
              <motion.div
                className="absolute rounded-full"
                style={{ inset: -3, background: "rgba(0,200,83,0.3)" }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="rounded-full" style={{ width: 16, height: 16, background: "radial-gradient(circle at 40% 35%, #4dff91 0%, #00C853 60%, #009940 100%)", border: "3px solid #F0EEE8", boxShadow: "0 0 10px rgba(0,200,83,0.7), 0 0 20px rgba(0,200,83,0.3)", position: "relative", zIndex: 1 }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Label */}
        <motion.p
          className="font-body tracking-wide"
          style={{ fontSize: 13, color: "#6A6860", marginBottom: 20 }}
          {...fadeUp(0.08)}
        >
          AI-продакшн студия
        </motion.p>

        {/* H1 */}
        <motion.div {...fadeUp(0.18)}>
          <h1
            className="font-heading"
            style={{ fontWeight: 800, fontSize: "clamp(38px,5vw,68px)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "#0D0D0B" }}
          >
            От идеи до результата
          </h1>
          <p
            className="font-heading"
            style={{ fontWeight: 700, fontSize: "clamp(26px,3.5vw,48px)", color: "#6A6860", marginTop: 4, lineHeight: 1.02, letterSpacing: "-0.03em" }}
          >
            за 48 часов
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-body"
          style={{ fontSize: 16, color: "#6A6860", lineHeight: 1.65, marginTop: 16, maxWidth: 360 }}
          {...fadeUp(0.28)}
        >
          Сайты, Mini App, AI-агенты и видео
        </motion.p>

        {/* CTA */}
        <motion.div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-8" {...fadeUp(0.4)}>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
            style={{ fontSize: 15, fontWeight: 600, padding: "14px 28px", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 14 }}
          >
            Заказать проект →
          </button>
          <button
            onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}
            className="font-body cursor-pointer hover:text-foreground transition-colors"
            style={{ fontSize: 14, fontWeight: 500, padding: "13px 16px", background: "transparent", color: "#6A6860", border: "none" }}
          >
            Смотреть работы
          </button>
        </motion.div>

      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={22} color="#B0ADA8" />
      </motion.div>
    </section>
  );
};

/* ━━━ SERVICES ━━━ */
const ServicesSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => (
  <section className="bg-white" style={{ padding: "48px 20px" }}>
    <div className="max-w-[1280px] mx-auto md:px-10">
      <motion.h2 className="font-heading" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>Продукты</motion.h2>

      <div className="grid grid-cols-3 md:grid-cols-6 mt-6" style={{ gap: 10 }}>
        {services.map((s, i) => (
          <motion.div
            key={s.name}
            className="relative flex flex-col items-center text-center cursor-pointer hover:-translate-y-[3px] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            style={{ background: "#F7F6F3", borderRadius: 16, padding: "20px 8px 16px" }}
            onClick={() => navigate("/chat")}
            {...fadeUp(i * 0.05)}
          >
            {/* Icon */}
            <div className="relative">
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{ width: 56, height: 56, background: "#EDECE8" }}
              >
                <img src={s.icon} alt={s.name} className="w-7 h-7 object-contain" style={{ imageRendering: "pixelated" }} />
              </div>
              {s.badge && (
                <span
                  className="absolute -top-1.5 -right-3 font-body text-white"
                  style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: s.badgeColor }}
                >
                  {s.badge}
                </span>
              )}
            </div>
            <p className="font-heading mt-3" style={{ fontSize: 13, fontWeight: 700, color: "#0D0D0B" }}>{s.name}</p>
            <p className="font-body mt-1" style={{ fontSize: 12, color: "#8A8880" }}>{s.price}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ━━━ WORKS ━━━ */
const WorksSection = () => {
  const [filter, setFilter] = useState("Все");
  const items = filter === "Все" ? portfolioItems : portfolioItems.filter((p) => p.cat === filter);

  return (
    <section id="works" className="bg-white" style={{ padding: "72px 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="mb-2">
          <motion.h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800 }} {...fadeUp(0)}>Наши работы</motion.h2>
        </div>

        {/* Filter pills */}
        <motion.div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide" {...fadeUp(0.08)}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-body whitespace-nowrap rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0"
              style={{
                fontSize: 13, fontWeight: 600, padding: "7px 16px",
                background: filter === f ? "#0D0D0B" : "transparent",
                color: filter === f ? "#fff" : "#6A6860",
                border: filter === f ? "1px solid #0D0D0B" : "1px solid #E0E0E0",
              }}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className={item.featured ? "col-span-2 md:col-span-2" : ""}
              {...fadeUp(i * 0.07)}
            >
              <HolographicCard className={`rounded-2xl overflow-hidden relative cursor-pointer ${item.featured ? "" : ""}`}>
                <div
                  className="relative w-full"
                  style={{ height: item.featured ? 280 : 200, background: item.bg }}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-4"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)" }}
                  >
                    <span
                      className="font-body rounded-full inline-block"
                      style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff" }}
                    >
                      {item.cat}
                    </span>
                    <p className="font-body text-white mt-1.5" style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</p>
                  </div>
                </div>
              </HolographicCard>
              <p className="font-body mt-1.5" style={{ fontSize: 13, fontWeight: 600, color: "#0052FF" }}>{item.result}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ━━━ HOW IT WORKS ━━━ */
const HowSection = () => (
  <section style={{ background: "#F0EEE8", padding: "72px 0" }}>
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
      <motion.h2 className="font-heading mb-10" style={{ fontSize: 32, fontWeight: 800 }} {...fadeUp(0)}>Как это работает</motion.h2>

      {/* Steps with dashed connector */}
      <div className="flex flex-col md:flex-row items-start md:items-start justify-between relative gap-10 md:gap-0">
        {steps.map((s, i) => (
          <motion.div key={s.num} className="flex-1 flex flex-col items-center text-center relative" {...fadeUp(i * 0.1)}>
            <div
              className="flex items-center justify-center rounded-full font-heading bg-[#F0EEE8] relative z-10"
              style={{ width: 48, height: 48, border: "2px solid #0D0D0B", fontSize: 16, fontWeight: 700 }}
            >
              {s.num}
            </div>
            <p className="font-body mt-4" style={{ fontSize: 16, fontWeight: 700 }}>{s.title}</p>
            <p className="font-body mt-2 max-w-[240px]" style={{ fontSize: 14, color: "#6A6860" }}>{s.desc}</p>
          </motion.div>
        ))}
        <div className="hidden md:block absolute left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] border-t-2 border-dashed border-[#D0CCC4]" style={{ top: 24 }} />
      </div>
    </div>
  </section>
);

/* ━━━ AVITO REVIEWS ━━━ */
const avitoReviews = [
  { name: "Алексей М.", rating: 5, date: "12 мар 2026", text: "Заказывали лендинг для автосервиса. Сделали за 5 дней, всё чётко по ТЗ. Конверсия выросла в 2 раза. Рекомендую!", avatar: "АМ" },
  { name: "Марина К.", rating: 5, date: "28 фев 2026", text: "AI-ролики для нашего Instagram — просто огонь! Охваты выросли на 40%. Быстро, качественно и по адекватной цене.", avatar: "МК" },
  { name: "Дмитрий В.", rating: 5, date: "15 фев 2026", text: "Telegram Mini App для записи клиентов. Работает идеально, клиенты довольны. Поддержка отвечает моментально.", avatar: "ДВ" },
  { name: "Екатерина С.", rating: 5, date: "3 фев 2026", text: "AI-агент для обработки заявок — лучшее вложение. Автоматизировали 80% рутины, менеджеры теперь занимаются продажами.", avatar: "ЕС" },
  { name: "Игорь П.", rating: 5, date: "20 янв 2026", text: "Второй раз обращаемся за роликами. Качество на уровне студии, а цена в разы ниже. Сроки всегда соблюдают.", avatar: "ИП" },
  { name: "Ольга Н.", rating: 4, date: "10 янв 2026", text: "Сайт получился стильный и быстрый. Единственное — хотелось бы чуть больше правок в рамках пакета. В остальном — отлично!", avatar: "ОН" },
];

const AvitoReviewsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <section style={{ background: "#fff", padding: "72px 0 80px" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <motion.div className="flex items-center justify-between mb-8" {...fadeUp(0)}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800 }}>Отзывы клиентов</h2>
              <span
                className="inline-flex items-center gap-1.5 rounded-full font-body"
                style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, background: "#00AAFF15", color: "#0078D4", border: "1px solid #00AAFF30" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#0078D4"/></svg>
                Авито
              </span>
            </div>
            <p className="font-body" style={{ fontSize: 14, color: "#6A6860" }}>Реальные отзывы с Авито · рейтинг 5.0</p>
          </div>
          <a
            href="https://www.avito.ru/brands/i104436874"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 font-body transition-all duration-200 hover:-translate-y-[1px]"
            style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B", border: "1px solid #E0E0E0", borderRadius: 12, padding: "10px 20px" }}
          >
            Все отзывы на Авито
            <ArrowRight size={14} />
          </a>
        </motion.div>

        {/* Scrollable cards */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 sm:-mx-8 sm:px-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {avitoReviews.map((r, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 snap-start"
              style={{ width: 320 }}
              {...fadeUp(i * 0.08)}
            >
              <div
                className="h-full flex flex-col p-5 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "#F9F9F9", borderRadius: 20, border: "1px solid #F0F0F0" }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full font-heading"
                    style={{ width: 40, height: 40, background: "#0D0D0B", color: "#fff", fontSize: 13, fontWeight: 700 }}
                  >
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body truncate" style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B" }}>{r.name}</p>
                    <p className="font-body" style={{ fontSize: 12, color: "#B0B0B0" }}>{r.date}</p>
                  </div>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={j < r.rating ? "#F5A623" : "#E0E0E0"} />
                    </svg>
                  ))}
                </div>
                {/* Text */}
                <p className="font-body flex-1" style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 1.6 }}>{r.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-4 flex justify-center">
          <a
            href="https://www.avito.ru/brands/i104436874"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-body"
            style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B", border: "1px solid #E0E0E0", borderRadius: 12, padding: "10px 20px" }}
          >
            Все отзывы на Авито
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

/* ━━━ CTA ━━━ */
const CTASection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const anim = (delay: number, y = 0) => ({
    initial: { opacity: 0, y },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: y ? 0.5 : 0.4, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section ref={ref} style={{ background: "#0D0D0B", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mx-auto flex flex-col items-center text-center px-5 sm:px-10" style={{ maxWidth: 760 }}>
        {/* Label */}
        <motion.div className="inline-flex items-center gap-2 mb-4" {...anim(0)}>
          <span className="rounded-full flex-shrink-0 animate-pulse" style={{ width: 7, height: 7, background: "#00C853" }} />
          <span className="font-body uppercase" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
            Первая консультация – бесплатно
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-heading"
          style={{ fontWeight: 800, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff" }}
          {...anim(0.1, 20)}
        >
          Начнём работу сегодня?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="font-body mt-5 mx-auto"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 420 }}
          {...anim(0.2)}
        >
          Опиши задачу в чат – AI соберёт бриф и подберёт решение за 5 минут
        </motion.p>

        {/* Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-3 mt-9 w-full sm:w-auto" {...anim(0.3, 12)}>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-[0.97]"
            style={{ background: "#fff", color: "#0D0D0B", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none" }}
          >
            Написать в чат
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/works")}
            className="font-body cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(255,255,255,0.4)]"
            style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500 }}
          >
            Смотреть работы
          </button>
        </motion.div>

        {/* Trust row */}
        <motion.div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-8" {...anim(0.4)}>
          <div className="flex items-center gap-1.5">
            <span className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>47+</span>
            <span className="font-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>клиентов</span>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#F5A623", fontSize: 13 }}>★</span>
            <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>4.9/5</span>
            <span className="font-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>рейтинг</span>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-1.5">
            <span className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>48ч</span>
            <span className="font-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>средний срок</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPage;
