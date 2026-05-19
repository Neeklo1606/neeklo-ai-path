import { useState } from "react";
import { ArrowRight, ArrowUpRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseCasesList, type CaseItem } from "@/lib/cms-parsers";
import { mediaDebugClassName } from "@/lib/cms-media";
import { cn } from "@/lib/utils";
import { CASES_DATA } from "@/data/cases";

function pick(v: unknown, lang: string): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, string>;
    return o[lang] || o.ru || o.en || "";
  }
  return String(v);
}

function StaticCasesPage({ lang }: { lang: string }) {
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
              style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
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

const CasesPage = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";

  const q = useQuery({
    queryKey: ["cms", "cases", locale],
    queryFn: () => cmsPageBySlug("cases", locale),
    retry: false,
    staleTime: 60_000,
  });

  const list = q.data ? parseCasesList(q.data) : null;
  const cases: CaseItem[] = list?.items ?? [];
  const filters = list?.filters?.length ? list.filters.map((f) => ({ key: f.key, label: pick(f.label, lang) })) : [];

  const meta = q.data?.meta ?? {};
  const title = (q.data?.title ?? "").trim();
  const subtitle = pick(meta.subtitle, lang).trim();
  const countBadge = pick(meta.projectCount, lang).trim();
  const resultPrefix = pick(meta.resultPrefix, lang).trim();
  const viewCta = pick(meta.viewCta, lang).trim();

  const cmsIncomplete =
    !!q.data && !!list && (!title || !subtitle || !countBadge || !resultPrefix || !viewCta || !filters.length);

  usePageTitle(q.data?.title ?? "");

  const [active, setActive] = useState("all");
  const filtered = active === "all" ? cases : cases.filter((c) => c.tag === active);

  if (q.isLoading) {
    return (
      <div
        className="flex-1 flex min-h-[40vh] items-center justify-center"
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

  if (q.isError || !list || cmsIncomplete) {
    return <StaticCasesPage lang={lang} />;
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-[1200px] mx-auto w-full px-4 pt-10 md:pt-16">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: "var(--tx)" }}>{title}</h1>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--tx)", color: "var(--bg)" }}>{countBadge}</span>
        </div>
        <p className="text-[15px] mb-8" style={{ color: "var(--tx-muted)" }}>{subtitle}</p>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-150"
              style={{
                background: active === f.key ? "var(--tx)" : "var(--surface-2)",
                color: active === f.key ? "var(--bg)" : "var(--tx-muted)",
                border: active === f.key ? "1px solid var(--tx)" : "1px solid var(--bd)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-14">
          {filtered.map((c, i) => {
            const cover = c.coverUrl;
            const logo = c.logoUrl;
            return (
              <div
                key={i}
                className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                style={{ background: "var(--surface)", border: "1px solid var(--bd)" }}
                onClick={() => navigate("/projects")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate("/projects"); }}
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
                <div className="aspect-video flex items-center justify-center overflow-hidden relative" style={{ background: "var(--surface-2)" }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className={cn("absolute inset-0 h-full w-full object-cover", mediaDebugClassName(!!c.coverMissing))}
                      loading="lazy"
                    />
                  ) : (
                    <Briefcase size={28} style={{ color: "var(--tx-faint)", position: "relative", zIndex: 1 }} />
                  )}
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      className={cn("absolute top-2 right-2 h-8 w-auto max-w-[30%] object-contain z-[2]", mediaDebugClassName(!!c.logoMissing))}
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <span className="inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5 mb-2" style={{ background: "var(--surface-2)", color: "var(--tx-muted)", border: "1px solid var(--bd)" }}>
                    {pick(c.tagLabel, lang)}
                  </span>
                  <p className="text-[15px] font-bold mb-1" style={{ color: "var(--tx)" }}>{pick(c.name, lang)}</p>
                  <p className="text-[13px] mb-3" style={{ color: "var(--tx-muted)" }}>
                    {resultPrefix} <span style={{ color: "var(--ac-b)", fontWeight: 600 }}>{pick(c.result, lang)}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--tx-muted)" }}>
                    {viewCta} <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CasesPage;
