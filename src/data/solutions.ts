export type Solution = {
  id: string;
  icon: string;
  bg: string;
  title: string;
  description: string;
  tags: string[];
  price: string;
  duration: string;
  href: string;
  badge?: string;
};

export const solutions: Solution[] = [
  {
    id: 'site-ai-crm',
    icon: 'Globe',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    title: 'Сайт + AI-ассистент + CRM',
    description: 'Система, которая помогает получать обращения и не терять заявки.',
    tags: ['Сайт', 'AI-ассистент', 'CRM', 'Заявки'],
    price: 'от 80 000 ₽',
    duration: 'от 14 дней',
    href: '/products/site-ai-crm',
    badge: 'Популярный',
  },
  {
    id: 'ai-video',
    icon: 'Video',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    title: 'AI-видео и визуальный контент',
    description: 'Ролик для рекламы или соцсетей: сценарий, озвучка AI, монтаж.',
    tags: ['Видео', 'Reels', 'Визуалы', 'Контент'],
    price: 'от 15 000 ₽',
    duration: 'от 3 дней',
    href: '/products/ai-video',
  },
  {
    id: 'telegram-bot',
    icon: 'Send',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    title: 'Telegram-бот и Mini App',
    description: 'Клиент пишет в Telegram — бот отвечает, записывает и не теряет заявку.',
    tags: ['Telegram', 'Бот', 'Mini App', 'Автоответ'],
    price: 'от 40 000 ₽',
    duration: 'от 7 дней',
    href: '/products/telegram-bot',
  },
  {
    id: 'custom-development',
    icon: 'Code2',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    title: 'Кастомная разработка',
    description: 'Нестандартный проект под вашу задачу: архитектура, интеграции, запуск.',
    tags: ['Fullstack', 'API', 'Интеграции', 'MVP'],
    price: 'от 120 000 ₽',
    duration: 'от 21 дня',
    href: '/products/custom-development',
  },
  {
    id: 'ai-assistant',
    icon: 'Bot',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    title: 'AI-ассистент для бизнеса',
    description: 'Отвечает клиентам автоматически, обучен на ваших данных.',
    tags: ['GPT', 'Claude', 'RAG', 'Автоответ'],
    price: 'от 25 000 ₽',
    duration: 'от 5 дней',
    href: '/products/ai-assistant',
  },
  {
    id: 'telegram-mini-app',
    icon: 'Smartphone',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    title: 'Telegram Mini App',
    description: 'Мини-приложение внутри Telegram: запись, каталог или кабинет клиента.',
    tags: ['Mini App', 'Каталог', 'Кабинет', 'Telegram'],
    price: 'от 60 000 ₽',
    duration: 'от 10 дней',
    href: '/products/telegram-mini-app',
  },
];
