import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── data ─── */
interface Work {
  id: number;
  cat: string;
  title: string;
  client: string;
  result: string;
  tags: string[];
  bg: string;
  emoji: string;
  featured?: boolean;
  desc: string;
}

const works: Work[] = [
  { id: 1, cat: "AI-видео", title: "Имиджевый ролик", client: "Fashion Brand", result: "+40% узнаваемость бренда", tags: ["Runway", "Kling", "Монтаж"], bg: "linear-gradient(135deg,#1a1a2e,#16213e)", emoji: "🎬", featured: true, desc: "Имиджевый AI-ролик для fashion-бренда. Съёмки в Бангкоке, AI-генерация фонов и персонажей." },
  { id: 2, cat: "Сайты", title: "Лендинг студии", client: "neeklo.studio", result: "+60% заявок", tags: ["React", "Lovable", "Framer Motion"], bg: "linear-gradient(135deg,#0f1535,#1e3a7a)", emoji: "🌐", desc: "Корпоративный сайт с AI-ассистентом. Конверсия выросла с 2% до 5.2%." },
  { id: 3, cat: "AI-видео", title: "Промо для бренда", client: "DA-Motors", result: "2M просмотров", tags: ["AI-видео", "Reels", "Монтаж"], bg: "linear-gradient(135deg,#1a0808,#3d1010)", emoji: "🏎️", desc: "Серия промо-роликов для автодилера. Охват 2M просмотров за первую неделю." },
  { id: 4, cat: "Mini App", title: "Vision AI App", client: "Tech Startup", result: "50K пользователей", tags: ["Telegram", "React", "Python"], bg: "linear-gradient(135deg,#0d0d18,#1a1a35)", emoji: "📱", featured: true, desc: "Голосовой AI-ассистент в Telegram Mini App. 50K активных пользователей за 2 месяца." },
  { id: 5, cat: "Сайты", title: "Интернет-магазин", client: "Fashion Retail", result: "+120% конверсия", tags: ["React", "Shopify", "SEO"], bg: "linear-gradient(135deg,#0a1628,#1e4080)", emoji: "🛍️", desc: "Интернет-магазин с AI-рекомендациями. Конверсия выросла с 1.1% до 2.4%." },
  { id: 6, cat: "AI-агенты", title: "AI-продавец", client: "B2B компания", result: "80% автоматизация", tags: ["GPT-4", "n8n", "amoCRM"], bg: "linear-gradient(135deg,#0a0a0a,#252525)", emoji: "🤖", desc: "AI-агент для квалификации входящих лидов. Закрыл 80% первичных обращений без менеджера." },
  { id: 7, cat: "Сайты", title: "Корпоративный сайт", client: "Engineering Firm", result: "В топ-3 Яндекс", tags: ["Next.js", "SEO", "Анимации"], bg: "linear-gradient(135deg,#0d1a0d,#1a3d1a)", emoji: "🏗️", desc: "Корпоративный сайт для инжиниринговой компании. Позиции в топ-3 за 3 месяца." },
  { id: 8, cat: "AI-агенты", title: "Голосовой ассистент", client: "Medical Clinic", result: "-40% нагрузка на ресепшн", tags: ["Voice AI", "Python", "Telegram"], bg: "linear-gradient(135deg,#0a0a1a,#1a1a40)", emoji: "🎙️", desc: "Голосовой бот для записи на приём. Снял 40% нагрузки с ресепшн." },
];

const filters = ["Все", "AI-видео", "Сайты", "Mini App", "AI-агенты"];
const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Detail Modal ─── */
const WorkDetail = ({
  work,
  onClose,
  onPrev,
  onNext,
  isMobile,
  navigate,
}: {
  work: Work;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isMobile: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const content = (
    <>
      {/* Image area */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ height: 240, background: work.bg }}
      >
        <span className="text-[64px]">{work.emoji}</span>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)" }}
        >
          <X size={18} color="#fff" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <span
          className="font-body rounded-full inline-block"
          style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "#F0F0F0", color: "#6A6860" }}
        >
          {work.cat}
        </span>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "#6A6860" }}>{work.client}</p>
        <h2 className="font-heading mt-2" style={{ fontSize: 22, fontWeight: 800 }}>{work.title}</h2>

        {/* Result metric */}
        <p className="font-heading mt-4" style={{ fontSize: 28, fontWeight: 800, color: "#0052FF" }}>
          {work.result}
        </p>

        <p className="font-body mt-4" style={{ fontSize: 15, lineHeight: 1.65, color: "#0D0D0B" }}>
          {work.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {work.tags.map((t) => (
            <span key={t} className="font-body rounded-full" style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", background: "#F0F0F0" }}>
              {t}
            </span>
          ))}
        </div>

        <div className="w-full mt-6" style={{ height: 1, background: "#F0F0F0" }} />

        <button
          onClick={() => navigate("/chat")}
          className="w-full font-body text-white rounded-xl mt-4 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-200"
          style={{ background: "#0D0D0B", padding: "14px 0", fontSize: 15, fontWeight: 600 }}
        >
          Заказать похожий проект →
        </button>

        {/* Prev / Next */}
        <div className="flex justify-between mt-4">
          <button onClick={onPrev} className="flex items-center gap-1 font-body cursor-pointer hover:text-foreground transition-colors" style={{ fontSize: 13, fontWeight: 600, color: "#6A6860" }}>
            <ChevronLeft size={16} /> Предыдущий
          </button>
          <button onClick={onNext} className="flex items-center gap-1 font-body cursor-pointer hover:text-foreground transition-colors" style={{ fontSize: 13, fontWeight: 600, color: "#6A6860" }}>
            Следующий <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <motion.div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-y-auto"
          style={{ maxHeight: "90vh" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease }}
        >
          {content}
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div className="fixed inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div
          className="relative z-10 bg-white rounded-3xl max-w-2xl w-full mx-4 overflow-hidden overflow-y-auto"
          style={{ maxHeight: "85vh" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease }}
        >
          {content}
        </motion.div>
      </motion.div>
    </>
  );
};

/* ─── Card ─── */
const WorkCard = ({ work, index, onClick, isMobile }: { work: Work; index: number; onClick: () => void; isMobile: boolean }) => (
  <motion.div
    className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
    style={{ breakInside: "avoid", marginBottom: isMobile ? 0 : 16 }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease, delay: index * 0.06 }}
    onClick={onClick}
  >
    <div
      className="relative flex items-center justify-center"
      style={{
        height: !isMobile && work.featured ? 300 : isMobile ? 200 : 220,
        background: work.bg,
      }}
    >
      <span className="text-5xl">{work.emoji}</span>
      <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)" }}>
        <span className="font-body rounded-full inline-block" style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff" }}>
          {work.cat}
        </span>
        <p className="font-body text-white mt-1.5" style={{ fontSize: 15, fontWeight: 700 }}>{work.title}</p>
      </div>
    </div>
    <div className="flex items-center justify-between px-1 pt-2 pb-1">
      <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0052FF" }}>{work.result}</span>
      <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>Смотреть →</span>
    </div>
  </motion.div>
);

/* ─── Page ─── */
const WorksPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [active, setActive] = useState("Все");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  usePageTitle("Работы — neeklo");

  const filtered = useMemo(
    () => (active === "Все" ? works : works.filter((w) => w.cat === active)),
    [active]
  );

  const selectedIndex = selectedId !== null ? filtered.findIndex((w) => w.id === selectedId) : -1;
  const selectedWork = selectedIndex >= 0 ? filtered[selectedIndex] : null;

  const handleClose = useCallback(() => setSelectedId(null), []);
  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedId(filtered[selectedIndex - 1].id);
    else setSelectedId(filtered[filtered.length - 1].id);
  }, [selectedIndex, filtered]);
  const handleNext = useCallback(() => {
    if (selectedIndex < filtered.length - 1) setSelectedId(filtered[selectedIndex + 1].id);
    else setSelectedId(filtered[0].id);
  }, [selectedIndex, filtered]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky filter bar */}
      <div
        className="sticky z-10 border-b border-[#F0F0F0]"
        style={{
          top: isMobile ? 52 : 64,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="font-body whitespace-nowrap rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "6px 16px",
                  background: active === f ? "#0D0D0B" : "transparent",
                  color: active === f ? "#fff" : "#6A6860",
                  border: active === f ? "1px solid #0D0D0B" : "1px solid #E0E0E0",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {/* Header */}
        <div style={{ paddingTop: 32 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800 }}>Наши работы</h1>
            <span className="font-body text-white rounded-full" style={{ fontSize: 13, fontWeight: 600, padding: "4px 12px", background: "#0D0D0B" }}>
              150+ проектов
            </span>
          </div>
          <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>
            Реальные кейсы и результаты наших клиентов
          </p>
        </div>

        {/* Grid */}
        {isMobile ? (
          <div className="flex flex-col gap-3" style={{ paddingTop: 20, paddingBottom: 100 }}>
            {filtered.map((w, i) => (
              <WorkCard key={w.id} work={w} index={i} onClick={() => setSelectedId(w.id)} isMobile />
            ))}
          </div>
        ) : (
          <div className="columns-3 gap-4" style={{ paddingTop: 24, paddingBottom: 100 }}>
            {filtered.map((w, i) => (
              <WorkCard key={w.id} work={w} index={i} onClick={() => setSelectedId(w.id)} isMobile={false} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedWork && (
          <WorkDetail
            work={selectedWork}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
            isMobile={isMobile}
            navigate={navigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorksPage;
