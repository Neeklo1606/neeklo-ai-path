export type Solution = {
  id: string;
  icon: string;
  bg: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  price: string;
  duration: string;
  href: string;
  badge?: string;
};

export const solutions: Solution[] = [
  {
    id: 'websites',
    icon: 'Globe',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    accentColor: '#0ea5e9',
    title: 'Сайты под ключ',
    subtitle: 'С CRM, AI и Админ панелью',
    description: 'Разрабатываем сайты, интернет-магазины и платформы — от лендинга до сложной веб-системы.',
    tags: ['Сайт', 'CRM', 'AI-ассистент', 'Админ панель'],
    price: 'от 65 000 ₽',
    duration: 'от 14 дней',
    href: '/products/websites',
    badge: 'Популярное',
  },
  {
    id: 'ai-agents',
    icon: 'Bot',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    accentColor: '#8b5cf6',
    title: 'ИИ агенты',
    subtitle: 'Автоматизация и Telegram-боты',
    description: 'ИИ ассистент отвечает клиентам, анализирует документы и передаёт готовые заявки менеджеру.',
    tags: ['AI', 'Telegram', 'Автоматизация', 'CRM'],
    price: 'от 85 000 ₽',
    duration: 'от 7 дней',
    href: '/products/ai-agents',
  },
  {
    id: 'video',
    icon: 'Video',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    accentColor: '#f43f5e',
    title: 'ИИ видео и контент',
    subtitle: 'Reels, ролики, анимация',
    description: 'Рекламные ролики, Reels и ИИ видео для сайта, соцсетей и рекламы. Полный цикл под ключ.',
    tags: ['Видео', 'Reels', 'AI-генерация', 'Монтаж'],
    price: 'от 15 000 ₽',
    duration: 'от 1 дня',
    href: '/products/video',
  },
];
