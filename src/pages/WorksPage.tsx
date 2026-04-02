import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowRight, X, ExternalLink, Play } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";

/* ─── types ─── */
interface WorkMetric { label: string; value: string }
interface Work {
  id: number; cat: string; title: string; client: string; result: string;
  tags: string[]; type: "video" | "site"; videoUrl?: string; previewUrl?: string;
  bg: string; emoji: string; img?: string; featured?: boolean; brief: string; solution: string;
  metrics: WorkMetric[];
}

/* ─── data factory ─── */
const getWorks = (lang: string): Work[] => {
  const en = lang === "en";
  return [
    { id: 1, cat: en ? "AI" : "AI", title: en ? "Voice AI Assistant" : "Голосовой AI-ассистент", client: en ? "Sergey V." : "Сергей В.", result: en ? "80% automation" : "80% автоматизация", tags: ["Voice AI", "Telegram", "PWA"], type: "site", bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1035 50%, #0d1a2e 100%)", emoji: "🎙️", featured: true, brief: en ? "The client wanted to automate customer communication: answer questions 24/7 without a manager." : "Клиент хотел автоматизировать общение с клиентами: отвечать на вопросы 24/7 без менеджера.", solution: en ? "We built a voice AI assistant for Telegram and PWA. Voice → text → AI response → back to voice. Integrated with the client's knowledge base." : "Сделали голосовой AI-ассистент в Telegram и PWA. Голос → текст → AI-ответ → обратно голосом. Интеграция с базой знаний клиента.", metrics: [{ label: en ? "Automation" : "Автоматизация", value: "80%" }, { label: en ? "Savings" : "Экономия", value: en ? "40h/mo" : "40ч/мес" }, { label: en ? "Timeline" : "Срок", value: en ? "14 days" : "14 дней" }] },
    { id: 2, cat: en ? "AI" : "AI", title: en ? "AI Contract Analysis" : "AI-анализ договоров", client: en ? "Law firm" : "Юридическая фирма", result: en ? "Speed ×5" : "Ускорение ×5", tags: ["GPT-4", "Python", "Telegram"], type: "site", bg: "linear-gradient(135deg, #0a1a0a 0%, #0d2d1a 50%, #0a1a10 100%)", emoji: "📄", brief: en ? "Lawyers spent hours manually analyzing contracts. Needed to speed up and reduce errors." : "Юристы тратили часы на анализ договоров вручную. Нужно было ускорить и снизить количество ошибок.", solution: en ? "AI agent analyzes PDF contracts, highlights risks, provides summary. Works via Telegram bot." : "AI-агент анализирует PDF договоры, подсвечивает риски, выдаёт краткое резюме. Работает через Telegram-бот.", metrics: [{ label: en ? "Speed" : "Ускорение", value: "×5" }, { label: en ? "Errors" : "Ошибок", value: "-70%" }, { label: en ? "Timeline" : "Срок", value: en ? "10 days" : "10 дней" }] },
    { id: 3, cat: en ? "AI" : "AI", title: en ? "AI Sales Agent" : "AI-агент продаж", client: en ? "B2B Company" : "B2B компания", result: en ? "+120% leads" : "+120% лидов", tags: ["GPT-4", "n8n", "amoCRM"], type: "site", bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 50%, #0d0d1a 100%)", emoji: "🤖", brief: en ? "Managers were drowning in repetitive questions from leads. Conversion dropped due to slow responses." : "Менеджеры тонули в однотипных вопросах от лидов. Конверсия падала из-за долгого ответа.", solution: en ? "Telegram bot with AI answers questions, qualifies leads, passes hot ones to CRM. Integrated with amoCRM via n8n." : "Telegram-бот с AI отвечает на вопросы, квалифицирует лид, передаёт горячих в CRM. Интеграция с amoCRM через n8n.", metrics: [{ label: en ? "Conversion" : "Конверсия", value: "+120%" }, { label: en ? "Response time" : "Время ответа", value: "< 30 сек" }, { label: en ? "Timeline" : "Срок", value: en ? "14 days" : "14 дней" }] },
    { id: 4, cat: "Mini App", title: "DA-Motors Mini App", client: "DA-Motors", result: en ? "+80% leads" : "+80% заявок", tags: ["Telegram", "React", "Bot"], type: "site", bg: "linear-gradient(135deg, #1a0808 0%, #2d1010 50%, #1a0a0a 100%)", emoji: "🚗", featured: true, brief: en ? "Car dealer wanted to accept leads and show catalog directly in Telegram without a separate website." : "Авто-дилер хотел принимать заявки и показывать каталог прямо в Telegram без отдельного сайта.", solution: en ? "Telegram Mini App with car catalog, filters, and lead form. Real-time manager notifications." : "Telegram Mini App с каталогом автомобилей, фильтрами и формой заявки. Уведомления менеджеру в реальном времени.", metrics: [{ label: en ? "Leads" : "Заявок", value: "+80%" }, { label: en ? "Conversion" : "Конверсия", value: "12%" }, { label: en ? "Timeline" : "Срок", value: en ? "21 days" : "21 день" }] },
    { id: 5, cat: "Mini App", title: en ? "Private Club" : "Закрытый клуб", client: en ? "Info-business" : "Инфо-бизнес", result: en ? "500K₽/mo revenue" : "500K₽/мес доход", tags: ["Telegram", "Stars", "React"], type: "site", bg: "linear-gradient(135deg, #0d0d18 0%, #1a1a35 50%, #0a0a20 100%)", emoji: "💎", brief: en ? "Expert wanted to monetize Telegram audience — private club with paid access to materials." : "Эксперт хотел монетизировать аудиторию Telegram — закрытый клуб с платным доступом к материалам.", solution: en ? "Mini App with subscription, payments via Telegram Stars and YooKassa. Personal dashboard, lessons, expert chat." : "Mini App с подпиской, оплатой через Telegram Stars и ЮKassa. Личный кабинет, доступ к урокам, чат с экспертом.", metrics: [{ label: "MRR", value: "500K₽" }, { label: en ? "Members" : "Участников", value: "200+" }, { label: en ? "Timeline" : "Срок", value: en ? "18 days" : "18 дней" }] },
    { id: 6, cat: "Mini App", title: "Vision AI App", client: "Tech Startup", result: en ? "50K users" : "50K пользователей", tags: ["Telegram", "React", "Python"], type: "site", bg: "linear-gradient(135deg, #0d0818 0%, #180d35 50%, #0a0820 100%)", emoji: "📱", brief: en ? "Startup wanted a voice AI assistant inside Telegram for a mass audience." : "Стартап хотел голосовой AI-ассистент внутри Telegram для массовой аудитории.", solution: en ? "Telegram Mini App: voice recognition, AI responses, dialog history. Python FastAPI backend, GPT-4." : "Telegram Mini App: распознавание голоса, AI-ответы, история диалогов. Backend на Python FastAPI, GPT-4.", metrics: [{ label: en ? "Users" : "Пользователей", value: "50K" }, { label: "DAU", value: "12K" }, { label: en ? "Timeline" : "Срок", value: en ? "21 days" : "21 день" }] },
    { id: 7, cat: en ? "Websites" : "Сайты", title: en ? "AVIS — B2B Website" : "АВИС — B2B сайт", client: en ? "AVIS (Sochi)" : "АВИС (Сочи)", result: en ? "+200% leads" : "+200% заявок", tags: ["React", "Dark UI", "B2B"], type: "site", bg: "linear-gradient(135deg, #0a1020 0%, #152040 50%, #0a1530 100%)", emoji: "🛡️", brief: en ? "Engineering company (drone protection) needed a premium B2B website to attract corporate clients." : "Инженерная компания (защита от БПЛА) нуждалась в премиальном B2B-сайте для привлечения корпоративных клиентов.", solution: en ? "Dark premium design, product pages with tech specs, quote request form, SEO." : "Тёмный премиальный дизайн, продуктовые страницы с техническими характеристиками, форма запроса КП, SEO.", metrics: [{ label: en ? "Leads" : "Заявок", value: "+200%" }, { label: en ? "Time on site" : "Время на сайте", value: "+3 мин" }, { label: en ? "Timeline" : "Срок", value: en ? "14 days" : "14 дней" }] },
    { id: 8, cat: en ? "Websites" : "Сайты", title: en ? "Malov Method" : "Метод Малова", client: en ? "Evgeny Malov" : "Евгений Малов", result: en ? "+90% conversion" : "+90% конверсия", tags: ["React", "Lovable", en ? "Branding" : "Брендинг"], type: "site", bg: "linear-gradient(135deg, #1a0a05 0%, #2d1a0a 50%, #1a1005 100%)", emoji: "🔍", brief: en ? "Car selector wanted a website under personal brand with online diagnostics and lead system." : "Автоподборщик автомобилей хотел сайт под личный бренд с онлайн-диагностикой и системой заявок.", solution: en ? "Premium landing with brand identity (MEM logo, Benzin font), cost calculator and CRM integration." : "Премиальный лендинг с фирменным стилем (МЕМ логотип, шрифт Benzin), калькулятором стоимости и CRM-интеграцией.", metrics: [{ label: en ? "Conversion" : "Конверсия", value: "+90%" }, { label: en ? "Leads/mo" : "Заявок в мес", value: "120+" }, { label: en ? "Timeline" : "Срок", value: en ? "10 days" : "10 дней" }] },
    { id: 9, cat: en ? "Websites" : "Сайты", title: en ? "LIVEGRID — Real Estate" : "LIVEGRID — недвижимость", client: "Олег / Diamante", result: en ? "Platform from 0" : "Платформа с 0", tags: ["React", "Supabase", en ? "Filters" : "Фильтры"], type: "site", bg: "linear-gradient(135deg, #0a1628 0%, #1e4080 50%, #0a2040 100%)", emoji: "🏢", brief: en ? "Client wanted a modern real estate portal with advanced filtering and personal dashboards." : "Клиент хотел современный портал недвижимости с продвинутой фильтрацией и личными кабинетами.", solution: en ? "Full platform: property catalog, filters, comparison, buyer and developer dashboards. Supabase backend." : "Полноценная платформа: каталог объектов, фильтры, сравнение, ЛК покупателя и застройщика. Backend на Supabase.", metrics: [{ label: en ? "Properties" : "Объектов", value: "500+" }, { label: en ? "Filters" : "Фильтров", value: "24" }, { label: en ? "Timeline" : "Срок", value: en ? "6 weeks" : "6 недель" }] },
    { id: 10, cat: en ? "Platforms" : "Платформы", title: en ? "POVUZAM — EdTech" : "ПОВУЗАМ — EdTech", client: en ? "Education RF" : "Образование РФ", result: en ? "Federal scale" : "Федеральный масштаб", tags: ["React", "Node.js", "PostgreSQL"], type: "site", bg: "linear-gradient(135deg, #0a1a0a 0%, #153520 50%, #0a2015 100%)", emoji: "🎓", brief: en ? "Needed a platform connecting applicants with universities across Russia. Dashboards, rankings, program matching." : "Нужна платформа для связи абитуриентов с вузами по всей России. Личные кабинеты, рейтинги, подбор программ.", solution: en ? "Full EdTech platform: 500+ universities, smart matching by exams, dashboards, CRM for admissions." : "Полноценная EdTech платформа: 500+ вузов, умный подбор по ЕГЭ, личные кабинеты, CRM для приёмных комиссий.", metrics: [{ label: en ? "Universities" : "Вузов", value: "500+" }, { label: en ? "Budget" : "Бюджет", value: en ? "2M₽" : "2 млн₽" }, { label: en ? "Timeline" : "Срок", value: en ? "3 months" : "3 мес" }] },
    { id: 11, cat: en ? "Platforms" : "Платформы", title: "AI Aggregator", client: en ? "SaaS startup" : "SaaS стартап", result: en ? "10+ AI in one" : "10+ AI в одном", tags: ["React", "OpenAI", "Claude", "Flux"], type: "site", bg: "linear-gradient(135deg, #0d0818 0%, #200d35 50%, #0a0825 100%)", emoji: "⚡", brief: en ? "Team wanted a SaaS: all popular neural networks in one interface with a single subscription." : "Команда хотела SaaS: все популярные нейросети в одном интерфейсе с единой подпиской.", solution: en ? "Aggregator platform: GPT-4, Claude, Gemini, Midjourney, Flux in one window. Single balance, history, team access." : "Платформа-агрегатор: GPT-4, Claude, Gemini, Midjourney, Flux в одном окне. Единый баланс, история, командный доступ.", metrics: [{ label: en ? "AI models" : "AI моделей", value: "10+" }, { label: en ? "Subscribers" : "Подписчиков", value: "1K+" }, { label: en ? "Timeline" : "Срок", value: en ? "4 weeks" : "4 недели" }] },
    { id: 12, cat: en ? "Platforms" : "Платформы", title: "SkillChain", client: en ? "Startup" : "Стартап", result: en ? "Marketplace + learning" : "Биржа + обучение", tags: ["React", "Supabase", en ? "Gamification" : "Геймификация"], type: "site", bg: "linear-gradient(135deg, #0a0a1a 0%, #101535 50%, #080a20 100%)", emoji: "🔗", brief: en ? "Idea: platform where you can learn and immediately get real tasks. Like LinkedIn + Coursera + marketplace." : "Идея: платформа где можно учиться и сразу получать реальные задачи. Как LinkedIn + Coursera + биржа.", solution: en ? "Task marketplace with learning system, points for completion, performer ratings, and secure deals." : "Маркетплейс задач с системой обучения, баллами за выполнение, рейтингом исполнителей и безопасной сделкой.", metrics: [{ label: en ? "Tasks" : "Задач", value: "500+" }, { label: en ? "Specialists" : "Специалистов", value: "200+" }, { label: en ? "Timeline" : "Срок", value: en ? "5 weeks" : "5 недель" }] },
    { id: 13, cat: en ? "Videos" : "Ролики", title: en ? "Sovcombank — 3D Video" : "Совкомбанк — 3D ролик", client: en ? "Sovcombank" : "Совкомбанк", result: en ? "Corp. content" : "Корп. контент", tags: ["3D", "AI", en ? "Editing" : "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #0a1628 0%, #1a3060 50%, #0a2040 100%)", emoji: "🏦", brief: en ? "Bank needed a brand video about ruble and yuan for internal communications." : "Банку нужен был имиджевый ролик про рубль и юань для внутренних коммуникаций.", solution: en ? "3D coin animation, AI-generated scenes, professional editing. Style — corporate minimalism." : "3D-анимация монет, AI-генерация сцен, профессиональный монтаж. Стиль — корпоративный минимализм.", metrics: [{ label: en ? "Duration" : "Хронометраж", value: en ? "90 sec" : "90 сек" }, { label: en ? "Scenes" : "Сцен", value: "24" }, { label: en ? "Timeline" : "Срок", value: en ? "7 days" : "7 дней" }] },
    { id: 14, cat: en ? "Videos" : "Ролики", title: en ? "Akrikhin — Healthcare" : "Акрихин — медицина", client: en ? "Akrikhin" : "Акрихин", result: en ? "Product video" : "Продуктовый ролик", tags: ["AI Video", "Runway", en ? "Editing" : "Монтаж"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #0a1a15 0%, #0d3525 50%, #081a10 100%)", emoji: "💊", brief: en ? "Pharma company needed visualization of drug action for presentations and website." : "Фармкомпании нужна была визуализация действия препарата для презентаций и сайта.", solution: en ? "AI-generated medical scenes in Runway, 3D molecule visualization, professional voiceover." : "AI-генерация медицинских сцен в Runway, 3D-визуализация молекул, профессиональный закадровый голос.", metrics: [{ label: en ? "Views" : "Просмотров", value: "500K" }, { label: en ? "Conversion" : "Конверсия", value: "+35%" }, { label: en ? "Timeline" : "Срок", value: en ? "5 days" : "5 дней" }] },
    { id: 15, cat: en ? "Videos" : "Ролики", title: en ? "Industrial Video" : "Промышленный ролик", client: en ? "Manufacturing" : "Производство", result: en ? "2M views" : "2M просмотров", tags: ["Kling", "Runway", "Reels"], type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", bg: "linear-gradient(135deg, #1a0808 0%, #3d1010 50%, #1a0505 100%)", emoji: "🏭", brief: en ? "Manufacturing company wanted to showcase production beautifully — for social media and exhibitions." : "Промышленная компания хотела показать производство красиво — для соцсетей и выставок.", solution: en ? "AI-generated production scenes, dynamic Reels-style editing, professional soundtrack." : "AI-генерация производственных сцен, динамичный монтаж под тренд Reels, профессиональный саундтрек.", metrics: [{ label: en ? "Views" : "Просмотров", value: "2M" }, { label: en ? "Reach" : "Охват", value: "+300%" }, { label: en ? "Timeline" : "Срок", value: en ? "3 days" : "3 дня" }] },
  ];
};

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
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.45, ease, delay: index * 0.06 }}
    whileHover={{ scale: 1.02, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }} whileTap={{ scale: 0.99 }}
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
const WorkModal = ({ work, onClose, onNav, canNav, t }: { work: Work; onClose: () => void; onNav: (dir: -1 | 1) => void; canNav: boolean; t: (key: any) => string }) => {
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
                {t("wp.openSite")}
              </button>
            )}
          </div>
        )}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <X size={18} className="text-white" />
        </button>
      </div>

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
          <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">{t("wp.task")}</div>
          <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[15px] text-[#3A3A3A] leading-[1.65]">{work.brief}</div>
        </div>
        <div className="mb-6">
          <div className="font-body text-[12px] font-semibold uppercase tracking-[0.06em] text-[#B0B0B0] mb-2">{t("wp.solution")}</div>
          <div className="bg-[#F9F9F9] rounded-2xl p-4 font-body text-[15px] text-[#3A3A3A] leading-[1.65]">{work.solution}</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {work.tags.map((tg) => <span key={tg} className="bg-[#F0F0F0] rounded-full font-body text-[12px] font-semibold text-[#6A6860] px-3 py-1.5">{tg}</span>)}
        </div>

        <div className={isMobile ? "sticky bottom-0 bg-white pt-3 pb-[env(safe-area-inset-bottom)]" : ""}>
          <button onClick={() => { onClose(); navigate("/chat"); }} className="w-full bg-[#0D0D0B] text-white rounded-2xl py-4 font-body text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer">
            {t("wp.orderSimilar")} <ArrowRight size={16} />
          </button>
        </div>

        {canNav && (
          <div className="flex justify-between mt-3">
            <button onClick={() => onNav(-1)} className="font-body text-[13px] text-[#6A6860] hover:text-[#0D0D0B] transition-colors cursor-pointer">{t("wp.prev")}</button>
            <button onClick={() => onNav(1)} className="font-body text-[13px] text-[#6A6860] hover:text-[#0D0D0B] transition-colors cursor-pointer">{t("wp.next")}</button>
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
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Our Work – neeklo" : "Работы – neeklo");
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const works = getWorks(lang);

  const filterTabs = [
    { key: "all", label: t("wp.all") },
    { key: "sites", label: t("wp.sites") },
    { key: "videos", label: t("wp.videos") },
    { key: "mini-app", label: t("wp.miniApp") },
    { key: "ai", label: t("wp.ai") },
    { key: "platforms", label: t("wp.platforms") },
  ];

  const catMap: Record<string, string> = {
    sites: lang === "en" ? "Websites" : "Сайты",
    videos: lang === "en" ? "Videos" : "Ролики",
    "mini-app": "Mini App",
    ai: "AI",
    platforms: lang === "en" ? "Platforms" : "Платформы",
  };

  const filtered = activeFilter === "all" ? works : works.filter((w) => w.cat === catMap[activeFilter]);

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
      <div className="px-5 pt-8 md:px-10 md:pt-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-heading text-[22px] md:text-[28px] font-[800] text-[#0D0D0B]">{t("wp.title")}</h1>
          <span className="bg-[#0D0D0B] text-white rounded-full font-body text-[13px] font-semibold px-3 py-1.5">{t("wp.projectCount")}</span>
        </div>
        <p className="font-body text-[15px] text-[#6A6860] mt-1">{t("wp.subtitle")}</p>
      </div>

      <div className="sticky top-[64px] bg-white/95 backdrop-blur-md z-10 border-b border-[#F0F0F0] py-3 px-5 md:px-10 mt-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((f) => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} className={`whitespace-nowrap rounded-full font-body text-[13px] font-semibold px-4 py-1.5 transition-colors cursor-pointer ${activeFilter === f.key ? "bg-[#0D0D0B] text-white" : "border border-[#E0E0E0] text-[#6A6860] hover:border-[#B0B0B0]"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-10 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {filtered.map((w, i) => (
            <div key={w.id} className={w.featured ? "col-span-2 md:col-span-2" : ""} style={{ height: w.featured ? 280 : 220 }}>
              <WorkCard work={w} index={i} onClick={() => setSelectedWork(w)} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0D0D0B] text-center mt-10" style={{ padding: "48px 20px" }}>
        <h2 className="font-heading text-[24px] font-[800] text-white">{t("wp.ctaTitle")}</h2>
        <p className="font-body text-[15px] text-white/50 mt-2 mb-6">{t("wp.ctaSubtitle")}</p>
        <button onClick={() => navigate("/chat")} className="bg-white text-[#0D0D0B] rounded-2xl px-8 py-4 font-body text-[15px] font-bold cursor-pointer" style={{ transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#F0EEE8"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#fff"; }}>
          {t("wp.ctaButton")}
        </button>
      </div>

      <AnimatePresence>
        {selectedWork && <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} onNav={handleNav} canNav={filtered.length > 1} t={t} />}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default WorksPage;
