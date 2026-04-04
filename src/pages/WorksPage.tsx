import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import HolographicCard from "@/components/ui/holographic-card";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseWorksGrid, type WorkItem } from "@/lib/cms-parsers";
import { mediaDebugClassName } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

const WorksPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const locale = lang === "en" ? "en" : "ru";
  const [activeFilter, setActiveFilter] = useState("all");

  const q = useQuery({
    queryKey: ["cms", "works", locale],
    queryFn: () => cmsPageBySlug("works", locale),
  });

  const grid = q.data ? parseWorksGrid(q.data) : null;
  const works: WorkItem[] = grid?.items ?? [];
  const filterTabs = grid?.filterTabs?.length
    ? grid.filterTabs.map((f) => ({ key: f.key, label: pick(f.label, lang) }))
    : [];

  const meta = q.data?.meta ?? {};
  const pageTitle = (q.data?.title ?? "").trim();
  const subtitle = pick(meta.subtitle, lang).trim();
  const badge = pick(meta.projectCount, lang).trim();
  const ctaTitle = pick(meta.ctaTitle, lang).trim();
  const ctaSubtitle = pick(meta.ctaSubtitle, lang).trim();
  const ctaButton = pick(meta.ctaButton, lang).trim();

  const cmsIncomplete =
    !!q.data &&
    !!grid &&
    (!pageTitle ||
      !subtitle ||
      !badge ||
      !ctaTitle ||
      !ctaSubtitle ||
      !ctaButton ||
      !filterTabs.length);

  usePageTitle(q.data?.title ?? "");

  const filtered =
    activeFilter === "all" ? works : works.filter((w) => w.filterKey === activeFilter);

  if (q.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-[#0D0D0B]" />
      </div>
    );
  }

  if (q.isError || !grid || cmsIncomplete) {
    return (
      <div className="bg-white min-h-screen px-4 py-16 text-center" style={{ paddingBottom: 100 }}>
        <p className="font-body text-[15px] text-destructive break-words max-w-lg mx-auto">
          {q.isError ? (q.error as Error).message : "CMS"}
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
              type="button"
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
          {filtered.map((w) => {
            const mediaUrl = w.coverUrl;
            return (
              <HolographicCard key={w.id ?? `${pick(w.title, lang)}-${pick(w.cat, lang)}`} className="rounded-none md:rounded-lg overflow-hidden">
                <div className="relative cursor-pointer group" style={{ aspectRatio: "1/1" }} onClick={() => navigate("/chat")}>
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden bg-neutral-950"
                    style={w.bg ? { background: w.bg } : undefined}
                  >
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt=""
                        className={cn("absolute inset-0 h-full w-full object-cover", mediaDebugClassName(!!w.coverMissing))}
                        loading="lazy"
                      />
                    ) : null}
                    {!mediaUrl && w.emoji ? (
                      <span className="relative z-[1] text-[36px] md:text-[48px] select-none opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
                        {w.emoji}
                      </span>
                    ) : null}
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
            );
          })}
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
          type="button"
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
