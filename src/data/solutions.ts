export type Solution = {
  id: string;
  icon: string;
  bg: string;
  accentColor: string;
  /** Боль клиента — заголовок карточки */
  title: string;
  /** Что делаем — название услуги */
  subtitle: string;
  /** Результат для клиента */
  description: string;
  tags: string[];
  price: string;
  duration: string;
  href: string;
  badge?: string;
};

/**
 * Продуктовая матрица главной.
 * Формула карточки: боль (title) → что делаем (subtitle) → результат (description).
 * Цены — из src/data/services/* (hero.price каждой услуги).
 */
export const solutions: Solution[] = [
  {
    id: 'web',
    icon: 'Globe',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    accentColor: '#0ea5e9',
    title: 'Сайт есть, а заявок нет?',
    subtitle: 'Сайт под ключ с AI-ассистентом и CRM',
    description: 'Посетитель получает ответ мгновенно, заявка сразу у вас в Telegram — клиенты не уходят к конкурентам.',
    tags: ['Сайт', 'CRM', 'AI-ассистент', 'SEO'],
    price: 'от 95 000 ₽',
    duration: 'от 14 дней',
    href: '/services/web',
    badge: 'Популярное',
  },
  {
    id: 'ai-assistant',
    icon: 'Bot',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    accentColor: '#8b5cf6',
    title: 'Менеджер не успевает отвечать?',
    subtitle: 'AI-ассистент для сайта и мессенджеров',
    description: 'Отвечает клиентам за секунды 24/7, квалифицирует лида и передаёт менеджеру готовую заявку.',
    tags: ['AI', 'CRM', 'Квалификация лидов'],
    price: 'от 50 000 ₽',
    duration: 'от 7 дней',
    href: '/services/ai-assistant',
  },
  {
    id: 'telegram',
    icon: 'Send',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    accentColor: '#229ED9',
    title: 'Заявки в Telegram теряются?',
    subtitle: 'Telegram-бот или Mini App',
    description: 'Бот сам принимает записи и оплаты — ни одно обращение не остаётся без ответа.',
    tags: ['Telegram', 'Mini App', 'Оплата'],
    price: 'от 40 000 ₽',
    duration: 'от 7 дней',
    href: '/services/telegram',
  },
  {
    id: 'ai-video',
    icon: 'Video',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    accentColor: '#f43f5e',
    title: 'Нужно видео, а бюджета на съёмку нет?',
    subtitle: 'AI-видео без съёмочной группы',
    description: 'Ролик для рекламы и соцсетей за 3–5 дней — без студии, актёров и аренды площадки.',
    tags: ['Видео', 'Reels', 'AI-генерация'],
    price: 'от 25 000 ₽',
    duration: 'от 3 дней',
    href: '/services/ai-video',
  },
  {
    id: 'consulting',
    icon: 'LineChart',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    accentColor: '#D97A3F',
    title: 'Рутина съедает время команды?',
    subtitle: 'AI-аудит + карта внедрения',
    description: 'Находим, где бизнес теряет деньги на ручных процессах, и считаем экономию до внедрения.',
    tags: ['Аудит', 'Автоматизация', 'ROI'],
    price: 'от 15 000 ₽',
    duration: '7–10 дней',
    href: '/services/consulting',
    badge: 'Новое',
  },
];
