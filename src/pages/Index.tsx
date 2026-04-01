import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import mascotImg from "@/assets/mascot.png";
import HolographicCard from "@/components/ui/holographic-card";
import Footer from "@/components/Footer";
import TelegramManagerButton from "@/components/TelegramManagerButton";
import { usePageTitle } from "@/hooks/usePageTitle";

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
  { emoji: "🎬", name: "AI-ролики", price: "от 25 000 ₽", badge: "ХИТ" },
  { emoji: "🌐", name: "Сайт под ключ", price: "от 95 000 ₽" },
  { emoji: "📱", name: "Telegram Mini App", price: "от 65 000 ₽" },
  { emoji: "✦", name: "AI-агент", price: "от 150 000 ₽", badge: "ТОП" },
];

const portfolioItems = [
  { id: 1, cat: "AI-видео", title: "Имиджевый ролик", result: "+40% узнаваемость", bg: "linear-gradient(135deg,#1a0a0a,#2d1515,#1a1a2e)", emoji: "🎬", featured: true },
  { id: 2, cat: "Сайт", title: "Лендинг студии", result: "+60% заявок", bg: "linear-gradient(135deg,#0f1535,#1e3a7a)", emoji: "🌐" },
  { id: 3, cat: "AI-видео", title: "Промо для бренда", result: "2M просмотров", bg: "linear-gradient(135deg,#1a0808,#3d1010)", emoji: "🏎️" },
  { id: 4, cat: "Mini App", title: "Vision AI App", result: "50K пользователей", bg: "linear-gradient(135deg,#0d0d18,#1a1a35)", emoji: "📱" },
  { id: 5, cat: "Сайты", title: "Интернет-магазин", result: "+120% конверсия", bg: "linear-gradient(135deg,#0a1628,#1e4080)", emoji: "🛍️" },
  { id: 6, cat: "AI", title: "AI-ассистент", result: "80% автоматизация", bg: "linear-gradient(135deg,#0a0a0a,#252525)", emoji: "🤖" },
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
      <TelegramManagerButton />
      <HeroSection navigate={navigate} />
      <Divider />
      <ServicesSection navigate={navigate} />
      <Divider />
      <WorksSection />
      <Divider />
      <HowSection />
      
      <Footer />
    </div>
  );
};

/* ━━━ HERO ━━━ */
const HeroSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width:768px)").matches;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  // Mascot tilt follows cursor
  const rotateY = useTransform(springX, [-500, 500], [-12, 12]);
  const rotateX = useTransform(springY, [-500, 500], [8, -8]);
  // Eyes pupil offset
  const pupilX = useTransform(springX, [-500, 500], [-4, 4]);
  const pupilY = useTransform(springY, [-500, 500], [-3, 3]);

  const [blushing, setBlushing] = useState(false);
  const blushTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleMouse = isMobile ? undefined : (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    mouseX.set(x);
    mouseY.set(y);
    // Blush when cursor is close to mascot center
    const dist = Math.sqrt(x * x + y * y);
    if (dist < 120 && !blushing) {
      setBlushing(true);
      clearTimeout(blushTimer.current);
      blushTimer.current = setTimeout(() => setBlushing(false), 1800);
    }
  };
  const handleMouseLeave = isMobile ? undefined : () => { mouseX.set(0); mouseY.set(0); setBlushing(false); };

  const size = isMobile ? 110 : 140;

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
        {/* Interactive Mascot */}
        <motion.div
          className="relative mb-6 cursor-pointer"
          style={{ width: size, height: size, flexShrink: 0, perspective: 600 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.1 }}
          onClick={() => navigate("/chat")}
          whileTap={{ scale: 0.92 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "relative", width: size, height: size, rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            {/* Main mascot image */}
            <img
              src={mascotImg}
              alt="Neeklo AI маскот"
              style={{
                width: size,
                height: size,
                objectFit: "contain",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.15))",
                pointerEvents: "none",
              }}
            />

            {/* Animated eyes overlay — pupils that follow cursor */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "44%",
                left: "29%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#111",
                x: pupilX,
                y: pupilY,
              }}
            />
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "44%",
                right: "29%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#111",
                x: pupilX,
                y: pupilY,
              }}
            />

            {/* Wink — left eye blinks */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "38%",
                left: "22%",
                width: "18%",
                height: "16%",
                borderRadius: "50%",
                background: "#F0EEE8",
                transformOrigin: "center",
              }}
              animate={{ scaleY: [0, 0, 0, 1, 0, 0] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.58, 0.6, 0.64, 0.68, 1] }}
            />

            {/* Blush cheeks */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{ bottom: "32%", left: "16%", width: 18, height: 10, background: "rgba(255,140,140,0.5)", filter: "blur(4px)" }}
              animate={{ opacity: blushing ? 0.7 : 0 }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{ bottom: "32%", right: "16%", width: 18, height: 10, background: "rgba(255,140,140,0.5)", filter: "blur(4px)" }}
              animate={{ opacity: blushing ? 0.7 : 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Status dot */}
            <div className="absolute" style={{ bottom: 4, right: 4, width: 16, height: 16, zIndex: 10 }}>
              <motion.div
                className="absolute rounded-full"
                style={{ inset: -3, background: "rgba(0,200,83,0.3)" }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="rounded-full" style={{ width: 16, height: 16, background: "radial-gradient(circle at 40% 35%, #4dff91 0%, #00C853 60%, #009940 100%)", border: "3px solid #F0EEE8", boxShadow: "0 0 10px rgba(0,200,83,0.7)", position: "relative", zIndex: 1 }} />
            </div>
          </motion.div>

          {/* Tooltip on hover */}
          <motion.span
            className="absolute -bottom-5 left-1/2 font-body whitespace-nowrap pointer-events-none"
            style={{ fontSize: 11, color: "#6A6860", translateX: "-50%" }}
            initial={{ opacity: 0, y: 4 }}
            whileHover={{ opacity: 1, y: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, 4] }}
            transition={{ duration: 6, repeat: Infinity, times: [0, 0.6, 0.65, 0.85, 0.9] }}
          >
            Нажми — поболтаем 💬
          </motion.span>
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
      <motion.h2 className="font-heading" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>Что делаем</motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 mt-6" style={{ gap: 12 }}>
        {services.map((s, i) => (
          <motion.div
            key={s.name}
            className="relative flex flex-col items-center text-center cursor-pointer hover:-translate-y-[3px] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            style={{ background: "#F7F6F3", borderRadius: 18, padding: "24px 12px 18px" }}
            onClick={() => navigate("/chat")}
            {...fadeUp(i * 0.06)}
          >
            {/* Emoji icon */}
            <div className="relative">
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{ width: 56, height: 56, background: "#EDECE8", fontSize: 28 }}
              >
                {s.emoji}
              </div>
              {s.badge && (
                <span
                  className="absolute -top-1.5 -right-3 font-body text-white"
                  style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: "#0D0D0B" }}
                >
                  {s.badge}
                </span>
              )}
            </div>
            <p className="font-heading mt-3" style={{ fontSize: 14, fontWeight: 700, color: "#0D0D0B" }}>{s.name}</p>
            <p className="font-body mt-1" style={{ fontSize: 12, color: "#8A8880" }}>{s.price}</p>
            <button
              className="font-body mt-3 w-full cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-150"
              style={{ fontSize: 13, fontWeight: 600, padding: "8px 0", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 10 }}
              onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
            >
              Заказать
            </button>
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
                  className="relative w-full flex items-center justify-center"
                  style={{ height: item.featured ? 280 : 200, background: item.bg }}
                >
                  <span className="text-[52px] opacity-70 select-none">{item.emoji}</span>
                  <div
                    className="absolute inset-x-0 bottom-0 p-4"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
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

export default LandingPage;
