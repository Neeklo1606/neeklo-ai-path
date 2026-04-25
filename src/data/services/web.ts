import type { HeroData, PackageItem } from "@/components/services/ServiceHero";
import type { ForWhomItem } from "@/components/services/ServiceForWhom";
import type { CaseData } from "@/components/services/ServiceCase";
import type { ServicePackage } from "@/components/services/ServicePackages";
import type { ProcessStep } from "@/components/services/ServiceProcess";
import type { FAQItem } from "@/components/services/ServiceFAQ";

export const hero: HeroData = {
  title: "Сайт\nкоторый\nпродаёт",
  subtitle: "Лендинг или корпоративный сайт с AI-ассистентом, SEO и удобной CMS.",
  price: "от 95 000 ₽",
  duration: "от 14 дней",
};

export const heroPkgs: PackageItem[] = [
  { name: "Start", price: "от 95 000 ₽", desc: "Лендинг + форма · 14 дней" },
  { name: "Pro", price: "от 180 000 ₽", desc: "Сайт + AI + CMS · 21 день" },
  { name: "Max", price: "от 300 000 ₽", desc: "Портал + авторизация · 30 дней" },
];

export const forWhom: ForWhomItem[] = [
  { emoji: "🚀", title: "Бизнес без сайта", text: "Нужен рабочий инструмент продаж, а не визитка." },
  { emoji: "🔄", title: "Замена старого", text: "Сайт устарел, медленный и не конвертирует." },
  { emoji: "📊", title: "Продуктовые компании", text: "Нужна убедительная презентация для инвесторов." },
  { emoji: "👤", title: "Эксперты и блогеры", text: "Персональный бренд с профессиональным онлайн-присутствием." },
];

export const delivers: string[] = [
  "Дизайн и вёрстка (React + Tailwind)",
  "Адаптивность: десктоп и мобильный",
  "AI-ассистент на сайте (отвечает на вопросы посетителей)",
  "Админ-панель: редактирование контента без разработчика",
  "SEO-настройка: title, meta, разметка, sitemap",
  "Интеграция с Telegram: заявки сразу к вам в чат",
];

export const caseData: CaseData = {
  client: "LIVEGRID.RU",
  task: "Портал недвижимости с поиском и фильтрами — нужен современный стек и быстрый запуск.",
  result1: "+340% трафика за 60 дней",
  result2: "React + Supabase",
  result3: "Запуск за 3 недели",
};

export const packages: ServicePackage[] = [
  { name: "Start", price: "от 95 000 ₽", duration: "14 дней", desc: "Лендинг + форма заявки. Адаптивный дизайн, SEO-базовая настройка, подключение к Telegram.", featured: false },
  { name: "Pro", price: "от 180 000 ₽", duration: "21 день", desc: "Многостраничный сайт + AI-ассистент + CMS для самостоятельного редактирования.", featured: true },
  { name: "Max", price: "от 300 000 ₽", duration: "30 дней", desc: "Портал с авторизацией, личным кабинетом и расширенной аналитикой.", featured: false },
];

export const process: ProcessStep[] = [
  { num: "01", title: "Анализ и ТЗ", text: "Изучаем нишу, конкурентов, аудиторию. Составляем структуру сайта." },
  { num: "02", title: "Дизайн", text: "Создаём уникальный дизайн в вашем стиле. Согласовываем до старта вёрстки." },
  { num: "03", title: "Разработка", text: "Верстаем, подключаем CMS, AI-ассистента, Telegram-уведомления." },
  { num: "04", title: "SEO и запуск", text: "Настраиваем аналитику, SEO, проверяем скорость. Запускаем сайт." },
];

export const faq: FAQItem[] = [
  { q: "Смогу ли я сам редактировать контент?", a: "Да. Мы подключаем удобную CMS — вы меняете тексты, картинки и блоки через браузер без разработчика." },
  { q: "Что такое AI-ассистент на сайте?", a: "Чат-виджет, который отвечает на вопросы посетителей на основе вашей базы знаний. Работает 24/7, квалифицирует лиды." },
  { q: "Включён ли хостинг?", a: "Первый месяц хостинг включён. Далее помогаем настроить удобный тариф — обычно от 500 ₽/мес." },
  { q: "Сделаете ли вы SEO?", a: "Базовое SEO входит в любой пакет: title, description, H1-H6, микроразметка, sitemap, robots.txt, скорость загрузки." },
  { q: "Можно ли добавить интернет-магазин?", a: "Да, в пакете Max. Каталог, корзина, оплата картой или СБП, личный кабинет покупателя — обсуждаем на бриф-звонке." },
];
