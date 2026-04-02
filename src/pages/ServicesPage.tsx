import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowRight } from "lucide-react";
import iconVideo from "@/assets/icon-video.png";
import iconWeb from "@/assets/icon-web.png";
import iconApp from "@/assets/icon-app.png";
import iconAi from "@/assets/icon-ai.png";
import iconDesign from "@/assets/icon-design.png";
import iconAnalytics from "@/assets/icon-analytics.png";

interface Service {
  id: string;
  icon: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  priceFrom: number;
  days: number;
  shortDesc: string;
  includes: string[];
  tags: string[];
}

const services: Service[] = [
  { id: "s1", icon: iconVideo, name: "AI-ролики", badge: "ХИТ", badgeColor: "#0D0D0B", priceFrom: 25000, days: 5, shortDesc: "Рекламные ролики с нейросетями за 5 дней", includes: ["Сценарий", "AI-генерация", "Монтаж", "Озвучка", "2 правки"], tags: ["Runway", "Kling", "Монтаж"] },
  { id: "s2", icon: iconWeb, name: "Сайт под ключ", priceFrom: 95000, days: 14, shortDesc: "Современный сайт с AI-ассистентом и SEO", includes: ["Дизайн в Figma", "React-разработка", "AI-ассистент", "SEO", "Адаптив", "1 мес поддержки"], tags: ["React", "Lovable", "SEO"] },
  { id: "s3", icon: iconApp, name: "Telegram Mini App", priceFrom: 65000, days: 21, shortDesc: "Полноценное приложение внутри Telegram", includes: ["UI/UX дизайн", "Frontend", "Backend API", "Оплата Stars", "Админ-панель"], tags: ["Telegram", "React", "Python"] },
  { id: "s4", icon: iconAi, name: "AI-агент", badge: "ТОП", badgeColor: "#0052FF", priceFrom: 150000, days: 14, shortDesc: "Автоматизация продаж и поддержки 24/7", includes: ["AI на GPT-4", "Сценарии продаж", "CRM-интеграция", "Telegram-бот", "Аналитика"], tags: ["GPT-4", "n8n", "amoCRM"] },
  { id: "s5", icon: iconDesign, name: "Дизайн и брендинг", priceFrom: 30000, days: 7, shortDesc: "Логотип, фирменный стиль, UI/UX", includes: ["Логотип (3 варианта)", "Брендбук PDF", "UI-кит", "Все форматы"], tags: ["Figma", "Брендбук"] },
  { id: "s6", icon: iconAnalytics, name: "Автоматизация", priceFrom: 60000, days: 14, shortDesc: "Бизнес-процессы на автопилоте", includes: ["Аудит процессов", "Разработка на n8n/Make", "API-интеграции", "Документация"], tags: ["n8n", "Make", "API"] },
];

const ServicesPage = () => {
  const navigate = useNavigate();
  usePageTitle("Услуги – neeklo");

  return (
    <div className="min-h-screen overflow-x-hidden bg-white" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-2 max-w-[1280px] mx-auto md:px-10">
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "#0D0D0B" }}>Услуги</h1>
        <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>Выберите подходящее решение</p>
      </div>

      {/* Cards */}
      <div className="px-5 mt-6 max-w-[1280px] mx-auto md:px-10">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="relative rounded-2xl cursor-pointer hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-200"
              style={{ background: "#F7F6F3", padding: "20px", border: "1px solid #EDECE8" }}
              onClick={() => navigate("/chat")}
            >
              {/* Top row: icon + badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 52, height: 52, background: "#EDECE8" }}>
                    <img src={s.icon} alt={s.name} className="w-7 h-7 object-contain" loading="lazy" />
                  </div>
                  <div>
                    <p className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "#0D0D0B" }}>{s.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#0052FF" }}>от {s.priceFrom.toLocaleString("ru")} ₽</span>
                      <span className="font-body" style={{ fontSize: 12, color: "#8A8880" }}>· {s.days} дн</span>
                    </div>
                  </div>
                </div>
                {s.badge && (
                  <span className="font-body text-white flex-shrink-0" style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 9999, background: s.badgeColor }}>
                    {s.badge}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-body mt-3" style={{ fontSize: 13, color: "#6A6860", lineHeight: 1.5 }}>{s.shortDesc}</p>

              {/* Includes */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                {s.includes.slice(0, 4).map((item) => (
                  <span key={item} className="font-body flex items-center gap-1" style={{ fontSize: 11, color: "#6A6860" }}>
                    <span style={{ color: "#00B341", fontSize: 10 }}>✓</span> {item}
                  </span>
                ))}
                {s.includes.length > 4 && (
                  <span className="font-body" style={{ fontSize: 11, color: "#8A8880" }}>+{s.includes.length - 4}</span>
                )}
              </div>

              {/* Tags + CTA */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1.5">
                  {s.tags.map((tag) => (
                    <span key={tag} className="font-body rounded-full" style={{ background: "#E8E6E0", fontSize: 10, fontWeight: 600, color: "#6A6860", padding: "3px 8px" }}>{tag}</span>
                  ))}
                </div>
                <span className="font-body flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                  Заказать <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-5 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1280px] md:mx-auto md:px-10" style={{ background: "#0D0D0B" }}>
        <h2 className="font-heading text-white" style={{ fontSize: 22, fontWeight: 800 }}>Не нашли нужное?</h2>
        <p className="font-body mt-2 mb-6" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>Опишите задачу — предложим решение</p>
        <button onClick={() => navigate("/chat")} className="font-body rounded-2xl px-8 py-4 active:scale-[0.97] hover:-translate-y-[1px] transition-all duration-150 cursor-pointer" style={{ background: "#fff", color: "#0D0D0B", fontSize: 15, fontWeight: 700 }}>
          Написать в чат →
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;
