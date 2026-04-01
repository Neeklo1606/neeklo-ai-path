import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useState, useRef } from "react";
import HolographicCard from "@/components/ui/holographic-card";
import Footer from "@/components/Footer";
import TelegramManagerButton from "@/components/TelegramManagerButton";
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
const HowSection = () => {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#F0EEE8", padding: "72px 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <h2 className="font-heading mb-10 animate-fade-in" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }}>
          Как это работает
        </h2>

        <div className="flex flex-col gap-6 md:gap-0 md:flex-row md:justify-between relative">
          <div className="hidden md:block absolute left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] border-t-2 border-dashed border-[#D0CCC4]" style={{ top: 24 }} />

          {steps.map((s, i) => (
            <div
              key={s.num}
              className="flex items-start gap-5 md:flex-col md:items-center md:text-center md:flex-1 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
              onClick={() => navigate("/chat")}
            >
              <span
                className="font-heading flex-shrink-0 select-none transition-colors duration-200 group-hover:text-[#0D0D0B]"
                style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: "#D0CCC4", letterSpacing: "-0.02em" }}
              >
                {s.num}
              </span>
              <div className="pt-1 md:pt-0 md:mt-2">
                <p className="font-body group-hover:text-[#0052FF] transition-colors duration-200" style={{ fontSize: 17, fontWeight: 700, color: "#0D0D0B" }}>
                  {s.title}
                </p>
                <p className="font-body mt-1 md:max-w-[240px]" style={{ fontSize: 14, color: "#6A6860", lineHeight: 1.55 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-10 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <span style={{ color: "#00C853", fontSize: 18 }}>✓</span>
          <span className="font-body" style={{ fontSize: 14, color: "#6A6860" }}>Первая консультация — бесплатно</span>
        </div>
      </div>
    </section>
  );
};

/* ━━━ CTA — 3-Step Feedback Form ━━━ */
const feedbackSteps = [
  { question: "Какой продукт вас интересует?", options: ["AI-ролик", "Сайт", "Mini App", "AI-агент", "Другое"] },
  { question: "Какой у вас бюджет?", options: ["до 50 000 ₽", "50–150 000 ₽", "150–500 000 ₽", "500 000+ ₽", "Не определился"] },
  { question: "Когда хотите начать?", options: ["Сейчас", "На этой неделе", "В этом месяце", "Пока присматриваюсь"] },
];

const CTASection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = step >= feedbackSteps.length;

  const handleSelect = (option: string) => {
    setAnswers([...answers, option]);
    setStep(step + 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <section style={{ background: "#0D0D0B", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mx-auto flex flex-col items-center text-center px-5 sm:px-10" style={{ maxWidth: 560 }}>
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="rounded-full flex-shrink-0 animate-pulse" style={{ width: 7, height: 7, background: "#00C853" }} />
          <span className="font-body uppercase" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
            Бесплатная консультация
          </span>
        </div>

        {!done ? (
          <>
            {/* Progress */}
            <div className="flex gap-2 mb-8 w-full" style={{ maxWidth: 200 }}>
              {feedbackSteps.map((_, i) => (
                <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: i < step ? "100%" : i === step ? "50%" : "0%", background: "#00C853" }}
                  />
                </div>
              ))}
            </div>

            <p className="font-body mb-2" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Шаг {step + 1} из {feedbackSteps.length}
            </p>

            <h2
              className="font-heading mb-8"
              style={{ fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.15, color: "#fff" }}
            >
              {feedbackSteps[step].question}
            </h2>

            <div className="flex flex-col gap-3 w-full">
              {feedbackSteps[step].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="font-body cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.12)] hover:-translate-y-[1px] active:scale-[0.98]"
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
                className="font-body mt-4 cursor-pointer transition-colors"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", background: "none", border: "none" }}
              >
                ← Назад
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center animate-fade-in">
            <div
              className="flex items-center justify-center rounded-full mb-5"
              style={{ width: 56, height: 56, background: "rgba(0,200,83,0.15)" }}
            >
              <span style={{ fontSize: 28 }}>🎉</span>
            </div>

            <h2
              className="font-heading mb-3"
              style={{ fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.15, color: "#fff" }}
            >
              Спасибо за ответы!
            </h2>

            <p className="font-body mb-6" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 360 }}>
              Присоединяйтесь к нашему Telegram-каналу — там кейсы, инсайты и спецпредложения
            </p>

            <a
              href="https://t.me/neekloai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-body cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-[0.97]"
              style={{ background: "#fff", color: "#0D0D0B", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}
            >
              Открыть Telegram-канал
              <ArrowRight size={16} />
            </a>

            <button
              onClick={() => navigate("/chat")}
              className="font-body mt-3 cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(255,255,255,0.4)]"
              style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500 }}
            >
              Написать в чат
            </button>

            <button
              onClick={handleReset}
              className="font-body mt-4 cursor-pointer hover:text-white transition-colors"
              style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", background: "none", border: "none" }}
            >
              Пройти заново
            </button>
          </div>
        )}

        {/* Trust row */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-10">
          <div className="flex items-center gap-1.5">
            <span className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>120+</span>
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
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
