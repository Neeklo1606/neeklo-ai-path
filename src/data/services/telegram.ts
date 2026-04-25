import type { HeroData, PackageItem } from "@/components/services/ServiceHero";
import type { ForWhomItem } from "@/components/services/ServiceForWhom";
import type { CaseData } from "@/components/services/ServiceCase";
import type { ServicePackage } from "@/components/services/ServicePackages";
import type { ProcessStep } from "@/components/services/ServiceProcess";
import type { FAQItem } from "@/components/services/ServiceFAQ";

export const hero: HeroData = {
  title: "Telegram-бот\n/ Mini App",
  subtitle: "AI-продавец в Telegram, который квалифицирует заявки и не теряет клиентов.",
  price: "от 40 000 ₽",
  duration: "от 7 дней",
  badge: "POPULAR",
};

export const heroPkgs: PackageItem[] = [
  { name: "Start", price: "от 40 000 ₽", desc: "FAQ-бот + заявки · 7 дней" },
  { name: "Pro", price: "от 150 000 ₽", desc: "AI-бот + квалификация + CRM · 14 дней" },
  { name: "Max", price: "от 300 000 ₽", desc: "Mini App + AI + воронка · 21 день" },
];

export const forWhom: ForWhomItem[] = [
  { emoji: "📲", title: "B2C с TG-аудиторией", text: "Прямой канал продаж без сайта — прямо в мессенджере." },
  { emoji: "🛍️", title: "E-commerce", text: "Каталог и заказы прямо внутри Telegram без перехода на сайт." },
  { emoji: "📆", title: "Сервисный бизнес", text: "Запись на услуги и умные напоминания без звонков." },
  { emoji: "📚", title: "Инфобизнес", text: "Автоворонки, прогрев и продажа курсов в мессенджере." },
];

export const delivers: string[] = [
  "Telegram-бот с AI-ответами (понимает текст)",
  "Логика квалификации: горячий/тёплый/холодный",
  "Уведомления менеджеру в реальном времени",
  "Интеграция с CRM или Google Sheets",
  "Mini App (опционально): полноценный интерфейс в Telegram",
  "Воронка: приветствие → прогрев → продажа",
  "30 дней поддержки после запуска",
];

export const caseData: CaseData = {
  client: "DA-Motors",
  task: "AI-продавец для автодилера — квалификация лидов и снятие нагрузки с менеджеров.",
  result1: "×2.4 рост конверсии",
  result2: "80% запросов без менеджера",
  result3: "Запуск за 3 недели",
};

export const packages: ServicePackage[] = [
  { name: "Start", price: "от 40 000 ₽", duration: "7 дней", desc: "FAQ-бот + сбор заявок. Приветствие, типовые вопросы, уведомления менеджеру.", featured: false },
  { name: "Pro", price: "от 150 000 ₽", duration: "14 дней", desc: "AI-бот с квалификацией лидов + интеграция с CRM + аналитика.", featured: true },
  { name: "Max", price: "от 300 000 ₽", duration: "21 день", desc: "Mini App + AI-продавец + воронка прогрева + аналитика продаж.", featured: false },
];

export const process: ProcessStep[] = [
  { num: "01", title: "Бриф и сценарий", text: "Описываем воронку, логику квалификации и сценарии диалога." },
  { num: "02", title: "Разработка бота", text: "Программируем бота, подключаем AI и базу знаний." },
  { num: "03", title: "Интеграция CRM", text: "Настраиваем передачу лидов в вашу систему учёта." },
  { num: "04", title: "Тест и запуск", text: "Проверяем все сценарии, запускаем и передаём управление." },
];

export const faq: FAQItem[] = [
  { q: "Мини-приложение — нужно ли его скачивать?", a: "Нет. Mini App открывается прямо внутри Telegram как веб-страница. Пользователю не нужно ничего устанавливать." },
  { q: "Бот будет работать без интернета у меня?", a: "Бот работает на сервере 24/7. Он не зависит от вашего интернета или устройства." },
  { q: "Как обновлять базу знаний бота?", a: "Через простой интерфейс или Notion/Google Sheets. Обновление применяется без перезапуска бота." },
  { q: "Можно ли подключить оплату внутри Telegram?", a: "Да. Telegram поддерживает платёжные системы: ЮKassa, Stripe, Robokassa. Настраиваем в пакете Max." },
  { q: "Что такое режим Copilot?", a: "Режим, при котором бот предлагает менеджеру готовые ответы, а тот выбирает и отправляет. Помогает сохранить контроль." },
];
