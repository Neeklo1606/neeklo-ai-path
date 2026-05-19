export type ServiceSolution = {
  id: string;
  emoji: string;
  name: { ru: string; en: string };
  desc: { ru: string; en: string };
  outcome: { ru: string; en: string };
  price: { ru: string; en: string };
  duration: { ru: string; en: string };
  path: string;
  chipLabel: { ru: string; en: string };
  badge?: { ru: string; en: string };
};

export const SOLUTIONS: ServiceSolution[] = [
  {
    id: "ai-video",
    emoji: "🎬",
    name: { ru: "AI-ролики", en: "AI Video" },
    desc: { ru: "Продающий контент с AI-генерацией: сценарий, озвучка, монтаж.", en: "Sales content with AI: script, voiceover, edit." },
    outcome: { ru: "Готовые видео для соцсетей и рекламных кампаний", en: "Ready videos for social media and ad campaigns" },
    price: { ru: "от 15 000 ₽", en: "from $150" },
    duration: { ru: "2–5 дней", en: "2–5 days" },
    path: "/services/ai-video",
    chipLabel: { ru: "AI-ролик", en: "AI Video" },
  },
  {
    id: "web",
    emoji: "🌐",
    name: { ru: "Сайт под ключ", en: "Website" },
    desc: { ru: "Landing, корпоративный или интернет-магазин с дизайном и деплоем.", en: "Landing, corporate or e-commerce with design and deploy." },
    outcome: { ru: "Работающий сайт с формой заявки, аналитикой и CMS", en: "Live site with lead form, analytics and CMS" },
    price: { ru: "от 80 000 ₽", en: "from $800" },
    duration: { ru: "7–21 день", en: "7–21 days" },
    path: "/services/web",
    chipLabel: { ru: "Сайт", en: "Website" },
    badge: { ru: "Популярный старт", en: "Popular start" },
  },
  {
    id: "telegram",
    emoji: "✈️",
    name: { ru: "Telegram Mini App", en: "Telegram App" },
    desc: { ru: "Мини-приложение внутри Telegram: каталог, запись, витрина.", en: "Mini-app inside Telegram: catalog, booking, storefront." },
    outcome: { ru: "Каталог, запись или магазин прямо в Telegram", en: "Catalog, booking or store right inside Telegram" },
    price: { ru: "от 120 000 ₽", en: "from $1 200" },
    duration: { ru: "10–30 дней", en: "10–30 days" },
    path: "/services/telegram",
    chipLabel: { ru: "Telegram", en: "Telegram" },
  },
  {
    id: "ai-assistant",
    emoji: "🤖",
    name: { ru: "AI-ассистент", en: "AI Assistant" },
    desc: { ru: "Отвечает на вопросы, квалифицирует лиды и никогда не устаёт.", en: "Answers questions, qualifies leads and never gets tired." },
    outcome: { ru: "Бот отвечает на заявки 24/7, квалифицирует лидов", en: "Bot answers leads 24/7 and qualifies them automatically" },
    price: { ru: "от 50 000 ₽", en: "from $500" },
    duration: { ru: "от 7 дней", en: "from 7 days" },
    path: "/services/ai-assistant",
    chipLabel: { ru: "AI-ассистент", en: "AI Assistant" },
  },
  {
    id: "education",
    emoji: "📚",
    name: { ru: "AI-обучение", en: "AI Training" },
    desc: { ru: "Обучим команду работать с AI: от промптинга до автоматизации.", en: "Train your team to use AI: from prompting to automation." },
    outcome: { ru: "Команда работает с AI без найма новых сотрудников", en: "Team uses AI without hiring new staff" },
    price: { ru: "от 40 000 ₽", en: "from $400" },
    duration: { ru: "1–3 дня", en: "1–3 days" },
    path: "/services/education",
    chipLabel: { ru: "Обучение", en: "Training" },
  },
];

export type CaseItem = {
  id: string;
  cat: { ru: string; en: string };
  title: { ru: string; en: string };
  what: { ru: string; en: string };
  result: { ru: string; en: string };
  featured?: boolean;
  bg: string;
};

export const CASES: CaseItem[] = [
  {
    id: "avito-bot",
    cat: { ru: "AI-ассистент", en: "AI Assistant" },
    title: { ru: "AI-помощник для Авито", en: "AI helper for Avito" },
    what: { ru: "Автоматизировали обработку входящих запросов", en: "Automated incoming request processing" },
    result: { ru: "80% запросов без менеджера", en: "80% requests without manager" },
    featured: true,
    bg: "linear-gradient(135deg, #0f0f1a 0%, #1a1040 100%)",
  },
  {
    id: "shop-webapp",
    cat: { ru: "Telegram Mini App", en: "Telegram App" },
    title: { ru: "Каталог-витрина в Telegram", en: "Telegram storefront catalog" },
    what: { ru: "Собрали Mini App с каталогом и системой заявок", en: "Built Mini App with catalog and lead system" },
    result: { ru: "+40% конверсия в заказ", en: "+40% order conversion" },
    bg: "linear-gradient(135deg, #0d1a0d 0%, #0a3020 100%)",
  },
  {
    id: "startup-landing",
    cat: { ru: "Сайт", en: "Website" },
    title: { ru: "Landing для SaaS-стартапа", en: "SaaS startup landing" },
    what: { ru: "Сайт с конверсионной воронкой и аналитикой", en: "Site with conversion funnel and analytics" },
    result: { ru: "48 часов от брифа до деплоя", en: "48h from brief to deploy" },
    bg: "linear-gradient(135deg, #1a0d0d 0%, #2d1010 100%)",
  },
];

export type ProcessStep = {
  num: string;
  title: { ru: string; en: string };
  desc: { ru: string; en: string };
  outcome: { ru: string; en: string };
};

export const PROCESS_STEPS: ProcessStep[] = [
  { num: "01", title: { ru: "Задача", en: "Task" }, desc: { ru: "Расскажите о проекте в чате или через бриф", en: "Tell us about the project in chat or brief" }, outcome: { ru: "Ответ в течение 2 часов", en: "Response within 2 hours" } },
  { num: "02", title: { ru: "Концепт", en: "Concept" }, desc: { ru: "Показываем идею, смету и сроки", en: "We show idea, estimate and timeline" }, outcome: { ru: "Смета и план проекта на руках", en: "Estimate and project plan in hand" } },
  { num: "03", title: { ru: "Разработка", en: "Development" }, desc: { ru: "Делаем итерациями, согласовываем каждый этап", en: "We build in iterations, reviewing each stage" }, outcome: { ru: "Показы каждые 2–3 дня, итерируем вместе", en: "Demos every 2–3 days, we iterate together" } },
  { num: "04", title: { ru: "Запуск", en: "Launch" }, desc: { ru: "Релизим, настраиваем и поддерживаем", en: "We launch, configure and support" }, outcome: { ru: "Все доступы и документация ваши", en: "All access and documentation are yours" } },
];

export type StatItem = {
  value: string;
  label: { ru: string; en: string };
};

export const STATS: StatItem[] = [
  { value: "50+", label: { ru: "проектов запущено", en: "projects launched" } },
  { value: "48ч", label: { ru: "среднее время старта", en: "avg. start time" } },
  { value: "5", label: { ru: "лет в AI и digital", en: "years in AI & digital" } },
  { value: "98%", label: { ru: "клиентов возвращаются", en: "clients return" } },
];

export type PlanCard = {
  id: string;
  name: { ru: string; en: string };
  price: { ru: string; en: string };
  period: { ru: string; en: string };
  desc: { ru: string; en: string };
  features: { ru: string; en: string }[];
  featured: boolean;
  cta: { ru: string; en: string };
};

export const PLANS: PlanCard[] = [
  {
    id: "basic",
    name: { ru: "Базовое", en: "Basic" },
    price: { ru: "15 000 ₽", en: "$150" },
    period: { ru: "/ мес", en: "/ mo" },
    desc: { ru: "Поддержка и мелкие правки", en: "Support and minor edits" },
    features: [
      { ru: "До 5 правок в месяц", en: "Up to 5 edits per month" },
      { ru: "Мониторинг и обновления", en: "Monitoring & updates" },
      { ru: "Ответ в течение 24 часов", en: "Response within 24 hours" },
    ],
    featured: false,
    cta: { ru: "Подключить", en: "Get started" },
  },
  {
    id: "pro",
    name: { ru: "Расширенное", en: "Pro" },
    price: { ru: "40 000 ₽", en: "$400" },
    period: { ru: "/ мес", en: "/ mo" },
    desc: { ru: "Приоритетная поддержка + развитие", en: "Priority support + development" },
    features: [
      { ru: "Безлимит мелких правок", en: "Unlimited minor edits" },
      { ru: "8ч/мес разработки", en: "8h/mo development" },
      { ru: "Ответ в течение 4 часов", en: "Response within 4 hours" },
      { ru: "Выделенный менеджер", en: "Dedicated manager" },
    ],
    featured: true,
    cta: { ru: "Подключить", en: "Get started" },
  },
];

export const BUDGET_OPTIONS = [
  { id: "under50", ru: "до 50 000 ₽", en: "under $500" },
  { id: "50to150", ru: "50 000 – 150 000 ₽", en: "$500 – $1 500" },
  { id: "150plus", ru: "150 000 ₽+", en: "$1 500+" },
  { id: "unknown", ru: "Не знаю ещё", en: "Not sure yet" },
];
