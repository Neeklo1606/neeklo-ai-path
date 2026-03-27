import { Video, Globe, Bot, Smartphone } from "lucide-react";
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

const ServicesPage = () => {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.slug}
                className="relative overflow-hidden border-border bg-card hover:shadow-lg transition-shadow duration-300"
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
                      size="sm"
                      className="w-full text-[13px]"
                      onClick={() => navigate(`/services/${service.slug}`)}
                    >
                      Подробнее
                    </Button>
                    <Button
                      size="sm"
                      className="w-full text-[13px]"
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
      </div>
      <BottomNav />
    </div>
  );
};

export default ServicesPage;
