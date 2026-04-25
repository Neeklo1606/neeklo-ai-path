import type { HeroData, PackageItem } from "@/components/services/ServiceHero";
import type { ForWhomItem } from "@/components/services/ServiceForWhom";
import type { CaseData } from "@/components/services/ServiceCase";
import type { ServicePackage } from "@/components/services/ServicePackages";
import type { ProcessStep } from "@/components/services/ServiceProcess";
import type { FAQItem } from "@/components/services/ServiceFAQ";

export const hero: HeroData = {
  title: "Обучение\nпо нейросетям",
  subtitle: "Практический курс для предпринимателей и команд. Внедряешь AI в свой бизнес — сразу, не теория.",
  price: "от 8 900 ₽",
  duration: "от 1 дня",
};

export const heroPkgs: PackageItem[] = [
  { name: "Start", price: "от 8 900 ₽", desc: "Базовый AI для бизнеса · 1 день" },
  { name: "Pro", price: "от 25 000 ₽", desc: "Расширенный курс до 5 чел · 2 дня" },
  { name: "Max", price: "от 75 000 ₽", desc: "Корпоративный воркшоп · 3 дня" },
];

export const forWhom: ForWhomItem[] = [
  { emoji: "💼", title: "Предприниматели", text: "Хочу использовать AI в бизнесе, но не знаю с чего начать." },
  { emoji: "👥", title: "Команды", text: "Нужно обучить сотрудников работе с AI-инструментами." },
  { emoji: "📣", title: "Маркетологи", text: "AI для контента, рекламы и SEO — практические инструменты." },
  { emoji: "💻", title: "Разработчики", text: "AI-first подход: как применять нейросети в разработке." },
];

export const delivers: string[] = [
  "Программа под вашу нишу и задачи",
  "Практика на реальных инструментах (ChatGPT, Claude, Midjourney и др.)",
  "Готовые промпты и шаблоны для вашего бизнеса",
  "Запись занятий + материалы",
  "Telegram-чат поддержки 30 дней",
  "Сертификат об обучении",
];

export const caseData: CaseData = {
  client: "Команда digital-агентства",
  task: "Обучение 8 сотрудников работе с AI-инструментами для ускорения ежедневных задач.",
  result1: "×2.5 скорость работы команды",
  result2: "8 человек за 2 дня",
  result3: "-40% времени на рутинные задачи",
};

export const packages: ServicePackage[] = [
  { name: "Start", price: "от 8 900 ₽", duration: "1 день", desc: "Базовый AI для бизнеса. 1 человек. ChatGPT, Claude, промпты для вашей ниши.", featured: false },
  { name: "Pro", price: "от 25 000 ₽", duration: "2 дня", desc: "Расширенный курс до 5 человек. Midjourney, автоматизация, готовые рабочие процессы.", featured: true },
  { name: "Max", price: "от 75 000 ₽", duration: "3 дня", desc: "Корпоративный воркшоп для всей команды. Индивидуальная программа, внедрение в процессы.", featured: false },
];

export const process: ProcessStep[] = [
  { num: "01", title: "Диагностика", text: "Разбираем ваши задачи и текущие процессы. Определяем, где AI даст максимум." },
  { num: "02", title: "Программа", text: "Составляем план обучения под вашу нишу. Никакой воды — только практика." },
  { num: "03", title: "Обучение", text: "Онлайн или офлайн, индивидуально или группой. Практические задания." },
  { num: "04", title: "Внедрение", text: "Готовые промпты и процессы. Поддержка в чате 30 дней после курса." },
];

export const faq: FAQItem[] = [
  { q: "Нужны ли технические знания?", a: "Нет. Курс построен так, что любой предприниматель или менеджер освоит AI-инструменты за один день." },
  { q: "Можно ли обучение онлайн?", a: "Да. Проводим онлайн через Zoom/Google Meet с демонстрацией экрана. Запись остаётся у вас." },
  { q: "Что будет после курса?", a: "Вы получаете доступ к библиотеке промптов, записи занятий и Telegram-чат с поддержкой 30 дней." },
  { q: "Обучаете ли вы под конкретную нишу?", a: "Да, это главное преимущество. Все примеры и задания строятся вокруг вашего бизнеса: маркетинг, продажи, HR, разработка." },
  { q: "Есть ли групповые скидки?", a: "Да. От 3 человек — скидка 15%, от 5 человек — скидка 25%. Корпоративный воркшоп рассчитывается индивидуально." },
];
