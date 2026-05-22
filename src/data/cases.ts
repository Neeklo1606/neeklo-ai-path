export type CaseData = {
  id: string;
  image?: string | null;
  badge: string;
  category: string;
  title: string;
  description: string;
  /** @deprecated use description */
  subtitle: string;
  tags: string[];
  price?: string;
  metric: string;
  color: string;
  url: string | null;
};

export const cases: CaseData[] = [
  {
    id: 'povuzam',
    image: '/assets/cases/povuzam.jpg',
    badge: 'ПЛАТФОРМА',
    category: 'Платформы',
    title: 'ПОВУЗАМ',
    description: 'Платформа для абитуриентов: вузы, направления, заявки.',
    subtitle: 'Платформа для абитуриентов: вузы, направления, заявки.',
    tags: ['EdTech', 'Платформа', 'Каталог'],
    metric: 'Федеральный охват',
    color: 'from-violet-100 to-blue-100',
    url: 'https://povuzam.ru',
  },
  {
    id: 'batnorton',
    image: '/assets/cases/batnorton.jpg',
    badge: 'E-COMMERCE',
    category: 'E-commerce',
    title: 'BatNorton',
    description: 'Интернет-магазин с каталогом, фильтрами, корзиной и оплатой.',
    subtitle: 'Интернет-магазин с каталогом, фильтрами, корзиной и оплатой.',
    tags: ['E-commerce', 'Каталог', 'Оплата'],
    price: 'от 350 000 ₽',
    metric: '10 лет данных перенесено',
    color: 'from-slate-100 to-zinc-200',
    url: 'https://batnorton.com',
  },
  {
    id: 'damotors',
    image: '/assets/cases/damotors.jpg',
    badge: 'TELEGRAM MINI APP',
    category: 'Telegram',
    title: 'DA.MOTORS',
    description: 'Каталог автомобилей в Telegram с заявками и ботом.',
    subtitle: 'Каталог автомобилей в Telegram с заявками и ботом.',
    tags: ['Telegram', 'Mini App', 'Каталог'],
    price: 'от 120 000 ₽',
    metric: '+40% конверсия',
    color: 'from-sky-100 to-blue-200',
    url: null,
  },
  {
    id: 'ai-contracts',
    badge: 'AI',
    category: 'AI',
    title: 'AI-агент для автоматизации',
    description: 'Анализ договоров и выжимка ключевых условий за секунды',
    subtitle: 'Анализ договоров и выжимка ключевых условий за секунды',
    tags: ['AI', 'Автоматизация', 'Документы'],
    metric: '3 мин — время ответа',
    color: 'from-indigo-100 to-violet-100',
    url: null,
  },
  {
    id: 'avangard31',
    badge: 'CRM',
    category: 'Сайты',
    title: 'AVANGARD31',
    description: 'Система недвижимости: сайт, CRM, Telegram-бот, парсер объектов.',
    subtitle: 'Система недвижимости: сайт, CRM, Telegram-бот, парсер объектов.',
    tags: ['CRM', 'Недвижимость', 'Бот'],
    metric: 'Комплексная digital-система',
    color: 'from-blue-100 to-cyan-100',
    url: null,
  },
  {
    id: 'bella',
    badge: 'SAAS',
    category: 'Telegram',
    title: 'Bella Hasias',
    description: 'Премиальная Telegram-экосистема с AI-ассистентом и подпиской.',
    subtitle: 'Премиальная Telegram-экосистема с AI-ассистентом и подпиской.',
    tags: ['Telegram', 'SaaS', 'Подписка'],
    price: 'от 200 000 ₽',
    metric: 'Подписочная модель',
    color: 'from-rose-100 to-pink-50',
    url: null,
  },
  {
    id: 'ai-avito',
    badge: 'AI',
    category: 'AI',
    title: 'AI-помощник для Авито',
    description: 'Автоматизировали обработку входящих запросов.',
    subtitle: 'Автоматизировали обработку входящих запросов.',
    tags: ['AI', 'Автоматизация'],
    price: 'от 50 000 ₽',
    metric: '80% запросов без менеджера',
    color: 'from-indigo-100 to-blue-100',
    url: null,
  },
  {
    id: 'ai-platform',
    badge: 'AI SAAS',
    category: 'AI',
    title: 'Платформа AI-агентов',
    description: 'Voice + Video AI ассистенты для бизнеса в реальном времени.',
    subtitle: 'Voice + Video AI ассистенты для бизнеса в реальном времени.',
    tags: ['AI', 'SaaS', 'Voice'],
    metric: 'Realtime AI агенты',
    color: 'from-violet-100 to-indigo-100',
    url: null,
  },
  {
    id: 'svoikhleb',
    badge: 'TELEGRAM',
    category: 'Telegram',
    title: 'Свой Хлеб',
    description: 'Mini App для локального бизнеса: каталог, заявки, бот.',
    subtitle: 'Mini App для локального бизнеса: каталог, заявки, бот.',
    tags: ['Telegram', 'Mini App'],
    metric: 'Заявки через Telegram',
    color: 'from-amber-100 to-yellow-50',
    url: null,
  },
  {
    id: 'ai-video-business',
    badge: 'ВИДЕО',
    category: 'Видео',
    title: 'AI видео для бизнеса',
    description: 'Reels, Shorts, TikTok с AI-генерацией: сценарии, монтаж, субтитры.',
    subtitle: 'Reels, Shorts, TikTok с AI-генерацией: сценарии, монтаж, субтитры.',
    tags: ['Видео', 'AI', 'Контент'],
    metric: 'Рекламные ролики с AI',
    color: 'from-rose-100 to-orange-100',
    url: null,
  },
];

/** @deprecated use cases */
export const CASES_DATA = cases;
