import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import HolographicCard from "@/components/ui/holographic-card";
import Footer from "@/components/Footer";
import TelegramManagerButton from "@/components/TelegramManagerButton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import iconVideo from "@/assets/icon-video.png";
import iconWeb from "@/assets/icon-web.png";
import iconApp from "@/assets/icon-app.png";
import iconAi from "@/assets/icon-ai.png";
import iconDesign from "@/assets/icon-design.png";
import iconAnalytics from "@/assets/icon-analytics.png";
import workFashion from "@/assets/work-fashion.webp";
import workStudio from "@/assets/work-studio.webp";
import workRacing from "@/assets/work-racing.webp";
import workVision from "@/assets/work-vision.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";
import workAssistant from "@/assets/work-assistant.webp";
import mascotImg from "@/assets/mascot-new.webp";

/* ─── animation helpers ─── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease, delay },
});

const avatarColors = ["#D4C5B2", "#B8C9D4", "#C4D4B8", "#D4B8C9", "#C9C4D4", "#B8D4C5", "#D4D0B8"];
const feedbackEmojis = ["😡", "😕", "😐", "🙂", "😍"];
const Divider = () => <div className="w-full" style={{ height: 1, background: "#E8E6E0" }} />;

/* ━━━ MAIN PAGE ━━━ */
const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  usePageTitle(t("pageTitle"));

  return (
    <div className="flex-1 bg-background text-foreground pb-[100px] sm:pb-0 overflow-x-hidden">
      <TelegramManagerButton />
      <HeroSection navigate={navigate} />
      <Divider />
      <ServicesSection navigate={navigate} />
      <Divider />
      <WorksSection navigate={navigate} />
      <ReviewsSection />
      <Divider />
      <HowSection />
      <CTASection navigate={navigate} />
      <Footer />
    </div>
  );
};

/* ━━━ HERO ━━━ */
const HeroSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const { t } = useLanguage();
  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        backgroundColor: "#F0EEE8",
        minHeight: "calc(100dvh - 64px)",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative z-10 flex flex-col items-center px-5 sm:px-8" style={{ maxWidth: 700 }}>
        <motion.div
          className="relative cursor-pointer"
          style={{ marginBottom: 20 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => navigate("/chat")}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.06 }}
        >
          <div className="hero-mascot-float" style={{ width: "clamp(140px, 22vw, 200px)", height: "clamp(140px, 22vw, 200px)" }}>
            <img
              src={mascotImg}
              alt="Neeklo mascot"
              width={200}
              height={200}
              style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.18)) saturate(1.15) contrast(1.05)", pointerEvents: "none" }}
            />
          </div>
        </motion.div>

        <motion.h1
          className="font-heading"
          style={{ fontWeight: 800, fontSize: "clamp(30px, 5.5vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "#0D0D0B" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {t("hero.title1")}<br />{t("hero.title2")}
        </motion.h1>

        <motion.p
          className="font-body"
          style={{ fontSize: 16, color: "#807B72", lineHeight: 1.6, marginTop: 14, marginBottom: 28 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
        >
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
            style={{ fontSize: 15, fontWeight: 600, padding: "14px 28px", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 14 }}
          >
            {t("hero.cta")} <ArrowRight size={16} />
          </button>
          <button
            onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}
            className="font-body cursor-pointer hover:text-foreground transition-colors"
            style={{ fontSize: 14, fontWeight: 500, padding: "13px 16px", background: "transparent", color: "#6A6860", border: "none" }}
          >
            {t("hero.works")} <ChevronDown size={14} className="inline ml-1" />
          </button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={20} color="#B0ADA8" />
      </motion.div>

      <style>{`
        .hero-mascot-float { animation: mascot-float 3.5s ease-in-out infinite; will-change: transform; }
        @keyframes mascot-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @media (min-width: 768px) { section:first-of-type { height: calc(100vh - 64px) !important; } }
      `}</style>
    </section>
  );
};

/* ━━━ SERVICES ━━━ */
const ServicesSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const { t } = useLanguage();
  const services = [
    { icon: iconVideo, name: t("services.aiVideo"), price: `${t("services.priceFrom")} 25 000 ₽`, badge: t("services.badgeHit"), badgeColor: "#0D0D0B" },
    { icon: iconWeb, name: t("services.websites"), price: `${t("services.priceFrom")} 95 000 ₽` },
    { icon: iconApp, name: t("services.miniApp"), price: `${t("services.priceFrom")} 65 000 ₽` },
    { icon: iconAi, name: t("services.aiAgents"), price: `${t("services.priceFrom")} 150 000 ₽`, badge: t("services.badgeTop"), badgeColor: "#0D0D0B" },
    { icon: iconDesign, name: t("services.design"), price: `${t("services.priceFrom")} 30 000 ₽` },
    { icon: iconAnalytics, name: t("services.analytics"), price: `${t("services.priceFrom")} 40 000 ₽` },
  ];

  return (
    <section className="bg-white" style={{ padding: "48px 20px" }}>
      <div className="max-w-[1280px] mx-auto md:px-10">
        <motion.h2 className="font-heading" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>{t("services.title")}</motion.h2>
        <div className="grid grid-cols-3 md:grid-cols-6 mt-6" style={{ gap: 10 }}>
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              className="relative flex flex-col items-center text-center cursor-pointer hover:-translate-y-[3px] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              style={{ background: "#F7F6F3", borderRadius: 16, padding: "20px 8px 16px" }}
              onClick={() => navigate("/chat")}
              {...fadeUp(i * 0.05)}
            >
              <div className="relative">
                <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: "#EDECE8" }}>
                  <img src={s.icon} alt={s.name} className="w-7 h-7 object-contain" loading="lazy" />
                </div>
                {s.badge && (
                  <span className="absolute -top-1.5 -right-3 font-body text-white" style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: s.badgeColor }}>
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
};

/* ━━━ WORKS ━━━ */
const WorksSection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const { t } = useLanguage();
  const portfolioItems = [
    { id: 1, cat: t("works.cat.aiVideo"), title: t("works.item1"), result: t("works.res1"), bg: "linear-gradient(135deg,#1a1a2e,#16213e)", img: workFashion, featured: true },
    { id: 2, cat: t("works.cat.site"), title: t("works.item2"), result: t("works.res2"), bg: "linear-gradient(135deg,#0f3460,#533483)", img: workStudio },
    { id: 3, cat: t("works.cat.aiVideo"), title: t("works.item3"), result: t("works.res3"), bg: "linear-gradient(135deg,#1a0a0a,#3d1515)", img: workRacing },
    { id: 4, cat: t("works.cat.miniApp"), title: t("works.item4"), result: t("works.res4"), bg: "linear-gradient(135deg,#0d0d0d,#1a1a2a)", img: workVision },
    { id: 5, cat: t("works.cat.sites"), title: t("works.item5"), result: t("works.res5"), bg: "linear-gradient(135deg,#0a1628,#1e3a5f)", img: workEcommerce },
    { id: 6, cat: t("works.cat.ai"), title: t("works.item6"), result: t("works.res6"), bg: "linear-gradient(135deg,#0a0a0a,#2d2d2d)", img: workAssistant },
  ];

  return (
    <section id="works" className="bg-white" style={{ padding: "72px 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-5">
          <motion.h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800 }} {...fadeUp(0)}>{t("works.title")}</motion.h2>
          <button
            onClick={() => navigate("/works")}
            className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-semibold cursor-pointer hover:text-foreground transition-colors"
            style={{ color: "#6A6860", background: "none", border: "none" }}
          >
            {t("works.all")} <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {portfolioItems.map((item, i) => (
            <motion.div key={item.id} className={item.featured ? "col-span-2" : ""} {...fadeUp(i * 0.07)}>
              <HolographicCard className="rounded-2xl overflow-hidden relative cursor-pointer">
                <div className="relative w-full" style={{ height: item.featured ? 260 : 180, background: item.bg }}>
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <span className="font-body rounded-full inline-block" style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff" }}>
                      {item.cat}
                    </span>
                    <p className="font-body text-white mt-1.5" style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span style={{ color: "#4dff91", fontSize: 12 }}>↑</span>
                      <span className="font-body" style={{ fontSize: 12, fontWeight: 600, color: "#4dff91" }}>{item.result}</span>
                    </div>
                  </div>
                </div>
              </HolographicCard>
            </motion.div>
          ))}
        </div>

        <motion.div className="flex justify-center mt-5 sm:hidden" {...fadeUp(0.4)}>
          <button
            onClick={() => navigate("/works")}
            className="font-body text-[13px] font-semibold py-2.5 px-5 rounded-xl cursor-pointer flex items-center gap-1.5 hover:bg-muted/30 transition-colors"
            style={{ border: "1px solid #E0E0E0", color: "#0D0D0B", background: "none" }}
          >
            {t("works.all")} <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

/* ━━━ REVIEWS ━━━ */
const ReviewsSection = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const reviews = [
    { name: "Юлия", date: "27 марта", text: "Получился видеоролик очень красивым, зрелищным! Спасибо ребятам, рекомендую!" },
    { name: "Степа", date: "27 марта", text: "Все оперативно выполнено и раньше сроков. Результат отличный." },
    { name: "Регина", date: "25 марта", text: "Работа выполнена точь-в-точь как по запросу и даже лучше. Рекомендую 👍🏻" },
    { name: "Мария", date: "22 марта", text: "Ролик просто огонь! 😱 Ты суперпрофессионал: быстро, чётко, всегда на связи!" },
    { name: "P.s", date: "19 марта", text: "Все отлично, быстро, в срок!" },
    { name: "АДСК", date: "17 марта", text: "Сделали крутой рекламный ролик. Очень доволен! Рекомендую 👍" },
    { name: "Андрей", date: "12 марта", text: "Всё на высшем уровне! Профессионалы своего дела." },
  ];

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <section style={{ background: "#F0EEE8", padding: "clamp(40px,5vw,56px) 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 className="font-heading" style={{ fontSize: "clamp(22px,3vw,26px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>
            {t("reviews.title")}
          </motion.h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} disabled={!canScrollLeft} className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30" style={{ background: "#E8E6E0" }}><ChevronLeft size={14} /></button>
            <button onClick={() => scroll(1)} disabled={!canScrollRight} className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30" style={{ background: "#E8E6E0" }}><ChevronRight size={14} /></button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {reviews.map((r, i) => (
            <div key={r.name + i} className="bg-white flex-shrink-0 snap-start" style={{ borderRadius: 16, padding: 14, width: 220, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center rounded-full font-heading flex-shrink-0" style={{ width: 30, height: 30, background: avatarColors[i % avatarColors.length], fontSize: 12, fontWeight: 700, color: "#0D0D0B" }}>
                  {r.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-body truncate" style={{ fontSize: 12, fontWeight: 700, color: "#0D0D0B" }}>{r.name}</p>
                  <p className="font-body" style={{ fontSize: 10, color: "#9A958B" }}>{r.date}</p>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#F5A623", letterSpacing: 1, marginBottom: 4 }}>★★★★★</div>
              <p className="font-body" style={{ fontSize: 12, color: "#3A3A3A", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {r.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-3">
          <a href="https://www.avito.ru/user/neeklo/reviews" target="_blank" rel="noopener noreferrer" className="font-body hover:underline" style={{ fontSize: 12, color: "#9A958B" }}>
            {t("reviews.avito")}
          </a>
        </div>
      </div>
      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
};

/* ━━━ HOW ━━━ */
const HowSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const steps = [
    { num: "01", title: t("how.step1.title"), desc: t("how.step1.desc") },
    { num: "02", title: t("how.step2.title"), desc: t("how.step2.desc") },
    { num: "03", title: t("how.step3.title"), desc: t("how.step3.desc") },
  ];

  return (
    <section style={{ background: "#F0EEE8", padding: "72px 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <h2 className="font-heading mb-10 animate-fade-in" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }}>
          {t("how.title")}
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
              <span className="font-heading flex-shrink-0 select-none transition-colors duration-200 group-hover:text-[#0D0D0B]" style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: "#D0CCC4" }}>
                {s.num}
              </span>
              <div className="pt-1 md:pt-0 md:mt-2">
                <p className="font-body group-hover:text-[#0052FF] transition-colors duration-200" style={{ fontSize: 17, fontWeight: 700, color: "#0D0D0B" }}>{s.title}</p>
                <p className="font-body mt-1 md:max-w-[240px]" style={{ fontSize: 14, color: "#6A6860", lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 mt-10 animate-fade-in cursor-pointer hover:opacity-80 transition-opacity"
          style={{ animationDelay: "400ms", animationFillMode: "both", background: "none", border: "none", padding: 0 }}
        >
          <span style={{ color: "#00C853", fontSize: 18 }}>✓</span>
          <span className="font-body" style={{ fontSize: 14, color: "#0D0D0B", fontWeight: 600 }}>{t("how.free")}</span>
        </button>
      </div>
    </section>
  );
};

/* ━━━ CTA ━━━ */
const CTASection = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<"rating" | "improve" | "opinion" | "done">("rating");
  const [rating, setRating] = useState<number | null>(null);
  const [improve, setImprove] = useState("");
  const [opinion, setOpinion] = useState("");

  const handleNext = () => {
    if (step === "rating" && rating !== null) setStep("improve");
    else if (step === "improve") setStep("opinion");
    else if (step === "opinion") setStep("done");
  };

  return (
    <section style={{ background: "#0D0D0B", padding: "56px 20px", textAlign: "center" }}>
      <h2 className="font-heading" style={{ fontWeight: 800, fontSize: "clamp(22px,4vw,26px)", color: "#fff", marginBottom: 8 }}>
        {t("cta.title")}
      </h2>
      <p className="font-body mx-auto" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 340, marginBottom: 28, lineHeight: 1.6 }}>
        {t("cta.subtitle")}
      </p>

      <div className="mx-auto" style={{ maxWidth: 360 }}>
        {step === "rating" && (
          <div>
            <p className="font-body mb-4" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{t("cta.rate")}</p>
            <div className="flex justify-center gap-3 mb-5">
              {feedbackEmojis.map((emoji, i) => (
                <button key={i} onClick={() => setRating(i)} className="transition-all duration-150 cursor-pointer" style={{ fontSize: 32, background: "none", border: "none", opacity: rating === null ? 1 : rating === i ? 1 : 0.3, transform: rating === i ? "scale(1.3)" : "scale(1)" }}>
                  {emoji}
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={rating === null} className="font-body w-full cursor-pointer transition-all duration-200 disabled:opacity-30" style={{ background: "#fff", color: "#0D0D0B", borderRadius: 14, padding: "12px", fontSize: 14, fontWeight: 600, border: "none" }}>
              {t("cta.next")}
            </button>
          </div>
        )}
        {step === "improve" && (
          <div>
            <p className="font-body mb-3" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{t("cta.improve")}</p>
            <textarea value={improve} onChange={(e) => setImprove(e.target.value.slice(0, 200))} placeholder={t("cta.improvePlaceholder")} rows={3} maxLength={200} className="font-body w-full mb-1 placeholder:text-[rgba(255,255,255,0.3)]" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fff", resize: "none", outline: "none" }} />
            <p className="font-body text-right mb-3" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{improve.length}/200</p>
            <button onClick={handleNext} className="font-body w-full cursor-pointer" style={{ background: "#fff", color: "#0D0D0B", borderRadius: 14, padding: "12px", fontSize: 14, fontWeight: 600, border: "none" }}>{t("cta.next")}</button>
          </div>
        )}
        {step === "opinion" && (
          <div>
            <p className="font-body mb-3" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{t("cta.opinion")}</p>
            <textarea value={opinion} onChange={(e) => setOpinion(e.target.value.slice(0, 200))} placeholder={t("cta.opinionPlaceholder")} rows={3} maxLength={200} className="font-body w-full mb-1 placeholder:text-[rgba(255,255,255,0.3)]" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fff", resize: "none", outline: "none" }} />
            <p className="font-body text-right mb-3" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{opinion.length}/200</p>
            <button onClick={handleNext} className="font-body w-full cursor-pointer" style={{ background: "#fff", color: "#0D0D0B", borderRadius: 14, padding: "12px", fontSize: 14, fontWeight: 600, border: "none" }}>{t("cta.send")}</button>
          </div>
        )}
        {step === "done" && (
          <div>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🙏</div>
            <p className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{t("cta.thanks")}</p>
            <p className="font-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>{t("cta.thanksDesc")}</p>
            <a href="https://t.me/neeekn" target="_blank" rel="noopener noreferrer" className="font-body inline-flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-all duration-200" style={{ background: "#fff", color: "#0D0D0B", borderRadius: 14, padding: "12px 24px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              {t("cta.telegram")} <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>

      {step !== "done" && (
        <div className="flex justify-center gap-1.5 mt-5">
          {["rating", "improve", "opinion"].map((s) => (
            <div key={s} className="rounded-full" style={{ width: step === s ? 16 : 5, height: 5, background: step === s ? "#fff" : "rgba(255,255,255,0.2)", borderRadius: 9999, transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LandingPage;
