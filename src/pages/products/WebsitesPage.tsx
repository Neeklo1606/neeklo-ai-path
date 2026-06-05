import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Smartphone, Inbox, Settings, Bot, Globe, Server,
  MapPin, Search, FileText, BarChart, GraduationCap,
  ChevronDown, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const NICHES = [
  { label: "Клиника / стоматология", key: "clinic" },
  { label: "Салон красоты",          key: "salon" },
  { label: "Недвижимость",           key: "realty" },
  { label: "Строительство",          key: "construction" },
  { label: "Интернет-магазин",       key: "shop" },
  { label: "Производство",           key: "manufacturing" },
  { label: "Онлайн-школа",           key: "edu" },
  { label: "Эксперты и блогеры",     key: "experts" },
  { label: "Юридические компании",   key: "legal" },
  { label: "Любой бизнес",           key: "any" },
] as const;

type NicheKey = (typeof NICHES)[number]["key"];

const NICHE_SUBTITLES: Record<NicheKey, string> = {
  clinic:       "Запись пациентов онлайн. AI отвечает на вопросы о процедурах и ценах.",
  salon:        "Клиент сам выбирает мастера и время. Без звонков и ожидания.",
  realty:       "Каталог объектов, заявки, AI-консультант по выбору.",
  construction: "Портфолио работ, расчёт стоимости, заявки 24/7.",
  shop:         "Каталог, корзина, оплата, AI-помощник по выбору товара.",
  manufacturing:"Каталог продукции, оптовые заявки, личный кабинет клиента.",
  edu:          "Продажа курсов, личный кабинет ученика, AI-поддержка студентов.",
  experts:      "Личный бренд, продажа услуг, запись на консультации.",
  legal:        "Портфолио дел, AI-консультант по типовым вопросам, запись.",
  any:          "Создаём сайт, который принимает заявки и отвечает клиентам 24/7.",
};

const INCLUDES = [
  { icon: Palette,       text: "Дизайн и разработка" },
  { icon: Smartphone,    text: "Адаптация под мобильные" },
  { icon: Inbox,         text: "CRM для заявок" },
  { icon: Settings,      text: "Административная панель" },
  { icon: Bot,           text: "AI-ассистент" },
  { icon: Globe,         text: "Подключение домена и хостинга" },
  { icon: Server,        text: "Размещение на сервере" },
  { icon: MapPin,        text: "Регистрация в Яндекс Бизнес" },
  { icon: Search,        text: "Базовая SEO-настройка" },
  { icon: FileText,      text: "Помощь с наполнением контентом" },
  { icon: BarChart,      text: "Аналитика и формы заявок" },
  { icon: GraduationCap, text: "Обучение работе с системой" },
];

const BEFORE_AFTER = [
  { before: "Менеджер не успевает отвечать ночью",  after: "AI отвечает за 30 секунд в любое время" },
  { before: "Заявки теряются в мессенджерах",       after: "CRM фиксирует каждое обращение" },
  { before: "Клиент не может записаться сам",       after: "Онлайн-запись без звонков" },
];

const STATS = [
  { value: "69%",   label: "вопросов AI закрывает без менеджера" },
  { value: "14 дн", label: "от брифа до запуска" },
  { value: "24/7",  label: "приём заявок без выходных" },
];

const BRIEF_STEPS = [
  { title: "Какой у вас бизнес?",   options: ["Клиника", "Салон", "Магазин", "Агентство", "Стартап", "Другое"] },
  { title: "Главная задача?",        options: ["Больше заявок", "Автоматизировать ответы", "Продажи онлайн", "Всё сразу"] },
  { title: "Когда нужно?",           options: ["Срочно (до 2 недель)", "В течение месяца", "Планирую"] },
];

const FAQ_ITEMS = [
  { q: "Нужен ли AI-ассистент если у меня маленький сайт?",  a: "Если вы получаете хотя бы одну заявку в день — нужен. Он работает пока вы спите." },
  { q: "Сколько займёт разработка?",                         a: "Базовый проект — 14 дней с момента согласования. Сложные платформы — от 30 дней." },
  { q: "Что если мне потом понадобится что-то добавить?",    a: "Архитектура строится с расчётом на рост. Добавить функции можно в любой момент." },
  { q: "Нужно ли мне разбираться в технических деталях?",   a: "Нет. Вы получаете готовую систему с обучением и документацией." },
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
        <ChevronDown
          size={16}
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
          style={{ color: "var(--tx-muted)" }}
        />
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
        <p className="text-3xl font-bold" style={{ color: "var(--tx)" }}>от 65 000 ₽</p>
        <p className="text-sm" style={{ color: "var(--tx-muted)" }}>Базовый пакет: сайт + ассистент + CRM</p>
        <a
          href="https://t.me/neeekn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: "var(--tx)", color: "var(--bg)" }}
        >
          Обсудить детали <ArrowRight size={14} />
        </a>
        <button onClick={reset} className="text-xs underline" style={{ color: "var(--tx-muted)" }}>
          Начать заново
        </button>
      </div>
    );
  }

  const current = BRIEF_STEPS[step];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {BRIEF_STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? "var(--ac-b)" : "var(--bd)" }}
          />
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
            style={{
              border: "1px solid var(--bd)",
              color: "var(--tx-muted)",
              background: "var(--surface-2)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ac-b)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--tx)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--tx-muted)";
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WebsitesPage() {
  const [activeNiche, setActiveNiche] = useState<NicheKey>("any");

  usePageMeta({
    title: "Разработка сайтов под ключ | Сайты, CRM и платформы — neeklo",
    description: "Создаём сайты, интернет-магазины и платформы с CRM, ИИ ассистентом и Админ панелью. От лендингов до сложных веб-систем. От 65 000 ₽",
    og: { url: "/products/websites" },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* HERO */}
      <section className="px-4 pt-10 pb-8 md:pt-16 md:pb-12 max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Услуги", href: "/services" }, { label: "Сайты" }]} />
        <span className="inline-block text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--tx-muted)" }}>
          РАЗРАБОТКА · ПОД КЛЮЧ
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-3" style={{ color: "var(--tx)" }}>
          Сайт под ключ<br />для бизнеса
        </h1>
        <p className="text-sm md:text-base mb-3" style={{ color: "var(--tx-muted)" }}>
          С ИИ ассистентом, CRM и заявками в одной системе
        </p>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm" style={{ color: "var(--tx)" }}>+ Админ панель для управления контентом</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <span className="text-3xl font-bold" style={{ color: "var(--tx)" }}>от 65 000 ₽</span>
          <span className="text-sm" style={{ color: "var(--tx-muted)" }}>от 14 дней</span>
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
        <div className="overflow-x-auto px-4 -mx-0">
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

      {/* WHAT'S INCLUDED */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>
          Что входит в стоимость
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INCLUDES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon size={16} style={{ color: "var(--ac-b)" }} className="shrink-0" />
              <span className="text-sm" style={{ color: "var(--tx)" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: "var(--tx)" }}>Что изменится</h2>
        <div className="space-y-4">
          {BEFORE_AFTER.map(({ before, after }, i) => (
            <div key={i} className="flex flex-col md:flex-row items-stretch gap-3">
              <div className="flex-1 px-4 py-3 rounded-xl text-sm" style={{ background: "var(--surface-2)", color: "var(--tx-muted)" }}>
                {before}
              </div>
              <div className="flex items-center justify-center self-center">
                <span className="font-bold hidden md:block" style={{ color: "var(--ac-b)" }}>→</span>
                <span className="font-bold md:hidden" style={{ color: "var(--ac-b)" }}>↓</span>
              </div>
              <div className="flex-1 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "color-mix(in srgb, var(--ac-b) 10%, transparent)", color: "var(--tx)" }}>
                {after}
              </div>
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

      {/* CASES */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--tx)" }}>Примеры наших работ</h2>
          <Link to="/cases" className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "var(--ac-b)" }}>
            Все работы <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Сайт для клиники",    gradient: "from-blue-500/20 to-purple-500/20" },
            { title: "Интернет-магазин",    gradient: "from-green-500/20 to-emerald-500/20" },
            { title: "Корпоративный сайт",  gradient: "from-orange-500/20 to-amber-500/20" },
          ].map(c => (
            <Link
              key={c.title}
              to="/cases"
              className="block rounded-2xl overflow-hidden transition-opacity hover:opacity-80"
              style={{ border: "1px solid var(--bd)" }}
            >
              <div className={cn("h-40 bg-gradient-to-br", c.gradient, "flex items-end p-4")}>
                <span className="font-semibold text-sm" style={{ color: "var(--tx)" }}>{c.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MINI BRIEF */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "var(--tx)" }}>
          Рассчитать стоимость за 2 минуты
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--tx-muted)" }}>Ответьте на 3 вопроса</p>
        <div className="max-w-sm">
          <MiniBrief />
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-4 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: "var(--tx)" }}>Как работаем</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", title: "Обсуждаем",  desc: "Созвон или переписка, фиксируем стоимость до старта" },
            { num: "02", title: "Делаем",     desc: "Показываем прогресс каждые 2-3 дня" },
            { num: "03", title: "Запускаем",  desc: "Сдаём, обучаем, остаёмся на связи" },
          ].map(({ num, title, desc }) => (
            <div key={num} className="space-y-2">
              <span className="text-4xl font-bold" style={{ color: "color-mix(in srgb, var(--ac-b) 30%, transparent)" }}>{num}</span>
              <p className="font-semibold" style={{ color: "var(--tx)" }}>{title}</p>
              <p className="text-sm" style={{ color: "var(--tx-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
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
          <h2 className="text-2xl md:text-3xl font-bold">Готовы начать?</h2>
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
