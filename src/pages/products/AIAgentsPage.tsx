import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, FileSearch, FileText, PenTool, Inbox, Database,
  TrendingUp, Calendar, Link2, Zap, BookOpen, Building,
  ChevronDown, ArrowRight,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const NICHES = [
  { label: "Юристы",             key: "legal" },
  { label: "Клиники",            key: "clinic" },
  { label: "Недвижимость",       key: "realty" },
  { label: "Строительство",      key: "construction" },
  { label: "Отделы продаж",      key: "sales" },
  { label: "Производство",       key: "manufacturing" },
  { label: "Образование",        key: "edu" },
  { label: "Сервисные компании", key: "service" },
] as const;

type NicheKey = (typeof NICHES)[number]["key"];

const NICHE_SUBTITLES: Record<NicheKey, string> = {
  legal:         "Анализирует договоры, отвечает на типовые вопросы, составляет КП.",
  clinic:        "Записывает пациентов, отвечает на вопросы о ценах и процедурах.",
  realty:        "Подбирает объекты по параметрам, отвечает 24/7, передаёт горячих.",
  construction:  "Рассчитывает сметы, отвечает на вопросы о материалах и сроках.",
  sales:         "Квалифицирует лиды, создаёт КП, помогает менеджерам закрывать сделки.",
  manufacturing: "Принимает заявки, обрабатывает спецификации, отвечает на технические вопросы.",
  edu:           "Консультирует по программам, помогает студентам, автоматизирует онбординг.",
  service:       "Принимает заявки, назначает мастеров, отправляет уведомления клиентам.",
};

const CAPABILITIES = [
  { icon: MessageCircle, text: "Отвечает клиентам 24/7" },
  { icon: FileSearch,    text: "Анализирует документы и договоры" },
  { icon: FileText,      text: "Создаёт коммерческие предложения" },
  { icon: PenTool,       text: "Работает с контентом" },
  { icon: Inbox,         text: "Обрабатывает входящие заявки" },
  { icon: Database,      text: "Собирает и структурирует данные" },
  { icon: TrendingUp,    text: "Помогает отделу продаж" },
  { icon: Calendar,      text: "Публикует материалы по расписанию" },
  { icon: Link2,         text: "Интегрируется с CRM и Telegram" },
  { icon: Zap,           text: "Автоматизирует рутинные процессы" },
  { icon: BookOpen,      text: "Анализирует и суммаризирует тексты" },
  { icon: Building,      text: "Работает в корпоративных системах" },
];

const EXAMPLES = [
  { title: "AI для юристов",          desc: "Анализ договоров" },
  { title: "Telegram-парсер",         desc: "Сбор данных из каналов" },
  { title: "Контент-агент",           desc: "Автопостинг в соцсети" },
  { title: "AI помощник продаж",      desc: "Квалификация лидов" },
  { title: "Корпоративная база знаний", desc: "Ответы сотрудникам" },
  { title: "AI для клиники",          desc: "Запись и FAQ" },
];

const STATS = [
  { value: "70%",     label: "рутинных задач автоматизируется" },
  { value: "10-14 дн", label: "от ТЗ до рабочего агента" },
  { value: "24/7",    label: "работает без выходных и праздников" },
];

const BRIEF_STEPS = [
  { title: "Какая главная задача?",         options: ["Отвечать клиентам", "Анализировать документы", "Создавать КП", "Другое"] },
  { title: "Где будет работать?",           options: ["На сайте", "В Telegram", "Внутри компании", "Везде"] },
  { title: "Объём данных для обучения?",   options: ["Небольшой (FAQ, прайс)", "Средний (документы, база)", "Большой (корпоративная система)"] },
];

const FAQ_ITEMS = [
  { q: "На чём основан ИИ агент?",           a: "На базе любой модели на выбор — DeepSeek, Gemini, GPT-4 и Claude. Обучаем на ваших данных — документах, FAQ, базе знаний." },
  { q: "Может ли агент ошибаться?",          a: "Да, поэтому настраиваем ограничения и эскалацию на живого менеджера при сложных случаях." },
  { q: "Нужен ли программист для поддержки?", a: "Нет. Обновлять базу знаний можно через простой интерфейс или Notion." },
  { q: "Как долго настройка?",               a: "От 10-14 дней для базового агента. Сложные корпоративные системы — от 21 дня." },
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
        <p className="text-2xl font-bold" style={{ color: "var(--tx)" }}>от 85 000 ₽ · от 7 дней</p>
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

export default function AIAgentsPage() {
  const [activeNiche, setActiveNiche] = useState<NicheKey>("legal");

  usePageMeta({
    title: "ИИ агент для бизнеса — автоматизация и Telegram-боты | neeklo",
    description: "Разрабатываем ИИ ассистентов, автоматизацию процессов и Telegram-ботов для бизнеса. От 85 000 ₽. Старт от 7 дней.",
    og: { url: "/products/ai-agents" },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* HERO */}
      <section className="px-4 pt-10 pb-8 md:pt-16 md:pb-12 max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Услуги", href: "/services" }, { label: "AI-агенты" }]} />
        <span className="inline-block text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--tx-muted)" }}>
          AI · АВТОМАТИЗАЦИЯ
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-3" style={{ color: "var(--tx)" }}>
          ИИ агент<br />для бизнеса
        </h1>
        <p className="text-sm md:text-base mb-3 max-w-lg" style={{ color: "var(--tx-muted)" }}>
          Отвечает клиентам, анализирует документы, собирает данные и передаёт готовые заявки менеджеру
        </p>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm" style={{ color: "var(--tx)" }}>+ Telegram-боты, контент-агенты и корпоративные системы</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <span className="text-3xl font-bold" style={{ color: "var(--tx)" }}>от 85 000 ₽</span>
          <span className="text-sm" style={{ color: "var(--tx-muted)" }}>от 7 дней</span>
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

      {/* CAPABILITIES */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>Что умеет AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CAPABILITIES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon size={16} style={{ color: "var(--ac-b)" }} className="shrink-0" />
              <span className="text-sm" style={{ color: "var(--tx)" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>Что мы уже делали</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLES.map(ex => (
            <div
              key={ex.title}
              className="rounded-2xl p-5 transition-opacity hover:opacity-80"
              style={{ border: "1px solid var(--bd)", background: "var(--surface-2)" }}
            >
              <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>{ex.title}</p>
              <p className="text-xs mt-1" style={{ color: "var(--tx-muted)" }}>{ex.desc}</p>
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
          <h2 className="text-2xl md:text-3xl font-bold">Готовы автоматизировать?</h2>
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
