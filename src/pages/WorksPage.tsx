import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import HolographicCard from "@/components/ui/holographic-card";

/* ─── types ─── */
interface Work {
  id: number;
  cat: string;
  title: string;
  result: string;
  tags: string[];
  bg: string;
  emoji: string;
}

/* ─── data ─── */
const getWorks = (lang: string): Work[] => {
  const en = lang === "en";
  return [
    { id: 1, cat: "AI", title: en ? "Voice AI Assistant" : "Голосовой AI-ассистент", result: en ? "80% automation" : "80% автоматизация", tags: ["Voice AI", "Telegram"], bg: "linear-gradient(135deg,#0a0a1a,#1a1035)", emoji: "🎙️" },
    { id: 2, cat: "AI", title: en ? "AI Contract Analysis" : "AI-анализ договоров", result: en ? "Speed ×5" : "Ускорение ×5", tags: ["GPT-4", "Python"], bg: "linear-gradient(135deg,#0a1a0a,#0d2d1a)", emoji: "📄" },
    { id: 3, cat: "AI", title: en ? "AI Sales Agent" : "AI-агент продаж", result: en ? "+120% leads" : "+120% лидов", tags: ["GPT-4", "n8n"], bg: "linear-gradient(135deg,#0a0a0a,#1a1a2a)", emoji: "🤖" },
    { id: 4, cat: "Mini App", title: "DA-Motors Mini App", result: en ? "+80% leads" : "+80% заявок", tags: ["Telegram", "React"], bg: "linear-gradient(135deg,#1a0808,#2d1010)", emoji: "🚗" },
    { id: 5, cat: "Mini App", title: en ? "Private Club" : "Закрытый клуб", result: en ? "500K₽/mo" : "500K₽/мес", tags: ["Stars", "React"], bg: "linear-gradient(135deg,#0d0d18,#1a1a35)", emoji: "💎" },
    { id: 6, cat: "Mini App", title: "Vision AI App", result: en ? "50K users" : "50K юзеров", tags: ["Telegram", "Python"], bg: "linear-gradient(135deg,#0d0818,#180d35)", emoji: "📱" },
    { id: 7, cat: en ? "Websites" : "Сайты", title: en ? "AVIS — B2B" : "АВИС — B2B", result: en ? "+200% leads" : "+200% заявок", tags: ["React", "B2B"], bg: "linear-gradient(135deg,#0a1020,#152040)", emoji: "🛡️" },
    { id: 8, cat: en ? "Websites" : "Сайты", title: en ? "Malov Method" : "Метод Малова", result: en ? "+90% conv." : "+90% конв.", tags: ["React", "Lovable"], bg: "linear-gradient(135deg,#1a0a05,#2d1a0a)", emoji: "🔍" },
    { id: 9, cat: en ? "Websites" : "Сайты", title: "LIVEGRID", result: en ? "Platform" : "Платформа", tags: ["React", "Supabase"], bg: "linear-gradient(135deg,#0a1628,#1e4080)", emoji: "🏢" },
    { id: 10, cat: en ? "Platforms" : "Платформы", title: en ? "POVUZAM — EdTech" : "ПОВУЗАМ", result: en ? "Federal scale" : "Федеральный", tags: ["React", "Node.js"], bg: "linear-gradient(135deg,#0a1a0a,#153520)", emoji: "🎓" },
    { id: 11, cat: en ? "Platforms" : "Платформы", title: "AI Aggregator", result: en ? "10+ AI" : "10+ AI", tags: ["OpenAI", "Claude"], bg: "linear-gradient(135deg,#0d0818,#200d35)", emoji: "⚡" },
    { id: 12, cat: en ? "Platforms" : "Платформы", title: "SkillChain", result: en ? "Marketplace" : "Биржа", tags: ["React", "Supabase"], bg: "linear-gradient(135deg,#0a0a1a,#101535)", emoji: "🔗" },
    { id: 13, cat: en ? "Videos" : "Ролики", title: en ? "Sovcombank 3D" : "Совкомбанк 3D", result: en ? "Corp." : "Корп.", tags: ["3D", "AI"], bg: "linear-gradient(135deg,#0a1628,#1a3060)", emoji: "🏦" },
    { id: 14, cat: en ? "Videos" : "Ролики", title: en ? "Akrikhin" : "Акрихин", result: en ? "Product" : "Продукт", tags: ["AI Video", "Runway"], bg: "linear-gradient(135deg,#0a1a15,#0d3525)", emoji: "💊" },
    { id: 15, cat: en ? "Videos" : "Ролики", title: en ? "Industrial" : "Промышленный", result: en ? "2M views" : "2M просм.", tags: ["Kling", "Reels"], bg: "linear-gradient(135deg,#1a0808,#3d1010)", emoji: "🏭" },
  ];
};

/* ━━━ PAGE ━━━ */
const WorksPage = () => {
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Our Work – neeklo" : "Работы – neeklo");
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const works = getWorks(lang);

  const filterTabs = [
    { key: "all", label: t("wp.all") },
    { key: "sites", label: t("wp.sites") },
    { key: "videos", label: t("wp.videos") },
    { key: "mini-app", label: t("wp.miniApp") },
    { key: "ai", label: t("wp.ai") },
    { key: "platforms", label: t("wp.platforms") },
  ];

  const catMap: Record<string, string> = {
    sites: lang === "en" ? "Websites" : "Сайты",
    videos: lang === "en" ? "Videos" : "Ролики",
    "mini-app": "Mini App",
    ai: "AI",
    platforms: lang === "en" ? "Platforms" : "Платформы",
  };

  const filtered = activeFilter === "all" ? works : works.filter((w) => w.cat === catMap[activeFilter]);

  return (
    <div className="bg-white min-h-screen" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="px-4 pt-8 md:px-10 md:pt-10 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-heading text-[22px] md:text-[28px]" style={{ fontWeight: 800, color: "#0D0D0B" }}>{t("wp.title")}</h1>
          <span className="font-body text-[13px] font-semibold text-white rounded-full px-3 py-1.5" style={{ background: "#0D0D0B" }}>{t("wp.projectCount")}</span>
        </div>
        <p className="font-body text-[15px] mt-1" style={{ color: "#6A6860" }}>{t("wp.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="sticky top-[52px] sm:top-[64px] z-10 py-3 px-4 md:px-10 mt-4 max-w-[1200px] mx-auto" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #F0F0F0" }}>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {filterTabs.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="whitespace-nowrap rounded-full font-body text-[13px] font-semibold px-4 py-1.5 transition-colors cursor-pointer flex-shrink-0"
              style={{
                background: activeFilter === f.key ? "#0D0D0B" : "transparent",
                color: activeFilter === f.key ? "#fff" : "#6A6860",
                border: activeFilter === f.key ? "1px solid #0D0D0B" : "1px solid #E0E0E0",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instagram-style Grid */}
      <div className="px-1 md:px-10 pt-1 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-3 gap-[2px] md:gap-1">
          {filtered.map((w) => (
            <HolographicCard key={w.id} className="rounded-none md:rounded-lg overflow-hidden">
              <div
                className="relative cursor-pointer group"
                style={{ aspectRatio: "1/1" }}
                onClick={() => navigate("/chat")}
              >
                {/* BG */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: w.bg }}>
                  <span className="text-[36px] md:text-[48px] select-none opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">{w.emoji}</span>
                </div>

                {/* Bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 z-[1]" style={{ height: "65%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-[2] p-2 md:p-3">
                  <p className="font-body text-white leading-tight" style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 700 }}>{w.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: "#4dff91", fontSize: 10 }}>↑</span>
                    <span className="font-body" style={{ fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 600, color: "#4dff91" }}>{w.result}</span>
                  </div>
                </div>

                {/* Category pill (visible on hover / always on mobile) */}
                <div className="absolute top-2 left-2 z-[2]">
                  <span className="font-body text-white rounded-full" style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}>{w.cat}</span>
                </div>
              </div>
            </HolographicCard>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-4 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1200px] md:mx-auto" style={{ background: "#0D0D0B" }}>
        <h2 className="font-heading text-[24px] text-white" style={{ fontWeight: 800 }}>{t("wp.ctaTitle")}</h2>
        <p className="font-body text-[15px] mt-2 mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>{t("wp.ctaSubtitle")}</p>
        <button
          onClick={() => navigate("/chat")}
          className="font-body text-[15px] font-bold rounded-2xl px-8 py-4 cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200"
          style={{ background: "#fff", color: "#0D0D0B" }}
        >
          {t("wp.ctaButton")}
        </button>
      </div>
    </div>
  );
};

export default WorksPage;
