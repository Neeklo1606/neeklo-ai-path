import { useState } from "react";
import { ArrowRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseCasesList, type CaseItem } from "@/lib/cms-parsers";
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

const CasesPage = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";

  const q = useQuery({
    queryKey: ["cms", "cases", locale],
    queryFn: () => cmsPageBySlug("cases", locale),
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
      <div className="flex-1 flex min-h-[40vh] items-center justify-center bg-background" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (q.isError || !list || cmsIncomplete) {
    return (
      <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 pt-10">
          <p className="text-[15px] text-destructive break-words">{q.isError ? (q.error as Error).message : "CMS"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground pb-24 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 pt-10 md:pt-16">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight">{title}</h1>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">{countBadge}</span>
        </div>
        <p className="text-[15px] text-muted-foreground mb-8">{subtitle}</p>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                active === f.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
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
              <div key={i} className="game-card group overflow-hidden">
                <div className="aspect-video bg-muted mb-4 flex items-center justify-center overflow-hidden relative" style={{ borderRadius: 12 }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className={cn("absolute inset-0 h-full w-full object-cover", mediaDebugClassName(!!c.coverMissing))}
                      loading="lazy"
                    />
                  ) : (
                    <Briefcase size={28} className="text-muted-foreground/40 relative z-[1]" />
                  )}
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      className={cn(
                        "absolute top-2 right-2 h-8 w-auto max-w-[30%] object-contain z-[2]",
                        mediaDebugClassName(!!c.logoMissing),
                      )}
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <span className="inline-block text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 mb-2">
                  {pick(c.tagLabel, lang)}
                </span>
                <p className="text-[16px] md:text-[18px] font-bold mb-1">{pick(c.name, lang)}</p>
                <p className="text-[13px] text-muted-foreground mb-3">
                  {resultPrefix} <span className="text-foreground font-medium">{pick(c.result, lang)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
                >
                  {viewCta} <ArrowRight size={14} />
                </button>
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
