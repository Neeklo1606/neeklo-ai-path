import { useState, useEffect } from "react";
import { Video, Globe, Bot, Smartphone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const services = [
  {
    icon: Video,
    name: "AI-ролики",
    description: "Создание коротких видеороликов с помощью нейросетей для рекламы и соцсетей",
    price: "от 25 000 ₽",
    badge: "ХИТ",
    slug: "ai-roliki",
  },
  {
    icon: Globe,
    name: "Сайт под ключ",
    description: "Полный цикл разработки сайта: дизайн, вёрстка, запуск и настройка аналитики",
    price: "от 95 000 ₽",
    badge: null,
    slug: "sajt-pod-klyuch",
  },
  {
    icon: Smartphone,
    name: "Telegram Mini App",
    description: "Разработка мини-приложений внутри Telegram для бизнеса и автоматизации",
    price: "от 65 000 ₽",
    badge: null,
    slug: "telegram-mini-app",
  },
  {
    icon: Bot,
    name: "AI-агент",
    description: "Интеллектуальный AI-ассистент для автоматизации процессов и общения с клиентами",
    price: "от 150 000 ₽",
    badge: "ТОП",
    slug: "ai-agent",
  },
];

const SkeletonCard = () => (
  <Card className="border-border bg-card">
    <CardContent className="p-4 md:p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
      <div className="h-5 w-3/4 bg-muted rounded-lg animate-pulse" />
      <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
      <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
      <div className="h-5 w-1/3 bg-muted rounded-lg animate-pulse mt-1" />
      <div className="flex flex-col gap-2 mt-1">
        <div className="h-[48px] w-full bg-muted rounded-xl animate-pulse" />
        <div className="h-[48px] w-full bg-muted rounded-xl animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center pt-28 px-8">
      <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center mb-4">
        <Sparkles size={18} className="text-muted-foreground" />
      </div>
      <p className="text-[15px] font-medium text-foreground text-center mb-1.5">
        Услуги пока не добавлены
      </p>
      <p className="text-[13px] text-muted-foreground text-center mb-6">
        Скоро здесь появится каталог
      </p>
      <button
        onClick={() => navigate("/chat")}
        className="text-[13px] font-medium text-foreground underline underline-offset-2 active:scale-95 transition-transform"
      >
        Перейти в чат →
      </button>
    </div>
  );
};

const ServicesPage = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-[28px] md:text-[36px] font-bold text-foreground tracking-tight">
            Услуги
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px] md:text-[16px]">
            Выберите подходящее решение для вашего бизнеса
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.slug}
                  className="relative overflow-hidden border-border bg-card hover:shadow-lg transition-shadow duration-300"
                  style={{ borderRadius: 12 }}
                >
                  {service.badge && (
                    <Badge
                      className={`absolute top-3 right-3 text-[11px] px-2 py-0.5 ${
                        service.badge === "ХИТ"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {service.badge}
                    </Badge>
                  )}
                  <CardContent className="p-4 md:p-5 flex flex-col h-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted flex items-center justify-center mb-3 md:mb-4">
                      <Icon size={20} className="text-primary md:[&]:w-6 md:[&]:h-6" />
                    </div>

                    <h3 className="text-[16px] md:text-[18px] font-bold text-foreground leading-tight">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground text-[13px] md:text-[14px] mt-1.5 line-clamp-2 leading-snug flex-1">
                      {service.description}
                    </p>

                    <div className="mt-3 md:mt-4 text-[15px] md:text-[16px] font-semibold text-foreground">
                      {service.price}
                    </div>

                    <div className="flex flex-col gap-2 mt-3 md:mt-4">
                      <Button
                        variant="outline"
                        className="w-full text-[13px] h-[48px]"
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate(`/services/${service.slug}`)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        className="w-full text-[13px] h-[48px]"
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate("/chat")}
                      >
                        Заказать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ServicesPage;
