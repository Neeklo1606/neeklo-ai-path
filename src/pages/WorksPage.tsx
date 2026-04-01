import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowRight, X, ExternalLink, Play } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

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
  // ── AI / АВТОМАТИЗАЦИЯ ──
  { id: 1, cat: "AI", title: "Голосовой AI-ассистент", client: "Сергей В.", result: "80% автоматизация", tags: ["Voice AI", "Telegram", "PWA"], type: "site", bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1035 50%, #0d1a2e 100%)", emoji: "🎙️", featured: true, brief: "Клиент хотел автоматизировать общение с клиентами: отвечать на вопросы 24/7 без менеджера.", solution: "Сделали голосовой AI-ассистент в Telegram и PWA. Голос → текст → AI-ответ → обратно голосом. Интеграция с базой знаний клиента.", metrics: [{ label: "Автоматизация", value: "80%" }, { label: "Экономия", value: "40ч/мес" }, { label: "Срок", value: "14 дней" }] },
  { id: 2, cat: "AI", title: "AI-анализ договоров", client: "Юридическая фирма", result: "Ускорение ×5", tags: ["GPT-4", "Python", "Telegram"], type: "site", bg: "linear-gradient(135deg, #0a1a0a 0%, #0d2d1a 50%, #0a1a10 100%)", emoji: "📄", brief: "Юристы тратили часы на анализ договоров вручную. Нужно было ускорить и снизить количество ошибок.", solution: "AI-агент анализирует PDF договоры, подсвечивает риски, выдаёт краткое резюме. Работает через Telegram-бот.", metrics: [{ label: "Ускорение", value: "×5" }, { label: "Ошибок", value: "-70%" }, { label: "Срок", value: "10 дней" }] },
  { id: 3, cat: "AI", title: "AI-агент продаж", client: "B2B компания", result: "+120% лидов", tags: ["GPT-4", "n8n", "amoCRM"], type: "site", bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #0d0d1a 100%)", emoji: "🤖", brief: "Менеджеры тонули в однотипных вопросах от лидов. Конверсия падала из-за долгого ответа.", solution: "Telegram-бот с AI отвечает на вопросы, квалифицирует лид, передаёт горячих в CRM. Интеграция с amoCRM через n8n.", metrics: [{ label: "Конверсия", value: "+120%" }, { label: "Время ответа", value: "< 30 сек" }, { label: "Срок", value: "14 дней" }] },
  // ── TELEGRAM / MINI APP ──
  { id: 4, cat: "Mini App", title: "DA-Motors Mini App", client: "DA-Motors", result: "+80% заявок", tags: ["Telegram", "React", "Bot"], type: "site", bg: "linear-gradient(135deg, #1a0808 0%, #2d1010 50%, #1a0a0a 100%)", emoji: "🚗", featured: true, brief: "Авто-дилер хотел принимать заявки и показывать каталог прямо в Telegram без отдельного сайта.", solution: "Telegram Mini App с каталогом автомобилей, фильтрами и формой заявки. Уведомления менеджеру в реальном времени.", metrics: [{ label: "Заявок", value: "+80%" }, { label: "Конверсия", value: "12%" }, { label: "Срок", value: "21 день" }] },
  { id: 5, cat: "Mini App", title: "Закрытый клуб", client: "Инфо-бизнес", result: "500K₽/мес доход", tags: ["Telegram", "Оплата Stars", "React"], type: "site", bg: "linear-gradient(135deg, #0d0d18 0%, #1a1a35 50%, #0a0a20 100%)", emoji: "💎", brief: "Эксперт хотел монетизировать аудиторию Telegram — закрытый клуб с платным доступом к материалам.", solution: "Mini App с подпиской, оплатой через Telegram Stars и ЮKassa. Личный кабинет, доступ к урокам, чат с экспертом.", metrics: [{ label: "MRR", value: "500K₽" }, { label: "Участников", value: "200+" }, { label: "Срок", value: "18 дней" }] },
  { id: 6, cat: "Mini App", title: "Vision AI App", client: "Tech Startup", result: "50K пользователей", tags: ["Telegram", "React", "Python"], type: "site", bg: "linear-gradient(135deg, #0d0818 0%, #180d35 50%, #0a0820 100%)", emoji: "📱", brief: "Стартап хотел голосовой AI-ассистент внутри Telegram для массовой аудитории.", solution: "Telegram Mini App: распознавание голоса, AI-ответы, история диалогов. Backend на Python FastAPI, GPT-4.", metrics: [{ label: "Пользователей", value: "50K" }, { label: "DAU", value: "12K" }, { label: "Срок", value: "21 день" }] },
  // ── САЙТЫ ──
  { id: 7, cat: "Сайты", title: "АВИС — B2B сайт", client: "АВИС (Сочи)", result: "+200% заявок", tags: ["React", "Dark UI", "B2B"], type: "site", bg: "linear-gradient(135deg, #0a1020 0%, #152040 50%, #0a1530 100%)", emoji: "🛡️", brief: "Инженерная компания (защита от БПЛА) нуждалась в премиальном B2B-сайте для привлечения корпоративных клиентов.", solution: "Тёмный премиальный дизайн, продуктовые страницы с техническими характеристиками, форма запроса КП, SEO.", metrics: [{ label: "Заявок", value: "+200%" }, { label: "Время на сайте", value: "+3 мин" }, { label: "Срок", value: "14 дней" }] },
  { id: 8, cat: "Сайты", title: "Метод Малова", client: "Евгений Малов", result: "+90% конверсия", tags: ["React", "Lovable", "Брендинг"], type: "site", bg: "linear-gradient(135deg, #1a0a05 0%, #2d1a0a 50%, #1a1005 100%)", emoji: "🔍", brief: "Автоподборщик автомобилей хотел сайт под личный бренд с онлайн-диагностикой и системой заявок.", solution: "Премиальный лендинг с фирменным стилем (МЕМ логотип, шрифт Benzin), калькулятором стоимости и CRM-интеграцией.", metrics: [{ label: "Конверсия", value: "+90%" }, { label: "Заявок в мес", value: "120+" }, { label: "Срок", value: "10 дней" }] },
  { id: 9, cat: "Сайты", title: "LIVEGRID — недвижимость", client: "Олег / Diamante", result: "Платформа с 0", tags: ["React", "Supabase", "Фильтры"], type: "site", bg: "linear-gradient(135deg, #0a1628 0%, #1e4080 50%, #0a2040 100%)", emoji: "🏢", brief: "Клиент хотел современный портал недвижимости с продвинутой фильтрацией и личными кабинетами.", solution: "Полноценная платформа: каталог объектов, фильтры, сравнение, ЛК покупателя и застройщика. Backend на Supabase.", metrics: [{ label: "Объектов", value: "500+" }, { label: "Фильтров", value: "24" }, { label: "Срок", value: "6 недель" }] },
  // ── ПЛАТФОРМЫ ──
  { id: 10, cat: "Платформы", title: "ПОВУЗАМ — EdTech", client: "Образование РФ", result: "Федеральный масштаб", tags: ["React", "Node.js", "PostgreSQL"], type: "site", bg: "linear-gradient(135deg, #0a1a0a 0%, #153520 50%, #0a2015 100%)", emoji: "🎓", brief: "Нужна платформа для связи абитуриентов с вузами по всей России. Личные кабинеты, рейтинги, подбор программ.", solution: "Полноценная EdTech платформа: 500+ вузов, умный подбор по ЕГЭ, личные кабинеты, CRM для приёмных комиссий.", metrics: [{ label: "Вузов", value: "500+" }, { label: "Бюджет", value: "2 млн₽" }, { label: "Срок", value: "3 мес" }] },
  { id: 11, cat: "Платформы", title: "AI Aggregator", client: "SaaS стартап", result: "10+ AI в одном", tags: ["React", "OpenAI", "Claude", "Flux"], type: "site", bg: "linear-gradient(135deg, #0d0818 0%, #200d35 50%, #0a0825 100%)", emoji: "⚡", brief: "Команда хотела SaaS: все популярные нейросети в одном интерфейсе с единой подпиской.", solution: "Платформа-агрегатор: GPT-4, Claude, Gemini, Midjourney, Flux в одном окне. Единый баланс, история, командный доступ.", metrics: [{ label: "AI моделей", value: "10+" }, { label: "Подписчиков", value: "1K+" }, { label: "Срок", value: "4 недели" }] },
  { id: 12, cat: "Платформы", title: "SkillChain", client: "Стартап", result: "Биржа + обучение", tags: ["React", "Supabase", "Геймификация"], type: "site", bg: "linear-gradient(135deg, #0a0a1a 0%, #101535 50%, #080a20 100%)", emoji: "🔗", brief: "Идея: платформа где можно учиться и сразу получать реальные задачи. Как LinkedIn + Coursera + биржа.", solution: "Маркетплейс задач с системой обучения, баллами за выполнение, рейтингом исполнителей и безопасной сделкой.", metrics: [{ label: "Задач", value: "500+" }, { label: "Специалистов", value: "200+" }, { label: "Срок", value: "5 недель" }] },
  // ── AI ВИДЕО ──
  { id: 13, cat: "Ролики", title: "Совкомбанк — 3D ролик", client: "Совкомбанк", result: "Корп. контент", tags: ["3D", "AI", "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #0a1628 0%, #1a3060 50%, #0a2040 100%)", emoji: "🏦", brief: "Банку нужен был имиджевый ролик про рубль и юань для внутренних коммуникаций.", solution: "3D-анимация монет, AI-генерация сцен, профессиональный монтаж. Стиль — корпоративный минимализм.", metrics: [{ label: "Хронометраж", value: "90 сек" }, { label: "Сцен", value: "24" }, { label: "Срок", value: "7 дней" }] },
  { id: 14, cat: "Ролики", title: "Акрихин — медицина", client: "Акрихин", result: "Продуктовый ролик", tags: ["AI видео", "Runway", "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #0a1a15 0%, #0d3525 50%, #081a10 100%)", emoji: "💊", brief: "Фармкомпании нужна была визуализация действия препарата для презентаций и сайта.", solution: "AI-генерация медицинских сцен в Runway, 3D-визуализация молекул, профессиональный закадровый голос.", metrics: [{ label: "Просмотров", value: "500K" }, { label: "Конверсия", value: "+35%" }, { label: "Срок", value: "5 дней" }] },
  { id: 15, cat: "Ролики", title: "Промышленный ролик", client: "Производство", result: "2M просмотров", tags: ["Kling", "Runway", "Reels"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #1a0808 0%, #3d1010 50%, #1a0505 100%)", emoji: "🏭", brief: "Промышленная компания хотела показать производство красиво — для соцсетей и выставок.", solution: "AI-генерация производственных сцен, динамичный монтаж под тренд Reels, профессиональный саундтрек.", metrics: [{ label: "Просмотров", value: "2M" }, { label: "Охват", value: "+300%" }, { label: "Срок", value: "3 дня" }] },
];

const filterTabs = ["Все", "Сайты", "Ролики", "Mini App", "AI", "Платформы"];
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
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: work.bg }}>
      <span className="text-[52px] opacity-70 select-none">{work.emoji}</span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {filtered.map((w, i) => (
            <div key={w.id} className={w.featured ? "col-span-2 md:col-span-2" : ""} style={{ height: w.featured ? 280 : 220 }}>
              <WorkCard work={w} index={i} onClick={() => setSelectedWork(w)} />
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
