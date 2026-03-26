import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Globe, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface ServiceData {
  icon: typeof Play;
  title: string;
  price: string;
  desc: string;
  fullDesc: string;
  features: string[];
  videos: { title: string; thumb: string; duration: string }[];
}

const services: Record<string, ServiceData> = {
  "ai-roliki": {
    icon: Play,
    title: "AI-ролики",
    price: "от 25 000 ₽",
    desc: "Рекламные ролики с нейросетями",
    fullDesc:
      "Создаём рекламные и имиджевые ролики с использованием AI: от сценария до финального монтажа. Нейросети генерируют визуал, озвучку и музыку — вы получаете готовый контент за 48 часов.",
    features: [
      "Сценарий и раскадровка",
      "AI-генерация визуала",
      "Профессиональный монтаж",
      "Озвучка и музыка",
    ],
    videos: [
      { title: "Промо-ролик бренда", thumb: "🎬", duration: "0:30" },
      { title: "Рекламный видеоролик", thumb: "🎥", duration: "0:45" },
      { title: "Имиджевый ролик", thumb: "🎞️", duration: "1:00" },
    ],
  },
  "sajt-pod-klyuch": {
    icon: Globe,
    title: "Сайт под ключ",
    price: "от 95 000 ₽",
    desc: "Лендинг или корп. сайт с AI",
    fullDesc:
      "Разрабатываем лендинги и корпоративные сайты с AI-элементами: адаптивная вёрстка, SEO, аналитика и формы заявок. Готовый результат за 2–3 недели.",
    features: [
      "Дизайн и прототип",
      "Адаптивная вёрстка",
      "SEO-оптимизация",
      "Подключение аналитики",
    ],
    videos: [
      { title: "Лендинг для стартапа", thumb: "🌐", duration: "0:25" },
      { title: "Корпоративный сайт", thumb: "💼", duration: "0:40" },
      { title: "Портфолио-сайт", thumb: "🎨", duration: "0:30" },
    ],
  },
  "telegram-mini-app": {
    icon: Smartphone,
    title: "Telegram Mini App",
    price: "от 65 000 ₽",
    desc: "Приложение прямо в Telegram",
    fullDesc:
      "Создаём Mini App для Telegram: магазины, сервисы бронирования, программы лояльности. Пользователи взаимодействуют с вашим продуктом прямо в мессенджере.",
    features: [
      "UI/UX дизайн под Telegram",
      "Интеграция с Telegram Bot API",
      "Оплата через Telegram",
      "Аналитика и push-уведомления",
    ],
    videos: [
      { title: "Магазин в Telegram", thumb: "🛒", duration: "0:35" },
      { title: "Сервис записи", thumb: "📅", duration: "0:28" },
      { title: "Программа лояльности", thumb: "⭐", duration: "0:32" },
    ],
  },
  "ai-agent": {
    icon: Sparkles,
    title: "AI-агент",
    price: "от 150 000 ₽",
    desc: "Автоматизация продаж и процессов",
    fullDesc:
      "Внедряем AI-агентов для автоматизации: обработка заявок, консультации клиентов, квалификация лидов. Агент работает 24/7 и интегрируется с вашей CRM.",
    features: [
      "Обучение на ваших данных",
      "Интеграция с CRM",
      "Обработка лидов 24/7",
      "Аналитика и отчёты",
    ],
    videos: [
      { title: "AI-консультант", thumb: "🤖", duration: "0:40" },
      { title: "Автоматизация продаж", thumb: "📈", duration: "0:35" },
      { title: "Чат-бот для поддержки", thumb: "💬", duration: "0:30" },
    ],
  },
};

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const service = slug ? services[slug] : undefined;

  if (!service) {
    return (
      <div className="page-container">
        <div className="page-content flex flex-col items-center justify-center pt-28">
          <p className="text-[15px] text-muted-foreground mb-4">Услуга не найдена</p>
          <button onClick={() => navigate("/")} className="btn-primary max-w-[200px]">
            На главную
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <h1 className="text-[22px] font-bold text-foreground leading-tight">{service.title}</h1>
        </div>

        {/* Info card */}
        <div className="game-card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">{service.title}</p>
              <p className="text-[13px] text-muted-foreground font-medium">{service.price}</p>
            </div>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed">{service.fullDesc}</p>
        </div>

        {/* Features */}
        <div className="game-card mb-6">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Что входит
          </p>
          <div className="space-y-2.5">
            {service.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0" />
                <p className="text-[14px] text-foreground">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video examples */}
        <h2 className="text-[18px] font-bold text-foreground mb-4">Примеры работ</h2>
        <div className="space-y-3 mb-6">
          {service.videos.map((v, i) => (
            <div
              key={i}
              className="game-card flex items-center gap-3 animate-message-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 text-2xl">
                {v.thumb}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-foreground truncate">{v.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{v.duration}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Play size={14} className="text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="game-card text-center mb-4">
          <p className="text-[16px] font-bold mb-2">Хочешь так же?</p>
          <p className="text-[13px] text-muted-foreground mb-4">Обсудим твой проект в чате</p>
          <button onClick={() => navigate("/chat")} className="btn-accent">
            Заказать
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ServiceDetailPage;
