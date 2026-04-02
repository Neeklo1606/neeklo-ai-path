import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Video, Globe, Smartphone, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface ServiceData {
  icon: typeof Video;
  titleKey: string;
  priceKey: string;
  descKey: string;
  includeKeys: string[];
  timelineKey: string;
  steps: { titleRu: string; titleEn: string; descRu: string; descEn: string }[];
}

const services: Record<string, ServiceData> = {
  "ai-roliki": {
    icon: Video,
    titleKey: "sdet.aiRoliki.title",
    priceKey: "sdet.aiRoliki.price",
    descKey: "sdet.aiRoliki.desc",
    timelineKey: "sdet.aiRoliki.timeline",
    includeKeys: [
      "si.scriptStoryboard", "si.aiVideoGen", "si.voiceover",
      "si.revisions2", "si.adaptive", "si.branding",
    ],
    steps: [
      { titleRu: "Бриф и сценарий", titleEn: "Brief & Script", descRu: "Обсуждаем задачу, целевую аудиторию и создаём сценарий ролика", descEn: "We discuss the task, target audience, and create a video script" },
      { titleRu: "Генерация и монтаж", titleEn: "Generation & Editing", descRu: "AI создаёт визуал, добавляем озвучку, музыку и эффекты", descEn: "AI creates visuals, we add voiceover, music, and effects" },
      { titleRu: "Финал и адаптация", titleEn: "Final & Adaptation", descRu: "Вносим правки, адаптируем под нужные платформы и передаём файлы", descEn: "We make edits, adapt for required platforms, and deliver files" },
    ],
  },
  "sajt-pod-klyuch": {
    icon: Globe,
    titleKey: "sdet.sait.title",
    priceKey: "sdet.sait.price",
    descKey: "sdet.sait.desc",
    timelineKey: "sdet.sait.timeline",
    includeKeys: [
      "si.figmaDesign", "si.adaptive", "si.seo",
      "si.analytics", "si.formCrm", "si.fastLoad",
    ],
    steps: [
      { titleRu: "Анализ и прототип", titleEn: "Analysis & Prototype", descRu: "Изучаем нишу, конкурентов и создаём прототип страниц", descEn: "We study the niche, competitors, and create page prototypes" },
      { titleRu: "Дизайн и разработка", titleEn: "Design & Development", descRu: "Делаем уникальный дизайн, верстаем и подключаем функционал", descEn: "We create unique design, develop, and connect functionality" },
      { titleRu: "Запуск и поддержка", titleEn: "Launch & Support", descRu: "Тестируем, запускаем, настраиваем аналитику и передаём доступы", descEn: "We test, launch, set up analytics, and hand over access" },
    ],
  },
  "telegram-mini-app": {
    icon: Smartphone,
    titleKey: "sdet.miniApp.title",
    priceKey: "sdet.miniApp.price",
    descKey: "sdet.miniApp.desc",
    timelineKey: "sdet.miniApp.timeline",
    includeKeys: [
      "si.uiux", "si.frontBack", "si.payment",
      "si.support1m", "si.analytics", "si.testLaunch",
    ],
    steps: [
      { titleRu: "Проектирование", titleEn: "Planning", descRu: "Определяем функционал, рисуем интерфейс и согласовываем ТЗ", descEn: "We define functionality, design the interface, and agree on specs" },
      { titleRu: "Разработка", titleEn: "Development", descRu: "Программируем Mini App, подключаем бота и платёжную систему", descEn: "We develop the Mini App, connect the bot and payment system" },
      { titleRu: "Тестирование и запуск", titleEn: "Testing & Launch", descRu: "Тестируем на реальных пользователях, исправляем баги и публикуем", descEn: "We test with real users, fix bugs, and publish" },
    ],
  },
  "ai-agent": {
    icon: Bot,
    titleKey: "sdet.aiAgent.title",
    priceKey: "sdet.aiAgent.price",
    descKey: "sdet.aiAgent.desc",
    timelineKey: "sdet.aiAgent.timeline",
    includeKeys: [
      "si.gptIntegration", "si.crmConnect", "si.requestAnalytics",
      "si.dialogScenarios", "si.testLaunch", "si.docsTraining",
    ],
    steps: [
      { titleRu: "Аудит и данные", titleEn: "Audit & Data", descRu: "Анализируем процессы, собираем базу знаний и обучаем модель", descEn: "We analyze processes, gather knowledge base, and train the model" },
      { titleRu: "Настройка и интеграция", titleEn: "Setup & Integration", descRu: "Подключаем агента к вашим каналам и CRM-системе", descEn: "We connect the agent to your channels and CRM system" },
      { titleRu: "Запуск и оптимизация", titleEn: "Launch & Optimization", descRu: "Запускаем в работу, мониторим качество и дообучаем", descEn: "We launch, monitor quality, and fine-tune" },
    ],
  },
};

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const en = lang === "en";
  const service = slug ? services[slug] : undefined;

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground mb-4">{t("sdet.notFound")}</p>
        <Button onClick={() => navigate("/services")}>{t("sdet.backServices")}</Button>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="max-w-[720px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <button onClick={() => navigate("/services")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-[14px] mb-6 transition-colors">
          <ArrowLeft size={16} />
          {t("sdet.backServices")}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Icon size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-[24px] md:text-[32px] font-bold text-foreground leading-tight">{t(service.titleKey as any)}</h1>
          </div>
        </div>
        <p className="text-[17px] md:text-[18px] font-semibold text-primary mb-4">{t(service.priceKey as any)}</p>
        <p className="text-[15px] md:text-[16px] text-muted-foreground leading-relaxed mb-8">{t(service.descKey as any)}</p>

        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">{t("sdet.included")}</h2>
          <div className="space-y-3">
            {service.includeKeys.map((key) => (
              <div key={key} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-[14px] md:text-[15px] text-foreground">{t(key as any)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-5 mb-8">
          <p className="text-[13px] text-muted-foreground font-medium uppercase tracking-wide mb-1">{t("sdet.timeline")}</p>
          <p className="text-[18px] md:text-[20px] font-bold text-foreground">{t(service.timelineKey as any)}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">{t("sdet.howItWorks")}</h2>
          <div className="space-y-4">
            {service.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-[15px] md:text-[16px] font-semibold text-foreground">{en ? step.titleEn : step.titleRu}</p>
                  <p className="text-[13px] md:text-[14px] text-muted-foreground mt-0.5">{en ? step.descEn : step.descRu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[18px] md:text-[20px] font-bold text-foreground mb-4">{t("sdet.examples")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/3] rounded-xl bg-muted border border-border flex items-center justify-center">
                <span className="text-[12px] text-muted-foreground">{t("sdet.soon")}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full h-12 text-[15px] font-semibold" onClick={() => navigate("/chat")}>
          {t("sdet.orderService")}
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
