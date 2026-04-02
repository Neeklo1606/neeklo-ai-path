import { useState } from "react";
import { ArrowRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";

const CasesPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Our Work – neeklo" : "Наши работы – neeklo");

  const filters = [
    { key: "all", label: t("cases.all") },
    { key: "sites", label: t("cases.sites") },
    { key: "videos", label: t("cases.videos") },
    { key: "mini-app", label: t("cases.miniApp") },
    { key: "ai", label: t("cases.ai") },
  ];

  const cases = [
    { name: lang === "en" ? "Fashion Brand Promo" : "Fashion Brand Promo", tag: "videos", tagLabel: lang === "en" ? "Videos" : "Ролики", result: lang === "en" ? "+40% conversion" : "+40% конверсия" },
    { name: lang === "en" ? "Corporate Website" : "Корпоративный сайт", tag: "sites", tagLabel: lang === "en" ? "Websites" : "Сайты", result: lang === "en" ? "+120% leads" : "+120% заявок" },
    { name: "Loyalty Mini App", tag: "mini-app", tagLabel: "Mini App", result: lang === "en" ? "50K users" : "50K пользователей" },
    { name: lang === "en" ? "AI Sales Assistant" : "AI-ассистент продаж", tag: "ai", tagLabel: "AI", result: lang === "en" ? "−60% response time" : "−60% времени ответа" },
    { name: lang === "en" ? "E-commerce Store" : "Интернет-магазин", tag: "sites", tagLabel: lang === "en" ? "Websites" : "Сайты", result: lang === "en" ? "+85% sales" : "+85% продаж" },
    { name: lang === "en" ? "Launch Promo Video" : "Промо-ролик запуска", tag: "videos", tagLabel: lang === "en" ? "Videos" : "Ролики", result: lang === "en" ? "2M views" : "2M просмотров" },
  ];

  const [active, setActive] = useState("all");
  const filtered = active === "all" ? cases : cases.filter((c) => c.tag === active);

  return (
    <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 pt-10 md:pt-16">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight">{t("cases.title")}</h1>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">{t("cases.projectCount")}</span>
        </div>
        <p className="text-[15px] text-muted-foreground mb-8">{t("cases.subtitle")}</p>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setActive(f.key)} className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 ${active === f.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-14">
          {filtered.map((c, i) => (
            <div key={i} className="game-card group overflow-hidden">
              <div className="aspect-video bg-muted mb-4 flex items-center justify-center" style={{ borderRadius: 12 }}>
                <Briefcase size={28} className="text-muted-foreground/40" />
              </div>
              <span className="inline-block text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 mb-2">{c.tagLabel}</span>
              <p className="text-[16px] md:text-[18px] font-bold mb-1">{c.name}</p>
              <p className="text-[13px] text-muted-foreground mb-3">
                {t("cases.result")} <span className="text-foreground font-medium">{c.result}</span>
              </p>
              <button onClick={() => navigate("/projects")} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
                {t("cases.view")} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CasesPage;
