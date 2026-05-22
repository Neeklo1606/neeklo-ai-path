export type NewsItem = {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  href: string;
};

export const news: NewsItem[] = [
  {
    id: 1,
    slug: 'ai-response-time',
    category: 'AI',
    title: 'Как ИИ-ассистент сокращает время ответа клиенту в 6 раз',
    excerpt: 'Разбор реальных метрик: ответ менеджера против AI на базе GPT-4',
    date: '27 апр 2026',
    readTime: '5 мин',
    href: '/blog/ai-response-time',
  },
  {
    id: 2,
    slug: 'mini-app-vs-site',
    category: 'Telegram',
    title: 'Когда бизнесу нужен Telegram Mini App, а не сайт',
    excerpt: '5 признаков что ваш продукт лучше зайдёт через Telegram',
    date: '25 апр 2026',
    readTime: '4 мин',
    href: '/blog/mini-app-vs-site',
  },
  {
    id: 3,
    slug: 'automation-roi',
    category: 'Автоматизация',
    title: '5 сценариев автоматизации, которые окупаются быстрее всего',
    excerpt: 'Что внедрять первым: рассылки, лид-маршрутизация, онбординг',
    date: '24 апр 2026',
    readTime: '6 мин',
    href: '/blog/automation-roi',
  },
  {
    id: 4,
    slug: 'losing-leads',
    category: 'CRM',
    title: 'Почему бизнес теряет заявки и как это остановить',
    excerpt: 'Три главные причины, по которым заявки не доходят до продажи.',
    date: '22 апр 2026',
    readTime: '4 мин',
    href: '/blog/losing-leads',
  },
  {
    id: 5,
    slug: 'site-no-leads',
    category: 'Сайты',
    title: 'Сайт не приносит заявки: 7 причин и как их устранить',
    excerpt: 'Практический разбор: что убивает конверсию и как это исправить.',
    date: '20 апр 2026',
    readTime: '7 мин',
    href: '/blog/site-no-leads',
  },
];

/** @deprecated use news */
export const NEWS = news;
