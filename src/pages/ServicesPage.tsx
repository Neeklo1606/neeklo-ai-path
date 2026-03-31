import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ─── data ─── */
const filters = ["Все", "AI-видео", "Сайты", "Mini App", "AI-агенты", "Автоматизация"];

interface Service {
  slug: string;
  cat: string;
  icon: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  days: number;
  badge?: string;
  badgeColor?: string;
  desc: string;
  includes: string[];
}

const servicesData: Service[] = [
  { slug: "ai-video", cat: "AI-видео", icon: "🎬", name: "AI-ролики", priceFrom: 25000, priceTo: 150000, days: 5, badge: "ХИТ", badgeColor: "#0D0D0B", desc: "Создание рекламных роликов с помощью нейросетей. Runway, Kling, Sora — подбираем инструмент под задачу.", includes: ["Сценарий и раскадровка", "Генерация видео AI", "Озвучка и монтаж", "До 2 правок"] },
  { slug: "website", cat: "Сайты", icon: "🌐", name: "Сайт под ключ", priceFrom: 95000, priceTo: 400000, days: 14, desc: "Лендинг или корпоративный сайт с AI-контентом, анимациями и SEO.", includes: ["Дизайн в Figma", "Верстка на React/Lovable", "SEO-оптимизация", "Подключение аналитики"] },
  { slug: "landing", cat: "Сайты", icon: "📄", name: "Лендинг", priceFrom: 35000, priceTo: 120000, days: 7, desc: "Продающий одностраничник за 7 дней. Конверсионная структура, современный дизайн.", includes: ["Прототип за 2 дня", "Адаптив mobile/desktop", "Форма заявки + CRM", "Быстрая загрузка"] },
  { slug: "mini-app", cat: "Mini App", icon: "📱", name: "Telegram Mini App", priceFrom: 65000, priceTo: 300000, days: 21, desc: "Полноценное приложение внутри Telegram. Каталог, запись, оплата, CRM.", includes: ["UI/UX дизайн", "Frontend + Backend", "Оплата Stars / ЮKassa", "Поддержка 1 месяц"] },
  { slug: "ai-agent", cat: "AI-агенты", icon: "✦", name: "AI-агент продаж", priceFrom: 150000, priceTo: 500000, days: 14, badge: "ТОП", badgeColor: "#0052FF", desc: "AI-ассистент который квалифицирует лидов, отвечает 24/7 и ведёт в CRM.", includes: ["Сценарии диалогов", "GPT/YandexGPT интеграция", "Подключение к CRM", "Аналитика обращений"] },
  { slug: "chatbot", cat: "AI-агенты", icon: "💬", name: "Telegram-бот", priceFrom: 35000, priceTo: 200000, days: 10, desc: "Бот для приёма заявок, поддержки, рассылок и автоматизации процессов.", includes: ["Проектирование сценариев", "Разработка на aiogram", "Интеграции (CRM, оплата)", "Тестирование и запуск"] },
  { slug: "ai-content", cat: "AI-видео", icon: "🖼️", name: "AI-контент пакет", priceFrom: 40000, priceTo: 120000, days: 5, desc: "Фото и видео с нейросетями для соцсетей, рекламы, сайта.", includes: ["10-30 изображений AI", "3-5 коротких роликов", "Контент-план на месяц", "Брендирование"] },
  { slug: "automation", cat: "Автоматизация", icon: "⚙️", name: "Автоматизация", priceFrom: 60000, priceTo: 300000, days: 14, desc: "n8n / Make сценарии, API-интеграции, CRM-связки. Избавляем от ручной рутины.", includes: ["Аудит процессов", "Разработка на n8n/Make", "Интеграция с вашими сервисами", "Документация и обучение"] },
];

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease, delay },
});

/* ─── Detail Sheet ─── */
const DetailSheet = ({
  service,
  onClose,
  isMobile,
  navigate,
}: {
  service: Service;
  onClose: () => void;
  isMobile: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) => (
  <>
    {/* Backdrop */}
    <motion.div
      className="fixed inset-0 z-50"
      style={{ background: "rgba(0,0,0,0.4)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    />

    {/* Panel */}
    <motion.div
      className={`fixed z-50 bg-white overflow-y-auto ${
        isMobile
          ? "inset-x-0 bottom-0 rounded-t-3xl"
          : "right-0 top-0 h-full shadow-2xl"
      }`}
      style={{
        maxHeight: isMobile ? "85vh" : undefined,
        width: isMobile ? undefined : 480,
      }}
      initial={isMobile ? { y: "100%" } : { x: "100%" }}
      animate={isMobile ? { y: 0 } : { x: 0 }}
      exit={isMobile ? { y: "100%" } : { x: "100%" }}
      transition={{ duration: 0.3, ease }}
    >
      <div className="p-6 sm:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mt-2">
          <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-2xl flex-shrink-0">
            {service.icon}
          </div>
          <div>
            {service.badge && (
              <span
                className="font-body text-white rounded-full inline-block mb-1"
                style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: service.badgeColor }}
              >
                {service.badge}
              </span>
            )}
            <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800 }}>{service.name}</h2>
            <p className="font-body mt-1" style={{ fontSize: 16, fontWeight: 700, color: "#0052FF" }}>
              от {service.priceFrom.toLocaleString("ru")} ₽
            </p>
          </div>
        </div>

        {/* Duration */}
        <p className="font-body mt-4" style={{ fontSize: 14, color: "#6A6860" }}>
          ⏱ {service.days} рабочих дней
        </p>

        {/* Description */}
        <p className="font-body mt-4" style={{ fontSize: 15, lineHeight: 1.65, color: "#0D0D0B" }}>
          {service.desc}
        </p>

        {/* Includes */}
        <div className="mt-6">
          <p className="font-body" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Что входит:</p>
          <div className="flex flex-col gap-2">
            {service.includes.map((item) => (
              <p key={item} className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>
                <span style={{ color: "#00B341", marginRight: 6 }}>✓</span>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Price range */}
        <p className="font-body mt-4" style={{ fontSize: 14, color: "#6A6860" }}>
          от {service.priceFrom.toLocaleString("ru")} до {service.priceTo.toLocaleString("ru")} ₽
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/chat")}
          className="w-full font-body text-white rounded-xl mt-6 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-200"
          style={{ background: "#0D0D0B", padding: "14px 0", fontSize: 15, fontWeight: 600 }}
        >
          Заказать этот продукт →
        </button>
      </div>
    </motion.div>
  </>
);

/* ─── Page ─── */
const ServicesPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [active, setActive] = useState("Все");
  const [selected, setSelected] = useState<Service | null>(null);
  usePageTitle("Услуги — neeklo");

  const filtered = active === "Все" ? servicesData : servicesData.filter((s) => s.cat === active);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky filter bar */}
      <div
        className="sticky z-10 border-b border-[#F0F0F0]"
        style={{
          top: isMobile ? 52 : 64,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="font-body whitespace-nowrap rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "6px 16px",
                  background: active === f ? "#0D0D0B" : "transparent",
                  color: active === f ? "#fff" : "#6A6860",
                  border: active === f ? "1px solid #0D0D0B" : "1px solid #E0E0E0",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {/* Header */}
        <div style={{ paddingTop: 32 }}>
          <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800 }}>Услуги</h1>
          <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>
            Выберите подходящее решение для вашего бизнеса
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4" style={{ paddingTop: 24, paddingBottom: 100 }}>
          {filtered.map((s, i) => (
            <motion.div
              key={s.slug}
              className="relative bg-white border border-[#F0F0F0] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              {...fadeUp(i * 0.05)}
            >
              {/* Badge */}
              {s.badge && (
                <span
                  className="absolute top-4 right-4 font-body text-white rounded-full"
                  style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: s.badgeColor }}
                >
                  {s.badge}
                </span>
              )}

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-xl">
                {s.icon}
              </div>

              {/* Name */}
              <p className="font-heading mt-3" style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</p>

              {/* Price */}
              <p className="font-body mt-1" style={{ fontSize: 14, fontWeight: 700, color: "#0052FF" }}>
                от {s.priceFrom.toLocaleString("ru")} ₽
              </p>

              {/* Duration */}
              <p className="font-body mt-0.5" style={{ fontSize: 12, color: "#6A6860" }}>
                Срок: {s.days} дней
              </p>

              {/* Desc */}
              <p className="font-body mt-3 line-clamp-2" style={{ fontSize: 14, color: "#6A6860", lineHeight: 1.5 }}>
                {s.desc}
              </p>

              {/* Includes (desktop) */}
              <div className="hidden md:flex flex-col gap-1.5 mt-3">
                {s.includes.map((item) => (
                  <p key={item} className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>
                    <span style={{ color: "#00B341", marginRight: 4 }}>✓</span>{item}
                  </p>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <button
                  onClick={() => setSelected(s)}
                  className="flex-1 font-body rounded-lg cursor-pointer hover:bg-[#F5F5F5] active:scale-[0.97] transition-all"
                  style={{ border: "1px solid #E0E0E0", background: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}
                >
                  Подробнее
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="flex-1 font-body text-white rounded-lg cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all"
                  style={{ background: "#0D0D0B", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}
                >
                  Заказать
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <DetailSheet
            service={selected}
            onClose={() => setSelected(null)}
            isMobile={isMobile}
            navigate={navigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;
