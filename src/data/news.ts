export type NewsItem = {
  slug: string;
  category: string;
  title: string;
  date: string;
  href: string;
};

export const NEWS: NewsItem[] = [
  {
    slug: "ai-response-time",
    category: "AI",
    title: "Как ИИ-ассистент сокращает время ответа клиенту в 6 раз",
    date: "27 апр 2026",
    href: "/blog/ai-response-time",
  },
  {
    slug: "mini-app-vs-site",
    category: "Telegram",
    title: "Когда бизнесу нужен Telegram Mini App, а не сайт",
    date: "25 апр 2026",
    href: "/blog/mini-app-vs-site",
  },
  {
    slug: "automation-roi",
    category: "Автоматизация",
    title: "5 сценариев автоматизации, которые окупаются быстрее всего",
    date: "24 апр 2026",
    href: "/blog/automation-roi",
  },
  {
    slug: "losing-leads",
    category: "CRM",
    title: "Почему бизнес теряет заявки и как это остановить",
    date: "22 апр 2026",
    href: "/blog/losing-leads",
  },
  {
    slug: "site-no-leads",
    category: "Сайты",
    title: "Сайт не приносит заявки: 7 причин и как их устранить",
    date: "20 апр 2026",
    href: "/blog/site-no-leads",
  },
];
