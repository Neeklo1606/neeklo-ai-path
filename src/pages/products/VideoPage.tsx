import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Smartphone, Sparkles, Film, Star, Building,
  Monitor, Tv, Gift, ShoppingBag, Mic, Scissors,
  ChevronDown, ArrowRight,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const NICHES = [
  { label: "Недвижимость",  key: "realty" },
  { label: "Клиники",       key: "clinic" },
  { label: "Рестораны",     key: "restaurant" },
  { label: "Производство",  key: "manufacturing" },
  { label: "Онлайн-школы", key: "edu" },
  { label: "Бренды",        key: "brand" },
  { label: "Эксперты",      key: "experts" },
  { label: "B2B",           key: "b2b" },
] as const;

type NicheKey = (typeof NICHES)[number]["key"];

const NICHE_SUBTITLES: Record<NicheKey, string> = {
  realty:        "Обзоры объектов, рекламные ролики для Авито и соцсетей.",
  clinic:        "Ролики о процедурах, врачах и результатах для доверия пациентов.",
  restaurant:    "Аппетитные Reels и рекламные ролики для привлечения гостей.",
  manufacturing: "Презентация продукции, корпоративные ролики, обзоры для B2B.",
  edu:           "Промо курсов, анимированные объяснения, контент для соцсетей.",
  brand:         "Имиджевые ролики, рекламные кампании, визуальный стиль бренда.",
  experts:       "Личный бренд, экспертный контент, Reels для роста аудитории.",
  b2b:           "Презентации продуктов, обучающие ролики, корпоративный видеоконтент.",
};

const SERVICES = [
  { icon: Play,        text: "Рекламные ролики для соцсетей" },
  { icon: Smartphone,  text: "Reels и TikTok" },
  { icon: Sparkles,    text: "AI-генерация видео" },
  { icon: Film,        text: "Анимация и моушн-дизайн" },
  { icon: Star,        text: "Мультфильмы и мультсериалы" },
  { icon: Building,    text: "Корпоративные ролики" },
  { icon: Monitor,     text: "Презентации продуктов" },
  { icon: Tv,          text: "Ролики для рекламы и ТВ" },
  { icon: Gift,        text: "Поздравительные видео" },
  { icon: ShoppingBag, text: "Контент для Авито и маркетплейсов" },
  { icon: Mic,         text: "Озвучка и субтитры" },
  { icon: Scissors,    text: "Полный монтаж под ключ" },
];

const PROCESS_STEPS = ["Сценарий", "Генерация", "Монтаж", "Озвучка", "Публикация"];

const STATS = [
  { value: "100+",  label: "проектов в портфолио" },
  { value: "1 день", label: "минимальный срок ролика" },
  { value: "3-5 дн", label: "стандартный Reels под ключ" },
];

const BRIEF_STEPS = [
  { title: "Что нужно сделать?",         options: ["Рекламный ролик", "Reels", "ИИ видео", "Мультик", "Другое"] },
  { title: "Где будет использоваться?",  options: ["Соцсети", "Реклама", "Сайт", "Всё"] },
  { title: "Сколько роликов?",           options: ["1 ролик", "2-5 роликов", "Регулярный контент"] },
];

const FAQ_ITEMS = [
  { q: "Нужно ли мне что-то записывать самому?", a: "Нет. Используем AI-генерацию, стоковые материалы и ваши фото/видео если есть." },
  { q: "Можно ли с реальным лицом или голосом?", a: "Да — через HeyGen создадим AI-аватара или используем запись вашего голоса." },
  { q: "Сколько правок включено?",              a: "До 3 итераций на каждый ролик." },
  { q: "Подойдёт ли для таргетированной рекламы?", a: "Да, делаем под технические требования VK, Telegram, YouTube, Авито." },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--bd)" }} className="last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        style={{ color: "var(--tx)" }}
      >
        <span className="font-medium text-sm md:text-base">{q}</span>
        <ChevronDown size={16} className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")} style={{ color: "var(--tx-muted)" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--tx-muted)" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniBrief() {
  const [step, setStep]       = useState(0);
  const [done, setDone]       = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const select = (opt: string) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (step < BRIEF_STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const reset = () => { setStep(0); setDone(false); setAnswers([]); };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold" style={{ color: "var(--tx)" }}>от 15 000 ₽ за ролик</p>
        <a
          href="https://t.me/neeekn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: "var(--tx)", color: "var(--bg)" }}
        >
          Обсудить детали <ArrowRight size={14} />
        </a>
        <button onClick={reset} className="text-xs underline" style={{ color: "var(--tx-muted)" }}>Начать заново</button>
      </div>
    );
  }

  const current = BRIEF_STEPS[step];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {BRIEF_STEPS.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{ background: i <= step ? "var(--ac-b)" : "var(--bd)" }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: "var(--tx-muted)" }}>Шаг {step + 1} из {BRIEF_STEPS.length}</p>
      <p className="font-semibold text-sm md:text-base" style={{ color: "var(--tx)" }}>{current.title}</p>
      <div className="grid grid-cols-2 gap-2">
        {current.options.map(opt => (
          <button
            key={opt}
            onClick={() => select(opt)}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-150"
            style={{ border: "1px solid var(--bd)", color: "var(--tx-muted)", background: "var(--surface-2)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ac-b)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--tx)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd)";   (e.currentTarget as HTMLButtonElement).style.color = "var(--tx-muted)"; }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VideoPage() {
  const [activeNiche, setActiveNiche] = useState<NicheKey>("realty");

  usePageMeta({
    title: "ИИ видео и контент для бизнеса — рекламные ролики, Reels | neeklo",
    description: "Создаём рекламные ролики, Reels, ИИ видео и анимацию для бизнеса. Полный цикл: сценарий → генерация → монтаж → озвучка. От 15 000 ₽.",
    og: { url: "/products/video" },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* HERO */}
      <section className="px-4 pt-10 pb-8 md:pt-16 md:pb-12 max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Услуги", href: "/services" }, { label: "Видео" }]} />
        <span className="inline-block text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--tx-muted)" }}>
          ПРОДАКШН · AI-ВИДЕО
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-3" style={{ color: "var(--tx)" }}>
          ИИ видео и контент<br />для бизнеса
        </h1>
        <p className="text-sm md:text-base mb-3 max-w-lg" style={{ color: "var(--tx-muted)" }}>
          Рекламные ролики, Reels, ИИ видео и анимация для сайта, соцсетей и рекламы
        </p>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm" style={{ color: "var(--tx)" }}>+ Мультсериалы, поздравления, корпоративные ролики под ключ</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <span className="text-3xl font-bold" style={{ color: "var(--tx)" }}>от 15 000 ₽</span>
          <span className="text-sm" style={{ color: "var(--tx-muted)" }}>от 1 дня</span>
        </div>
        <a
          href="https://t.me/neeekn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: "var(--tx)", color: "var(--bg)" }}
        >
          Обсудить проект <ArrowRight size={14} />
        </a>
      </section>

      {/* NICHE SWITCHER */}
      <section className="pb-10 max-w-5xl mx-auto">
        <div className="overflow-x-auto px-4">
          <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
            {NICHES.map(n => (
              <button
                key={n.key}
                onClick={() => setActiveNiche(n.key)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
                style={
                  activeNiche === n.key
                    ? { background: "var(--tx)", color: "var(--bg)" }
                    : { background: "var(--surface-2)", color: "var(--tx-muted)", border: "1px solid var(--bd)" }
                }
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeNiche}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="mt-4 px-4 text-sm md:text-base"
            style={{ color: "var(--tx-muted)" }}
          >
            {NICHE_SUBTITLES[activeNiche]}
          </motion.p>
        </AnimatePresence>
      </section>

      {/* SERVICES */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>Что делаем</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon size={16} style={{ color: "var(--ac-b)" }} className="shrink-0" />
              <span className="text-sm" style={{ color: "var(--tx)" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>Как это работает</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          {PROCESS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div>
                <span className="text-[10px] font-semibold" style={{ color: "var(--tx-muted)" }}>{String(i + 1).padStart(2, "0")}</span>
                <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>{s}</p>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <span className="font-bold hidden md:block" style={{ color: "var(--bd)" }}>→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <div className="flex flex-row gap-6 md:gap-16">
          {STATS.map(({ value, label }) => (
            <div key={value} className="flex-1 min-w-0">
              <p className="text-3xl md:text-4xl font-bold" style={{ color: "var(--ac-b)" }}>{value}</p>
              <p className="text-xs md:text-sm mt-1" style={{ color: "var(--tx-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: "var(--tx)" }}>Примеры работ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "AI-анимация",      gradient: "from-violet-500/20 to-pink-500/20" },
            { title: "Рекламный ролик",  gradient: "from-blue-500/20 to-cyan-500/20" },
            { title: "Corporate",        gradient: "from-amber-500/20 to-orange-500/20" },
          ].map(c => (
            <div
              key={c.title}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--bd)" }}
            >
              <div className={cn("h-40 bg-gradient-to-br", c.gradient, "flex items-center justify-center")}>
                <Play size={40} style={{ color: "var(--tx-faint)" }} />
              </div>
              <div className="p-3">
                <span className="text-sm font-medium" style={{ color: "var(--tx)" }}>{c.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MINI BRIEF */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "var(--tx)" }}>Рассчитать стоимость за 2 минуты</h2>
        <p className="text-sm mb-8" style={{ color: "var(--tx-muted)" }}>Ответьте на 3 вопроса</p>
        <div className="max-w-sm"><MiniBrief /></div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: "var(--tx)" }}>Частые вопросы</h2>
        {FAQ_ITEMS.map(item => <FaqItem key={item.q} {...item} />)}
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-14 md:py-20">
        <div
          className="max-w-5xl mx-auto rounded-2xl px-8 py-12 text-center space-y-4"
          style={{ background: "var(--tx)", color: "var(--bg)" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold">Готовы снять?</h2>
          <p className="text-sm opacity-70">Отвечаем в течение 2 часов. Без оплаты на старте.</p>
          <a
            href="https://t.me/neeekn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
            style={{ background: "var(--ac-b)", color: "#fff" }}
          >
            Начать проект <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
