import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Video, Globe, Smartphone, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface ServiceData {
  icon: typeof Video;
  title: string;
  price: string;
  description: string;
  includes: string[];
  timeline: string;
  steps: { title: string; desc: string }[];
}

const services: Record<string, ServiceData> = {
  "ai-roliki": {
    icon: Video,
    title: "AI-ролики",
    price: "от 25 000 ₽",
    description:
      "Создаём рекламные и имиджевые ролики с использованием нейросетей — от сценария до финального монтажа. Нейросети генерируют визуал, озвучку и музыку. Вы получаете готовый контент для соцсетей, рекламы и презентаций за считанные дни.",
    includes: [
      "Разработка сценария и раскадровки",
      "AI-генерация визуального ряда",
      "Профессиональный монтаж и цветокоррекция",
      "Озвучка и подбор музыки",
      "Адаптация под все платформы (Reels, Shorts, TikTok)",
      "2 раунда правок включены",
    ],
    timeline: "3–7 дней",
    steps: [
      { title: "Бриф и сценарий", desc: "Обсуждаем задачу, целевую аудиторию и создаём сценарий ролика" },
      { title: "Генерация и монтаж", desc: "AI создаёт визуал, добавляем озвучку, музыку и эффекты" },
      { title: "Финал и адаптация", desc: "Вносим правки, адаптируем под нужные платформы и передаём файлы" },
    ],
  },
  "sajt-pod-klyuch": {
    icon: Globe,
    title: "Сайт под ключ",
    price: "от 95 000 ₽",
    description:
      "Разрабатываем лендинги и корпоративные сайты с современным дизайном и AI-элементами. Адаптивная вёрстка, SEO-оптимизация, подключение аналитики и форм заявок. Готовый результат с полной документацией.",
    includes: [
      "Прототип и UI/UX-дизайн",
      "Адаптивная вёрстка (мобильная + десктоп)",
      "SEO-оптимизация и мета-теги",
      "Подключение аналитики (Яндекс.Метрика, GA)",
      "Формы обратной связи и CRM-интеграция",
      "Хостинг и домен на 1 год",
    ],
    timeline: "14–21 день",
    steps: [
      { title: "Анализ и прототип", desc: "Изучаем нишу, конкурентов и создаём прототип страниц" },
      { title: "Дизайн и разработка", desc: "Делаем уникальный дизайн, верстаем и подключаем функционал" },
      { title: "Запуск и поддержка", desc: "Тестируем, запускаем, настраиваем аналитику и передаём доступы" },
    ],
  },
  "telegram-mini-app": {
    icon: Smartphone,
    title: "Telegram Mini App",
    price: "от 65 000 ₽",
    description:
      "Создаём мини-приложения внутри Telegram для бизнеса: магазины, сервисы бронирования, программы лояльности. Пользователи взаимодействуют с вашим продуктом прямо в мессенджере без установки отдельного приложения.",
    includes: [
      "UI/UX-дизайн под Telegram",
      "Интеграция с Telegram Bot API",
      "Приём оплаты через Telegram Payments",
      "Push-уведомления и рассылки",
      "Админ-панель для управления",
      "Аналитика пользователей",
    ],
    timeline: "10–18 дней",
    steps: [
      { title: "Проектирование", desc: "Определяем функционал, рисуем интерфейс и согласовываем ТЗ" },
      { title: "Разработка", desc: "Программируем Mini App, подключаем бота и платёжную систему" },
      { title: "Тестирование и запуск", desc: "Тестируем на реальных пользователях, исправляем баги и публикуем" },
    ],
  },
  "ai-agent": {
    icon: Bot,
    title: "AI-агент",
    price: "от 150 000 ₽",
    description:
      "Внедряем интеллектуальных AI-агентов для автоматизации бизнес-процессов: обработка заявок, консультации клиентов, квалификация лидов. Агент работает 24/7, обучается на ваших данных и интегрируется с CRM.",
    includes: [
      "Обучение модели на ваших данных и документации",
      "Интеграция с CRM и мессенджерами",
      "Автоматическая обработка лидов 24/7",
      "Аналитика разговоров и отчёты",
      "Сценарии эскалации на менеджера",
      "Ежемесячная поддержка и дообучение",
    ],
    timeline: "14–30 дней",
    steps: [
      { title: "Аудит и данные", desc: "Анализируем процессы, собираем базу знаний и обучаем модель" },
      { title: "Настройка и интеграция", desc: "Подключаем агента к вашим каналам и CRM-системе" },
      { title: "Запуск и оптимизация", desc: "Запускаем в работу, мониторим качество и дообучаем" },
    ],
  },
};

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const service = slug ? services[slug] : undefined;

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground mb-4">Услуга не найдена</p>
        <Button onClick={() => navigate("/services")}>К услугам</Button>
        <BottomNav />
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="max-w-[720px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* Back */}
        <button
          onClick={() => navigate("/services")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-[14px] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Услуги
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Icon size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-[24px] md:text-[32px] font-bold text-foreground leading-tight">
              {service.title}
            </h1>
          </div>
        </div>
        <p className="text-[17px] md:text-[18px] font-semibold text-primary mb-4">{service.price}</p>
        <p className="text-[15px] md:text-[16px] text-muted-foreground leading-relaxed mb-8">
          {service.description}
        </p>

        {/* Что входит */}
        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">Что входит</h2>
          <div className="space-y-3">
            {service.includes.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-[14px] md:text-[15px] text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Срок */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5 mb-8">
          <p className="text-[13px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
            Срок выполнения
          </p>
          <p className="text-[18px] md:text-[20px] font-bold text-foreground">{service.timeline}</p>
        </div>

        {/* Как это работает */}
        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">Как это работает</h2>
          <div className="space-y-4">
            {service.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-[15px] md:text-[16px] font-semibold text-foreground">{step.title}</p>
                  <p className="text-[13px] md:text-[14px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio placeholders */}
        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">Примеры работ</h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-xl bg-muted border border-border flex items-center justify-center"
              >
                <span className="text-[12px] text-muted-foreground">Скоро</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full h-12 text-[15px] font-semibold"
          onClick={() => navigate("/chat")}
        >
          Заказать эту услугу
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ServiceDetailPage;
