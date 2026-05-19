export type CaseData = {
  id: string;
  image: string | null;
  badge: string;
  title: string;
  subtitle: string;
  tags: string[];
  price: string;
  metric: string;
  url: string | null;
};

export const CASES_DATA: CaseData[] = [
  {
    id: "povuzam",
    image: "/assets/cases/povuzam.jpg",
    badge: "ПЛАТФОРМА",
    title: "ПОВУЗАМ",
    subtitle: "Платформа для абитуриентов: вузы, направления, заявки.",
    tags: ["EdTech", "Платформа", "Каталог"],
    price: "≈ 2 000 000 ₽",
    metric: "Федеральный охват",
    url: "https://povuzam.ru",
  },
  {
    id: "batnorton",
    image: "/assets/cases/batnorton.jpg",
    badge: "E-COMMERCE",
    title: "BatNorton",
    subtitle: "Интернет-магазин с каталогом, фильтрами, корзиной и оплатой.",
    tags: ["E-commerce", "Каталог", "Оплата"],
    price: "от 350 000 ₽",
    metric: "10 лет базы перенесено",
    url: "https://batnorton.com",
  },
  {
    id: "damotors",
    image: "/assets/cases/damotors.jpg",
    badge: "TELEGRAM MINI APP",
    title: "DA.MOTORS",
    subtitle: "Каталог автомобилей в Telegram с заявками и ботом.",
    tags: ["Telegram", "Mini App", "Каталог"],
    price: "от 120 000 ₽",
    metric: "+40% конверсия",
    url: null,
  },
  {
    id: "ai-avito",
    image: null,
    badge: "AI-АССИСТЕНТ",
    title: "AI-помощник для Авито",
    subtitle: "Автоматизировали обработку входящих запросов.",
    tags: ["AI", "Автоматизация"],
    price: "от 50 000 ₽",
    metric: "80% запросов без менеджера",
    url: null,
  },
  {
    id: "bella",
    image: null,
    badge: "SAAS",
    title: "Bella Hasias",
    subtitle: "Премиальная Telegram-экосистема с AI-ассистентом.",
    tags: ["Telegram", "SaaS", "Подписка"],
    price: "от 200 000 ₽",
    metric: "Подписочная модель",
    url: null,
  },
  {
    id: "saas-landing",
    image: null,
    badge: "САЙТ",
    title: "Landing для SaaS-стартапа",
    subtitle: "Сайт с конверсионной воронкой и аналитикой.",
    tags: ["Сайт", "Лендинг"],
    price: "от 80 000 ₽",
    metric: "48 часов от брифа до деплоя",
    url: null,
  },
];
