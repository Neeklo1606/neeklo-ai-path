import type { HeroData, PackageItem } from "@/components/services/ServiceHero";
import type { ForWhomItem } from "@/components/services/ServiceForWhom";
import type { CaseData } from "@/components/services/ServiceCase";
import type { ServicePackage } from "@/components/services/ServicePackages";
import type { ProcessStep } from "@/components/services/ServiceProcess";
import type { FAQItem } from "@/components/services/ServiceFAQ";

export const hero: HeroData = {
  title: "AI-ассистент\nвместо\nменеджера",
  subtitle: "Отвечает на вопросы, обрабатывает заявки и никогда не устаёт.",
  price: "от 50 000 ₽",
  duration: "от 7 дней",
};

export const heroPkgs: PackageItem[] = [
  { name: "Start", price: "от 50 000 ₽", desc: "FAQ-ассистент на сайт · 10 дней" },
  { name: "Pro", price: "от 120 000 ₽", desc: "AI + квалификация + CRM · 14 дней" },
  { name: "Max", price: "от 280 000 ₽", desc: "Мультиканальный агент · 21 день" },
];

export const forWhom: ForWhomItem[] = [
  { emoji: "📥", title: "Много входящих", text: "Устали отвечать на одни и те же вопросы снова и снова." },
  { emoji: "🌙", title: "Онлайн-бизнес", text: "Нужно покрыть нерабочие часы без найма сотрудников." },
  { emoji: "📅", title: "Сервисный бизнес", text: "Автоматизировать запись, напоминания и типовые FAQ." },
  { emoji: "🛒", title: "Интернет-магазины", text: "Мгновенные ответы по товарам, доставке и оплате." },
];

export const delivers: string[] = [
  "AI-ассистент на основе GPT-4 / Claude",
  "База знаний: загружаем ваши материалы",
  "Установка на сайт и/или в Telegram",
  "Квалификация лидов: задаёт нужные вопросы",
  "Передача «горячих» лидов менеджеру",
  "Интеграция с вашей CRM или Google Sheets",
  "Dashboard с статистикой обращений",
];

export const caseData: CaseData = {
  client: "Avito AI-ассистент",
  task: "Автоответы и квалификация лидов — тысячи обращений в месяц без живых менеджеров на первой линии.",
  result1: "4 мин среднее время ответа",
  result2: "80% запросов без менеджера",
  result3: "7 баз знаний подключено",
};

export const packages: ServicePackage[] = [
  { name: "Start", price: "от 50 000 ₽", duration: "10 дней", desc: "FAQ-ассистент на сайт. Одна база знаний, виджет, статистика обращений.", featured: false },
  { name: "Pro", price: "от 120 000 ₽", duration: "14 дней", desc: "AI + квалификация лидов + интеграция с CRM/таблицей + приоритетный роутинг.", featured: true },
  { name: "Max", price: "от 280 000 ₽", duration: "21 день", desc: "Мультиканальный агент (сайт + Telegram + email) с аналитикой и автообучением.", featured: false },
];

export const process: ProcessStep[] = [
  { num: "01", title: "Аудит процессов", text: "Анализируем входящие, собираем типовые вопросы и сценарии." },
  { num: "02", title: "База знаний", text: "Загружаем материалы, обучаем модель на ваших данных." },
  { num: "03", title: "Интеграция", text: "Подключаем ассистента к сайту, Telegram и CRM." },
  { num: "04", title: "Запуск и тюнинг", text: "Запускаем в работу, мониторим качество и дообучаем по итогам." },
];

export const faq: FAQItem[] = [
  { q: "Чем AI-ассистент отличается от чат-бота с кнопками?", a: "Кнопочный бот работает по жёсткому сценарию. AI-ассистент понимает произвольные вопросы, отвечает человечески и ведёт диалог." },
  { q: "Нужно ли обучать ассистента?", a: "Да, но это делаем мы. Вы предоставляете материалы (FAQ, прайс, описания услуг) — мы формируем базу знаний и настраиваем модель." },
  { q: "Он будет говорить от имени моей компании?", a: "Да. Ассистент представляется от вашего бренда, использует ваш стиль общения и не раскрывает, что он AI (если вы этого не хотите)." },
  { q: "Что если ассистент не знает ответа?", a: "Он честно сообщает, что уточнит информацию, и переводит разговор на менеджера или собирает контакт для обратного звонка." },
  { q: "Как подключить к существующей CRM?", a: "Поддерживаем Bitrix24, amoCRM, Notion, Google Sheets, Tilda и Telegram. Другие системы — через API по договорённости." },
];
