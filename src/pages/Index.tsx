import { Play, Globe, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const products = [
  {
    icon: Play,
    title: "AI-ролики",
    price: "от 25 000 ₽",
    desc: "Рекламные ролики с нейросетями",
    badge: "ХИТ",
    badgeColor: "bg-[#2563EB]/15 text-[#2563EB]",
  },
  {
    icon: Globe,
    title: "Сайт под ключ",
    price: "от 95 000 ₽",
    desc: "Лендинг или корп. сайт с AI",
  },
  {
    icon: Smartphone,
    title: "Telegram Mini App",
    price: "от 65 000 ₽",
    desc: "Приложение прямо в Telegram",
  },
  {
    icon: Sparkles,
    title: "AI-агент",
    price: "от 150 000 ₽",
    desc: "Автоматизация продаж и процессов",
    badge: "ТОП",
    badgeColor: "bg-amber-500/15 text-amber-400",
  },
];

const steps = [
  { num: "①", title: "Опиши задачу", desc: "напиши в чат что нужно" },
  { num: "②", title: "AI собирает бриф", desc: "формирует ТЗ и цену" },
  { num: "③", title: "Получи результат", desc: "менеджер берёт в работу" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="max-w-[390px] mx-auto px-5">
        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center relative">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#2563EB]/8 blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center w-full">
            <p className="text-[28px] font-semibold tracking-tight mb-1">neeklo</p>
            <p className="text-[14px] text-[#888] mb-10">AI-продакшн студия</p>

            <h1 className="text-[32px] font-bold leading-[1.15] tracking-tight mb-5">
              От идеи
              <br />
              до результата
              <br />
              <span className="text-[#2563EB]">за 48 часов</span>
            </h1>

            <p className="text-[15px] text-[#888] leading-relaxed mb-10 max-w-[320px]">
              AI-ролики, сайты, Mini App и автоматизация —
              <br />
              заказывай онлайн, получай результат
            </p>

            <div className="w-full space-y-3 mb-12">
              <button
                onClick={() => navigate("/chat")}
                className="w-full h-[52px] bg-[#2563EB] text-white font-semibold text-[15px] rounded-xl active:scale-[0.97] transition-transform duration-150"
              >
                Заказать проект
              </button>
              <button
                onClick={() => navigate("/projects")}
                className="w-full h-[52px] bg-transparent text-white font-semibold text-[15px] rounded-xl border border-white/20 active:scale-[0.97] transition-transform duration-150"
              >
                Смотреть работы
              </button>
            </div>

            {/* STATS */}
            <div className="w-full grid grid-cols-3 gap-4">
              {[
                { num: "150+", label: "проектов" },
                { num: "48ч", label: "срок сдачи" },
                { num: "95%", label: "клиентов довольны" },
              ].map((s) => (
                <div key={s.num} className="text-center">
                  <p className="text-[22px] font-bold">{s.num}</p>
                  <p className="text-[12px] text-[#888] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mt-12">
          <h2 className="text-[22px] font-bold mb-5">Что делаем</h2>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div
                key={p.title}
                className="bg-[#141414] rounded-2xl p-5 relative"
              >
                {p.badge && (
                  <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-3">
                  <p.icon size={18} className="text-[#2563EB]" />
                </div>
                <p className="text-[16px] font-bold mb-1">{p.title}</p>
                <p className="text-[14px] text-[#2563EB] font-medium mb-1.5">{p.price}</p>
                <p className="text-[13px] text-[#888] leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-12">
          <h2 className="text-[22px] font-bold mb-5">Как это работает</h2>
          <div className="space-y-5">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-4">
                <span className="text-[20px] mt-0.5">{s.num}</span>
                <div>
                  <p className="text-[15px] font-semibold">{s.title}</p>
                  <p className="text-[13px] text-[#888] mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 mb-4">
          <div className="bg-[#141414] rounded-2xl p-6 text-center">
            <p className="text-[20px] font-bold mb-2">Готов начать?</p>
            <p className="text-[14px] text-[#888] mb-5">Первая консультация бесплатно</p>
            <button
              onClick={() => navigate("/chat")}
              className="w-full h-[52px] bg-[#2563EB] text-white font-semibold text-[15px] rounded-xl active:scale-[0.97] transition-transform duration-150 flex items-center justify-center gap-2"
            >
              Написать в чат
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default LandingPage;
