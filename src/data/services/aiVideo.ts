import type { HeroData } from "@/components/services/ServiceHero";
import type { PackageItem } from "@/components/services/ServiceHero";
import type { ForWhomItem } from "@/components/services/ServiceForWhom";
import type { CaseData } from "@/components/services/ServiceCase";
import type { ServicePackage } from "@/components/services/ServicePackages";
import type { ProcessStep } from "@/components/services/ServiceProcess";
import type { FAQItem } from "@/components/services/ServiceFAQ";

export const hero: HeroData = {
  title: "AI-видео\nза 5 дней",
  subtitle: "Рекламные ролики, reels и презентации с нейросетями. Без съёмочной группы.",
  price: "от 25 000 ₽",
  duration: "от 3 дней",
  badge: "ХИТ",
};

export const heroPkgs: PackageItem[] = [
  { name: "Start", price: "от 25 000 ₽", desc: "1 ролик до 60 сек · 3–5 дней" },
  { name: "Pro", price: "от 60 000 ₽", desc: "3 ролика + монтаж · 5–7 дней" },
  { name: "Max", price: "от 120 000 ₽", desc: "5+ роликов + стратегия · 7–10 дней" },
];

export const forWhom: ForWhomItem[] = [
  { emoji: "📣", title: "Маркетологи", text: "Ролики для рекламных кабинетов без долгих согласований." },
  { emoji: "🎓", title: "Онлайн-школы", text: "Промо курсов и экспертный контент с нейросетями." },
  { emoji: "🛍️", title: "E-commerce", text: "Продуктовые видео и карточки товаров быстро и дёшево." },
  { emoji: "✨", title: "Бренды", text: "Имиджевые ролики без актёров и съёмочной группы." },
];

export const delivers: string[] = [
  "Сценарий и раскадровка под вашу задачу",
  "Генерация визуала (Runway / Kling / HeyGen)",
  "Закадровый голос или субтитры",
  "Монтаж и цветокоррекция",
  "2 правки включены",
  "Финальный файл в нужном формате (MP4 / MOV)",
];

export const caseData: CaseData = {
  client: "Рекламные ролики для инфобизнеса",
  task: "Серия из 5 reels под запуск курса — нужен был быстрый старт без съёмок.",
  result1: "×3.2 CTR по сравнению с обычными",
  result2: "5 роликов за 7 дней",
  result3: "от 8 500 ₽ за ролик в серии",
};

export const packages: ServicePackage[] = [
  { name: "Start", price: "от 25 000 ₽", duration: "3–5 дней", desc: "1 ролик до 60 секунд. Сценарий, генерация, монтаж, финальный файл.", featured: false },
  { name: "Pro", price: "от 60 000 ₽", duration: "5–7 дней", desc: "3 ролика + финальный монтаж. Закадровый голос, субтитры, 2 правки.", featured: true },
  { name: "Max", price: "от 120 000 ₽", duration: "7–10 дней", desc: "5+ роликов + видеостратегия. Форматы для всех платформ.", featured: false },
];

export const process: ProcessStep[] = [
  { num: "01", title: "Бриф и сценарий", text: "Обсуждаем задачу, ЦА и создаём сценарий ролика." },
  { num: "02", title: "Генерация визуала", text: "AI создаёт картинку и видео: Runway, Kling, HeyGen." },
  { num: "03", title: "Монтаж и озвучка", text: "Добавляем голос, музыку, субтитры и эффекты." },
  { num: "04", title: "Правки и сдача", text: "Вносим правки, адаптируем под платформы, передаём файлы." },
];

export const faq: FAQItem[] = [
  { q: "Нужен ли мне актёр или диктор?", a: "Нет. Мы используем AI-генерацию визуала и синтезированный голос. По желанию можем включить реального диктора." },
  { q: "Какие форматы получу на выходе?", a: "MP4 в нужном разрешении: 9:16 для Reels/Shorts, 16:9 для YouTube/Яндекс, 1:1 для кабинетов. По запросу — MOV." },
  { q: "Можно ли сделать ролик с реальными людьми?", a: "Да, мы можем интегрировать предоставленную вами съёмку или фото. AI дополнит и обработает материал." },
  { q: "Как быстро вы делаете правки?", a: "В течение 1–2 рабочих дней. 2 правки включены в стоимость, дополнительные — по договорённости." },
  { q: "Подойдёт ли для Яндекс.Директ и ВКонтакте?", a: "Да. Адаптируем под требования любого рекламного кабинета: размеры, длительность, битрейт." },
];
