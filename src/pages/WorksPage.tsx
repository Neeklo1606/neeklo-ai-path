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
import { CASES_DATA } from "@/data/cases";
import Footer from "@/components/Footer";
import { ArrowUpRight } from "lucide-react";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

// Static fallback grid when CMS is unavailable
function StaticWorksGrid({ lang }: { lang: string }) {
  const ru = lang === "ru";
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "32px 20px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 6, textTransform: "uppercase" }}>
          {ru ? "Кейсы" : "Cases"}
        </p>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 24 }}>
          {ru ? "Наши работы" : "Our works"}
        </h1>
      </div>

      <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: "0 20px 32px" }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
          {CASES_DATA.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--bd)", textDecoration: "none" }}
              onClick={() => navigate("/chat")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate("/chat"); }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--bd-hover)";
                el.style.boxShadow = "var(--shadow-card-hover)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--bd)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Image area */}
              <div className="relative" style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, var(--surface-2), var(--surface-3))", overflow: "hidden" }}>
                {c.image && <img src={c.image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />}
                <div className="absolute top-3 left-3">
                  <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", background: "var(--surface-2)", color: "var(--tx-muted)", border: "1px solid var(--bd)" }}>
                    {c.badge}
                  </span>
                </div>
                {c.url && (
                  <div className="absolute top-3 right-3 flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: "var(--surface-2)", border: "1px solid var(--bd)" }}>
                    <ArrowUpRight size={13} strokeWidth={2} style={{ color: "var(--tx-faint)" }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1" style={{ padding: "14px 16px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", marginBottom: 4, lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: "var(--tx-muted)", lineHeight: 1.55, flex: 1, marginBottom: 10 }}>{c.subtitle}</p>

                <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 10 }}>
                  {c.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "var(--surface-2)", color: "var(--tx-faint)", border: "1px solid var(--bd)" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between" style={{ paddingTop: 10, borderTop: "1px solid var(--bd)" }}>
                  <span style={{ fontSize: 11, color: "var(--ac-b)", fontWeight: 600 }}>↑ {c.metric}</span>
                  <span style={{ fontSize: 11, color: "var(--tx-faint)" }}>{c.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const WorksPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const locale = lang === "en" ? "en" : "ru";
  const [activeFilter, setActiveFilter] = useState("all");

  const q = useQuery({
    queryKey: ["cms", "works", locale],
    queryFn: () => cmsPageBySlug("works", locale),
    retry: false,
    staleTime: 60_000,
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
    (!pageTitle || !subtitle || !badge || !ctaTitle || !ctaSubtitle || !ctaButton || !filterTabs.length);

  usePageTitle(q.data?.title ?? "");

  const filtered =
    activeFilter === "all" ? works : works.filter((w) => w.filterKey === activeFilter);

  // Show static fallback when loading or CMS unavailable
  if (q.isLoading) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        style={{ background: "var(--bg)" }}
        aria-busy="true"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full"
          style={{ border: "2px solid var(--bd)", borderTopColor: "var(--tx)" }}
        />
      </div>
    );
  }

  if (q.isError || !grid || cmsIncomplete) {
    return <StaticWorksGrid lang={lang} />;
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="px-4 pt-8 md:px-10 md:pt-10 max-w-[1200px] mx-auto w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] md:text-[28px] font-extrabold tracking-tight" style={{ color: "var(--tx)" }}>
            {pageTitle}
          </h1>
          <span
            className="text-[13px] font-semibold rounded-full px-3 py-1.5"
            style={{ background: "var(--tx)", color: "var(--bg)" }}
          >
            {badge}
          </span>
        </div>
        <p className="text-[15px] mt-1" style={{ color: "var(--tx-muted)" }}>
          {subtitle}
        </p>
      </div>

      <div
        className="sticky top-[52px] sm:top-[64px] z-10 py-3 px-4 md:px-10 mt-4 max-w-[1200px] mx-auto w-full"
        style={{
          background: "var(--bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--bd)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {filterTabs.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className="whitespace-nowrap rounded-full text-[13px] font-semibold px-4 py-1.5 transition-colors cursor-pointer flex-shrink-0"
              style={{
                background: activeFilter === f.key ? "var(--tx)" : "transparent",
                color: activeFilter === f.key ? "var(--bg)" : "var(--tx-muted)",
                border: activeFilter === f.key ? "1px solid var(--tx)" : "1px solid var(--bd)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-1 md:px-10 pt-1 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-[2px] md:gap-1">
          {filtered.map((w) => {
            const mediaUrl = w.coverUrl;
            return (
              <HolographicCard key={w.id ?? `${pick(w.title, lang)}-${pick(w.cat, lang)}`} className="rounded-none md:rounded-lg overflow-hidden">
                <div className="relative cursor-pointer group" style={{ aspectRatio: "1/1" }} onClick={() => navigate("/chat")}>
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{ background: w.bg || "var(--surface-2)" }}
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
                    style={{ height: "65%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 z-[2] p-2 md:p-3">
                    <p className="text-white leading-tight" style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 700 }}>
                      {pick(w.title, lang)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span style={{ color: "var(--ac-b)", fontSize: 10 }}>↑</span>
                      <span style={{ fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 600, color: "var(--ac-b)" }}>
                        {pick(w.result, lang)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 z-[2]">
                    <span
                      className="text-white rounded-full"
                      style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
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

      <div
        className="mx-4 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1200px] md:mx-auto"
        style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
      >
        <h2 className="text-[24px] font-extrabold" style={{ color: "var(--tx)" }}>
          {ctaTitle}
        </h2>
        <p className="text-[15px] mt-2 mb-6" style={{ color: "var(--tx-muted)" }}>
          {ctaSubtitle}
        </p>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="text-[15px] font-bold rounded-2xl px-8 py-4 cursor-pointer hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200"
          style={{ background: "var(--tx)", color: "var(--bg)", border: "none" }}
        >
          {ctaButton}
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default WorksPage;
