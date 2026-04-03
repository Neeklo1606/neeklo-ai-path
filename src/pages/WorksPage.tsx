import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import HolographicCard from "@/components/ui/holographic-card";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseWorksGrid, type WorkItem } from "@/lib/cms-parsers";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

function metaPick(meta: Record<string, unknown> | undefined, key: string, lang: string, fallback: string): string {
  const raw = meta?.[key];
  const s = pick(raw, lang);
  return s || fallback;
}

const WorksPage = () => {
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Our Work – neeklo" : "Работы – neeklo");
  const navigate = useNavigate();
  const locale = lang === "en" ? "en" : "ru";
  const [activeFilter, setActiveFilter] = useState("all");

  const q = useQuery({
    queryKey: ["cms", "works", locale],
    queryFn: () => cmsPageBySlug("works", locale),
  });

  const grid = q.data ? parseWorksGrid(q.data) : null;
  const works: WorkItem[] = grid?.items || [];
  const filterTabs = grid?.filterTabs?.length
    ? grid.filterTabs.map((f) => ({ key: f.key, label: pick(f.label, lang) }))
    : [
        { key: "all", label: t("wp.all") },
        { key: "sites", label: t("wp.sites") },
        { key: "videos", label: t("wp.videos") },
        { key: "mini-app", label: t("wp.miniApp") },
        { key: "ai", label: t("wp.ai") },
        { key: "platforms", label: t("wp.platforms") },
      ];

  const filtered =
    activeFilter === "all"
      ? works
      : works.filter((w) => {
          const fk = w.filterKey;
          if (fk) return fk === activeFilter;
          const cat = pick(w.cat, lang);
          const catMap: Record<string, string> = {
            sites: lang === "en" ? "Websites" : "Сайты",
            videos: lang === "en" ? "Videos" : "Ролики",
            "mini-app": "Mini App",
            ai: "AI",
            platforms: lang === "en" ? "Platforms" : "Платформы",
          };
          return cat === catMap[activeFilter];
        });

  const pageTitle = q.data?.title ? q.data.title : t("wp.title");
  const subtitle = metaPick(q.data?.meta, "subtitle", lang, t("wp.subtitle"));
  const badge = metaPick(q.data?.meta, "projectCount", lang, t("wp.projectCount"));
  const ctaTitle = metaPick(q.data?.meta, "ctaTitle", lang, t("wp.ctaTitle"));
  const ctaSubtitle = metaPick(q.data?.meta, "ctaSubtitle", lang, t("wp.ctaSubtitle"));
  const ctaButton = metaPick(q.data?.meta, "ctaButton", lang, t("wp.ctaButton"));

  if (q.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <p className="font-body text-[15px]" style={{ color: "#6A6860" }}>
          …
        </p>
      </div>
    );
  }

  if (q.isError || !grid) {
    return (
      <div className="bg-white min-h-screen px-4 py-16 text-center" style={{ paddingBottom: 100 }}>
        <p className="font-body text-[15px]" style={{ color: "#6A6860" }}>
          {q.isError ? (q.error as Error).message : "Создайте страницу CMS со slug «works» и блоком works_grid (node server/seed-cms-content.mjs)."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" style={{ paddingBottom: 100 }}>
      <div className="px-4 pt-8 md:px-10 md:pt-10 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-heading text-[22px] md:text-[28px]" style={{ fontWeight: 800, color: "#0D0D0B" }}>
            {pageTitle}
          </h1>
          <span className="font-body text-[13px] font-semibold text-white rounded-full px-3 py-1.5" style={{ background: "#0D0D0B" }}>
            {badge}
          </span>
        </div>
        <p className="font-body text-[15px] mt-1" style={{ color: "#6A6860" }}>
          {subtitle}
        </p>
      </div>

      <div
        className="sticky top-[52px] sm:top-[64px] z-10 py-3 px-4 md:px-10 mt-4 max-w-[1200px] mx-auto"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #F0F0F0",
        }}
      >
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

      <div className="px-1 md:px-10 pt-1 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-3 gap-[2px] md:gap-1">
          {filtered.map((w) => (
            <HolographicCard key={w.id ?? `${pick(w.title, lang)}-${pick(w.cat, lang)}`} className="rounded-none md:rounded-lg overflow-hidden">
              <div className="relative cursor-pointer group" style={{ aspectRatio: "1/1" }} onClick={() => navigate("/chat")}>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: w.bg || "linear-gradient(135deg,#0a0a1a,#1a1035)" }}
                >
                  <span className="text-[36px] md:text-[48px] select-none opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
                    {w.emoji || "✦"}
                  </span>
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 z-[1]"
                  style={{
                    height: "65%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-[2] p-2 md:p-3">
                  <p className="font-body text-white leading-tight" style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 700 }}>
                    {pick(w.title, lang)}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: "#4dff91", fontSize: 10 }}>↑</span>
                    <span className="font-body" style={{ fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 600, color: "#4dff91" }}>
                      {pick(w.result, lang)}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 left-2 z-[2]">
                  <span
                    className="font-body text-white rounded-full"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: "2px 7px",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {pick(w.cat, lang)}
                  </span>
                </div>
              </div>
            </HolographicCard>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1200px] md:mx-auto" style={{ background: "#0D0D0B" }}>
        <h2 className="font-heading text-[24px] text-white" style={{ fontWeight: 800 }}>
          {ctaTitle}
        </h2>
        <p className="font-body text-[15px] mt-2 mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {ctaSubtitle}
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="font-body text-[15px] font-bold rounded-2xl px-8 py-4 cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200"
          style={{ background: "#fff", color: "#0D0D0B" }}
        >
          {ctaButton}
        </button>
      </div>
    </div>
  );
};

export default WorksPage;
