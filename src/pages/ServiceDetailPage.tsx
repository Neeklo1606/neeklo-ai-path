import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Globe, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

import workFashion from "@/assets/work-fashion.png";
import workRacing from "@/assets/work-racing.jpg";
import workStudio from "@/assets/work-studio.jpg";
import workVision from "@/assets/work-vision.jpg";
import workAssistant from "@/assets/work-assistant.jpg";
import workEcommerce from "@/assets/work-ecommerce.jpg";

interface ServiceData {
  icon: typeof Play;
  title: string;
  price: string;
  desc: string;
  fullDesc: string;
  features: string[];
  videos: { title: string; img: string; duration: string }[];
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
      { title: "Имиджевый ролик", img: workFashion, duration: "0:30" },
      { title: "Промо для бренда", img: workRacing, duration: "0:45" },
      { title: "Рекламный ролик", img: workStudio, duration: "1:00" },
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
      { title: "Лендинг студии", img: workStudio, duration: "0:25" },
      { title: "Интернет-магазин", img: workEcommerce, duration: "0:40" },
      { title: "Портфолио-сайт", img: workFashion, duration: "0:30" },
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
      { title: "Vision AI App", img: workVision, duration: "0:35" },
      { title: "AI-ассистент", img: workAssistant, duration: "0:28" },
      { title: "Интернет-магазин", img: workEcommerce, duration: "0:32" },
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
      { title: "AI-ассистент", img: workAssistant, duration: "0:40" },
      { title: "Vision AI", img: workVision, duration: "0:35" },
      { title: "Автоматизация", img: workStudio, duration: "0:30" },
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

        {/* Video examples with real images */}
        <h2 className="text-[18px] font-bold text-foreground mb-4">Примеры работ</h2>
        <div className="space-y-3 mb-6">
          {service.videos.map((v, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden animate-message-in active:scale-[0.98] transition-transform cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={v.img}
                alt={v.title}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-white">{v.title}</p>
                  <p className="text-[12px] text-white/70 mt-0.5">{v.duration}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                </div>
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
