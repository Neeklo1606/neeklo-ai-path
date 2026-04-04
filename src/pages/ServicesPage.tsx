import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowRight } from "lucide-react";
import { cmsPageBySlug } from "@/lib/cms-api";
import { parseServicesGrid } from "@/lib/cms-parsers";
import { useLanguage } from "@/hooks/useLanguage";
import { pick } from "@/lib/cms-blocks";
import { mediaDebugClassName } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

const ServicesPage = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";

  const q = useQuery({
    queryKey: ["cms", "page", "services", locale],
    queryFn: () => cmsPageBySlug("services", locale),
  });

  const grid = q.data ? parseServicesGrid(q.data) : null;
  const services = grid?.length ? grid : null;
  const meta = q.data?.meta ?? {};
  const pageTitle = (q.data?.title ?? "").trim();
  const pageSubtitle = pick(meta.subtitle, lang).trim();
  const footerTitle = pick(meta.footerTitle, lang).trim();
  const footerSubtitle = pick(meta.footerSubtitle, lang).trim();
  const footerButton = pick(meta.footerButton, lang).trim();
  const orderLabel = pick(meta.orderLabel, lang).trim();

  const rowInvalid =
    services?.some((s) => {
      const iconSrc = s.iconSrc;
      return (
        !iconSrc ||
        !pick(s.name, lang).trim() ||
        !pick(s.shortDesc, lang).trim() ||
        !pick(s.priceLine, lang).trim() ||
        !pick(s.durationLine, lang).trim()
      );
    }) ?? true;

  const cmsIncomplete =
    !!q.data &&
    !!services?.length &&
    (!pageTitle ||
      !pageSubtitle ||
      !footerTitle ||
      !footerSubtitle ||
      !footerButton ||
      !orderLabel ||
      rowInvalid);

  usePageTitle(q.data?.title ?? "");

  if (q.isLoading) {
    return (
      <div className="min-h-screen bg-white px-5 pt-12 pb-[100px] md:px-10 flex items-center justify-center" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-[#0D0D0B]" />
      </div>
    );
  }

  if (q.isError || !services?.length || cmsIncomplete) {
    return (
      <div className="min-h-screen bg-white px-5 pt-12 pb-[100px] md:px-10">
        <p className="font-body text-destructive break-words">{q.isError ? (q.error as Error).message : "CMS"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white" style={{ paddingBottom: 100 }}>
      <div className="px-5 pt-8 pb-2 max-w-[1280px] mx-auto md:px-10">
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "#0D0D0B" }}>
          {pageTitle}
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>
          {pageSubtitle}
        </p>
      </div>

      <div className="px-5 mt-6 max-w-[1280px] mx-auto md:px-10">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {services.map((s) => {
            const iconSrc = s.iconSrc;
            return (
              <div
                key={s.id}
                className="relative rounded-2xl cursor-pointer hover:-translate-y-[2px] active:scale-[0.98] transition-all duration-200"
                style={{ background: "#F7F6F3", padding: "20px", border: "1px solid #EDECE8" }}
                onClick={() => navigate("/chat")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate("/chat");
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-2xl flex-shrink-0 overflow-hidden"
                      style={{ width: 52, height: 52, background: "#EDECE8" }}
                    >
                      <img
                        src={iconSrc}
                        alt=""
                        className={cn("w-7 h-7 object-contain", mediaDebugClassName(!!s.iconMissing))}
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "#0D0D0B" }}>
                        {pick(s.name, lang)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#0052FF" }}>
                          {pick(s.priceLine, lang)}
                        </span>
                        <span className="font-body" style={{ fontSize: 12, color: "#8A8880" }}>
                          · {pick(s.durationLine, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {s.badge && (
                    <span
                      className="font-body text-white flex-shrink-0"
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 9999,
                        background: s.badgeColor,
                      }}
                    >
                      {s.badge}
                    </span>
                  )}
                </div>

                <p className="font-body mt-3" style={{ fontSize: 13, color: "#6A6860", lineHeight: 1.5 }}>
                  {pick(s.shortDesc, lang)}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                  {s.includes.slice(0, 4).map((item) => (
                    <span key={item} className="font-body flex items-center gap-1" style={{ fontSize: 11, color: "#6A6860" }}>
                      <span style={{ color: "#00B341", fontSize: 10 }}>✓</span> {item}
                    </span>
                  ))}
                  {s.includes.length > 4 && (
                    <span className="font-body" style={{ fontSize: 11, color: "#8A8880" }}>
                      +{s.includes.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body rounded-full"
                        style={{
                          background: "#E8E6E0",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#6A6860",
                          padding: "3px 8px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-body flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                    {orderLabel} <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mx-5 mt-8 rounded-2xl px-5 py-12 text-center max-w-[1280px] md:mx-auto md:px-10"
        style={{ background: "#0D0D0B" }}
      >
        <h2 className="font-heading text-white" style={{ fontSize: 22, fontWeight: 800 }}>
          {footerTitle}
        </h2>
        <p className="font-body mt-2 mb-6" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
          {footerSubtitle}
        </p>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="font-body rounded-2xl px-8 py-4 active:scale-[0.97] hover:-translate-y-[1px] transition-all duration-150 cursor-pointer"
          style={{ background: "#fff", color: "#0D0D0B", fontSize: 15, fontWeight: 700 }}
        >
          {footerButton}
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;
