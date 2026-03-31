import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowRight, X, ExternalLink, Play } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import workFashion from "@/assets/work-fashion.webp";
import workStudio from "@/assets/work-studio.webp";
import workRacing from "@/assets/work-racing.webp";
import workVision from "@/assets/work-vision.webp";
import workEcommerce from "@/assets/work-ecommerce.webp";
import workAssistant from "@/assets/work-assistant.webp";

/* ─── types ─── */
interface WorkMetric { label: string; value: string }
interface Work {
  id: number; cat: string; title: string; client: string; result: string;
  tags: string[]; type: "video" | "site"; videoUrl?: string; previewUrl?: string;
  bg: string; emoji: string; img?: string; featured?: boolean; brief: string; solution: string;
  metrics: WorkMetric[];
}

/* ─── data ─── */
const works: Work[] = [
  { id: 1, cat: "Ролики", title: "Имиджевый ролик", client: "Fashion Brand", result: "+40% узнаваемость", tags: ["Runway", "Kling", "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #1a1a2e 100%)", emoji: "🎬", img: workFashion, featured: true, brief: "Fashion-бренд хотел имиджевый ролик для Instagram и показа на мероприятии.", solution: "AI-генерация сцен в Runway, монтаж в CapCut Pro, озвучка ElevenLabs.", metrics: [{ label: "Просмотров", value: "2M+" }, { label: "Охват", value: "+40%" }, { label: "Срок", value: "5 дней" }] },
  { id: 2, cat: "Сайты", title: "Лендинг студии", client: "neeklo.studio", result: "+60% заявок", tags: ["React", "Lovable", "Framer Motion"], type: "site", previewUrl: "https://neeklo.ru", bg: "linear-gradient(135deg, #0f1535 0%, #1e3a7a 100%)", emoji: "🌐", img: workStudio, brief: "Нужен современный сайт студии с AI-ассистентом и портфолио.", solution: "Разработка на Lovable + React, AI-чат, анимации на Framer Motion.", metrics: [{ label: "Конверсия", value: "+60%" }, { label: "Срок", value: "7 дней" }, { label: "Скорость", value: "98/100" }] },
  { id: 3, cat: "Ролики", title: "Промо для бренда", client: "DA-Motors", result: "2M просмотров", tags: ["AI-видео", "Reels", "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #1a0808 0%, #3d1010 50%, #1a0a0a 100%)", emoji: "🏎️", img: workRacing, brief: "Авто-дилер хотел вирусный промо-ролик для Reels и TikTok.", solution: "AI-генерация динамичных сцен, быстрый монтаж, трендовый саунд.", metrics: [{ label: "Просмотров", value: "2M" }, { label: "Подписчиков", value: "+8K" }, { label: "Срок", value: "3 дня" }] },
  { id: 4, cat: "Mini App", title: "Vision AI App", client: "Tech Startup", result: "50K пользователей", tags: ["Telegram", "React", "Python"], type: "site", bg: "linear-gradient(135deg, #0d0d18 0%, #1a1a35 100%)", emoji: "📱", img: workVision, brief: "Стартап хотел голосовой AI-ассистент внутри Telegram.", solution: "Telegram Mini App на React, backend на Python FastAPI, интеграция GPT-4.", metrics: [{ label: "Пользователей", value: "50K" }, { label: "DAU", value: "12K" }, { label: "Срок", value: "21 день" }] },
  { id: 5, cat: "Сайты", title: "Интернет-магазин", client: "Fashion Retail", result: "+120% конверсия", tags: ["React", "Shopify", "SEO"], type: "site", bg: "linear-gradient(135deg, #0a1628 0%, #1e4080 100%)", emoji: "🛍️", img: workEcommerce, brief: "Fashion-ритейлер хотел современный магазин с AI-рекомендациями.", solution: "React + Shopify headless, AI-персонализация, SEO-оптимизация.", metrics: [{ label: "Конверсия", value: "+120%" }, { label: "Средний чек", value: "+35%" }, { label: "Срок", value: "14 дней" }] },
  { id: 6, cat: "AI", title: "AI-продавец", client: "B2B компания", result: "80% автоматизация", tags: ["GPT-4", "n8n", "amoCRM"], type: "site", bg: "linear-gradient(135deg, #0a0a0a 0%, #252525 100%)", emoji: "🤖", img: workAssistant, brief: "B2B компания хотела автоматизировать обработку входящих лидов.", solution: "AI-агент на GPT-4, интеграция с amoCRM через n8n, Telegram-уведомления.", metrics: [{ label: "Автоматизация", value: "80%" }, { label: "Экономия", value: "40ч/мес" }, { label: "Срок", value: "14 дней" }] },
];

const filterTabs = ["Все", "Сайты", "Ролики", "Mini App", "AI"];
const ease = [0.16, 1, 0.3, 1] as const;

/* ─── count-up ─── */
const useCountUp = (target: string, run: boolean) => {
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!run) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
    const prefix = target.match(/^[^0-9]*/)?.[0] || "";
    const suffix = target.match(/[^0-9]*$/)?.[0] || "";
    if (isNaN(num) || num === 0) { setVal(target); return; }
    const steps = 20;
    let step = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        step++;
        setVal(prefix + Math.round((step / steps) * num) + suffix);
        if (step >= steps) { clearInterval(iv); setVal(target); }
      }, 30);
    }, 100);
    return () => clearTimeout(t);
  }, [target, run]);
  return val;
};

const MetricCell = ({ m, run }: { m: WorkMetric; run: boolean }) => {
  const v = useCountUp(m.value, run);
  return (
    <div className="bg-[#F9F9F9] rounded-2xl p-3 text-center">
      <div className="font-heading text-[20px] font-[800] text-[#0D0D0B]">{v}</div>
      <div className="font-body text-[11px] text-[#6A6860] mt-1">{m.label}</div>
    </div>
  );
};

/* ─── card ─── */
const WorkCard = ({ work, index, onClick }: { work: Work; index: number; onClick: () => void }) => (
  <motion.div
    className="relative overflow-hidden rounded-[20px] cursor-pointer break-inside-avoid h-full"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.45, ease, delay: index * 0.06 }}
    whileHover={{ scale: 1.02, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
  >
    <div className="absolute inset-0" style={{ background: work.bg }}>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[52px] opacity-60 select-none">{work.emoji}</span>
    </div>
    <div className="absolute bottom-0 left-0 right-0 z-[1]" style={{ height: "70%", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" }} />
    <div className="absolute top-3 right-3 z-[2]">
      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
        {work.type === "video" ? <Play size={12} fill="white" className="text-white ml-0.5" /> : <ExternalLink size={12} className="text-white" />}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 z-[2] p-4">
      <span className="inline-flex bg-white/15 backdrop-blur-sm border border-white/20 rounded-full font-body text-[11px] font-semibold text-white px-3 py-1 mb-2">{work.cat}</span>
      <div className="font-body text-[16px] font-bold text-white leading-[1.3]">{work.title}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[#4dff91] text-[12px]">↑</span>
        <span className="font-body text-[12px] font-semibold text-[#4dff91]">{work.result}</span>
      </div>
    </div>
  </motion.div>
);

/* ─── modal ─── */
const WorkModal = ({ work, onClose, onNav, canNav }: { work: Work; onClose: () => void; onNav: (dir: -1 | 1) => void; canNav: boolean }) => {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const dragY = useMotionValue(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => { setPlaying(false); }, [work.id]);

  const headerH = isMobile ? 260 : 340;
  const isVideo = work.type === "video" && work.videoUrl;

  const card = (
    <motion.div
      className={isMobile ? "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[24px] overflow-y-auto" : "bg-white rounded-[24px] w-full max-w-[680px] max-h-[88vh] overflow-y-auto"}
      style={isMobile ? { maxHeight: "92vh" } : {}}
      initial={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
      exit={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      transition={isMobile ? { duration: 0.35, ease } : { duration: 0.3, ease }}
      drag={isMobile ? "y" : false}
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      onDragEnd={isMobile ? (_: any, info: any) => { if (info.offset.y > 80) onClose(); } : undefined}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {/* header */}
      <div className="relative overflow-hidden rounded-t-[24px]" style={{ height: headerH }}>
        {isVideo && playing ? (
          <iframe className="w-full h-full border-0" src={work.videoUrl + "?autoplay=1&rel=0"} allow="autoplay; fullscreen" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: work.bg }}>
            <span className="text-[64px] select-none">{work.emoji}</span>
            {isVideo && (
              <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center group">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <Play size={24} fill="#0D0D0B" className="text-[#0D0D0B] ml-1" />
                </div>
              </button>
            )}
            {work.type === "site" && work.previewUrl && (
              <button onClick={() => window.open(work.previewUrl, "_blank")} className="absolute top-3 right-3 bg-white/15 backdrop-blur border border-white/20 rounded-xl font-body text-[13px] font-semibold text-white px-3 py-2 hover:bg-white/25 transition-colors">
                Открыть сайт ↗
              </button>
            )}
          </div>
        )}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* body */}
      <div className="px-5 pt-5 pb-8">
        {isMobile && <div className="w-8 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-4" />}
        <div className="flex items-center justify-between">
          <span className="bg-[#F5F5F5] text-[#6A6860] rounded-full font-body text-[11px] font-semibold px-3 py-1">{work.cat}</span>
          <span className="font-body text-[13px] text-[#6A6860]">{work.client}</span>
        </div>
        <h2 className="font-heading text-[22px] font-[800] text-[#0D0D0B] mt-2 mb-4">{work.title}</h2>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {work.metrics.map((m) => <MetricCell key={m.label} m={m} run />)}
        </div>

        <div className="mb-4">
          <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">Задача</div>
          <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[15px] text-[#3A3A3A] leading-[1.65]">{work.brief}</div>
        </div>
        <div className="mb-6">
          <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">Решение</div>
          <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[15px] text-[#3A3A3A] leading-[1.65]">{work.solution}</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {work.tags.map((t) => <span key={t} className="bg-[#F0F0F0] rounded-full font-body text-[12px] font-semibold text-[#6A6860] px-3 py-1.5">{t}</span>)}
        </div>

        <div className={isMobile ? "sticky bottom-0 bg-white pt-3 pb-[env(safe-area-inset-bottom)]" : ""}>
          <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-4 font-body text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer">
            Заказать похожий проект <ArrowRight size={16} />
          </button>
        </div>

        {canNav && (
          <div className="flex justify-between mt-3">
            <button onClick={() => onNav(-1)} className="font-body text-[13px] text-[#6A6860] hover:text-[#0D0D0B] transition-colors cursor-pointer">← Предыдущий</button>
            <button onClick={() => onNav(1)} className="font-body text-[13px] text-[#6A6860] hover:text-[#0D0D0B] transition-colors cursor-pointer">Следующий →</button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
      {isMobile ? card : <div className="fixed inset-0 flex items-center justify-center z-50 px-4" onClick={onClose}>{card}</div>}
    </>
  );
};

/* ━━━ PAGE ━━━ */
const WorksPage = () => {
  usePageTitle("Работы – neeklo");
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Все");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const filtered = activeFilter === "Все" ? works : works.filter((w) => w.cat === activeFilter);

  const handleNav = (dir: -1 | 1) => {
    if (!selectedWork) return;
    const idx = filtered.findIndex((w) => w.id === selectedWork.id);
    setSelectedWork(filtered[(idx + dir + filtered.length) % filtered.length]);
  };

  useEffect(() => {
    document.body.style.overflow = selectedWork ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedWork]);

  return (
    <div className="bg-white min-h-screen pb-[100px]">
      {/* Header */}
      <div className="px-5 pt-8 md:px-10 md:pt-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-heading text-[22px] md:text-[28px] font-[800] text-[#0D0D0B]">Наши работы</h1>
          <span className="bg-[#0D0D0B] text-white rounded-full font-body text-[13px] font-semibold px-3 py-1.5">150+ проектов</span>
        </div>
        <p className="font-body text-[15px] text-[#6A6860] mt-1">Реальные кейсы и результаты наших клиентов</p>
      </div>

      {/* Filters */}
      <div className="sticky top-[64px] bg-white/95 backdrop-blur-md z-10 border-b border-[#F0F0F0] py-3 px-5 md:px-10 mt-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap rounded-full font-body text-[13px] font-semibold px-4 py-1.5 transition-colors cursor-pointer ${
                activeFilter === f ? "bg-[#0D0D0B] text-white" : "border border-[#E0E0E0] text-[#6A6860] hover:border-[#B0B0B0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 md:px-10 pt-6">
        <div className="hidden md:block" style={{ columns: 3, columnGap: 16 }}>
          {filtered.map((w, i) => (
            <div key={w.id} className="mb-4 break-inside-avoid" style={{ height: w.featured ? 320 : 220 }}>
              <WorkCard work={w} index={i} onClick={() => setSelectedWork(w)} />
            </div>
          ))}
        </div>
        <div className="md:hidden flex flex-col gap-3">
          {filtered.map((w, i) => (
            <div key={w.id} style={{ height: 220 }}>
              <WorkCard work={{ ...w, featured: false }} index={i} onClick={() => setSelectedWork(w)} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#0D0D0B] text-center mt-10" style={{ padding: "48px 20px" }}>
        <h2 className="font-heading text-[24px] font-[800] text-white">Хотите такой же проект?</h2>
        <p className="font-body text-[15px] text-white/50 mt-2 mb-6">Расскажите задачу – предложим решение за 1 час</p>
        <button
          onClick={() => navigate("/chat")}
          className="bg-white text-[#0D0D0B] rounded-2xl px-8 py-4 font-body text-[15px] font-bold cursor-pointer"
          style={{ transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#F0EEE8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#fff"; }}
        >
          Обсудить проект →
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedWork && <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} onNav={handleNav} canNav={filtered.length > 1} />}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default WorksPage;
