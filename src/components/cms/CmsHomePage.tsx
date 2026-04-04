import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import HolographicCard from "@/components/ui/holographic-card";
import Footer from "@/components/Footer";
import TelegramManagerButton from "@/components/TelegramManagerButton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import { cmsPageBySlug, type CmsPage } from "@/lib/cms-api";
import { getBlock, getBlockFirst, HOME_BLOCKS, pick } from "@/lib/cms-blocks";
import { cn } from "@/lib/utils";
import { mediaPublicUrlMap, resolveImageDetailed, mediaDebugClassName, displayImageUrl } from "@/lib/cms-media";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease, delay },
});

function titleLines(text: string): React.ReactNode {
  const parts = text.split("\n");
  return parts.map((line, i) => (
    <span key={i}>
      {i > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

const Divider = () => <div className="w-full" style={{ height: 1, background: "#E8E6E0" }} />;

type HeroBlock = {
  type: "hero";
  title?: unknown;
  subtitle?: unknown;
  images?: Record<string, string>;
  imageId?: string;
  ctaLabel?: unknown;
  secondaryLabel?: unknown;
  showScrollChevron?: boolean;
};

type ServicePreviewItem = { images?: Record<string, string>; imageId?: string; name?: unknown; priceLabel?: unknown };
type ServicesPreviewBlock = {
  type: string;
  sectionTitle?: unknown;
  items?: ServicePreviewItem[];
};

type CasePreviewItem = {
  images?: Record<string, string>;
  imageId?: string;
  cat?: unknown;
  title?: unknown;
  result?: unknown;
  featured?: boolean;
  bg?: string;
};
type CasesPreviewBlock = {
  type: string;
  sectionTitle?: unknown;
  title?: unknown;
  seeAllLabel?: unknown;
  seeAllPath?: string;
  itemNavigatePath?: string;
  mobileSeeAllLabel?: unknown;
  items?: CasePreviewItem[];
};

type ReviewsBlock = {
  type: "reviews";
  title?: unknown;
  items?: Array<{ name?: string; date?: unknown; text?: unknown }>;
  avitoUrl?: string;
  avitoLabel?: unknown;
};

type HowBlock = {
  type: string;
  title?: unknown;
  steps?: Array<{ num?: string; title?: unknown; desc?: unknown }>;
  footerNote?: unknown;
};

type CtaBlock = {
  type: string;
  title?: unknown;
  subtitle?: unknown;
  buttonLabel?: unknown;
  buttonHref?: string;
};

export default function CmsHomePage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";
  const q = useQuery({
    queryKey: ["cms", "home", locale],
    queryFn: () => cmsPageBySlug("home", locale),
  });

  usePageTitle(q.data?.title ?? "");

  if (q.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-body text-destructive break-words">{q.isError ? (q.error as Error).message : "CMS"}</p>
      </div>
    );
  }

  const page = q.data;
  const mediaById = useMemo(() => mediaPublicUrlMap(page), [page]);
  /** Hero: `images.mascot` / legacy `imageId` → resolved via `page.media`. */
  const hero = getBlock<HeroBlock>(page, HOME_BLOCKS.hero[0]);
  const heroBg = resolveImageDetailed(hero as Record<string, unknown>, "background", mediaById);
  const heroMascot = resolveImageDetailed(hero as Record<string, unknown>, "mascot", mediaById);

  const servicesRaw = getBlockFirst<ServicesPreviewBlock>(page, [...HOME_BLOCKS.services]);
  const services = servicesRaw?.items?.length ? servicesRaw : null;

  const casesRaw = getBlockFirst<CasesPreviewBlock>(page, [...HOME_BLOCKS.cases]);
  const casesPreview = casesRaw?.items?.length ? casesRaw : null;

  const reviews = getBlock<ReviewsBlock>(page, HOME_BLOCKS.reviews[0]);
  const how = getBlockFirst<HowBlock>(page, [...HOME_BLOCKS.steps]);
  const cta = getBlockFirst<CtaBlock>(page, [...HOME_BLOCKS.cta]);

  const seeAllPath = casesPreview?.seeAllPath?.trim() ?? "";
  const itemNavPath = casesPreview?.itemNavigatePath?.trim() ?? "";
  const casesPathsInvalid = !!casesPreview && (!seeAllPath || !itemNavPath);
  const ctaInvalid = !!cta && !cta.buttonHref?.trim();

  if (!hero || casesPathsInvalid || ctaInvalid) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-body text-destructive">CMS</p>
      </div>
    );
  }

  const servicesHeading = servicesRaw ? pick(servicesRaw.sectionTitle ?? servicesRaw.title, lang) : "";
  const casesHeading = casesPreview ? pick(casesPreview.sectionTitle ?? casesPreview.title, lang) : "";

  return (
    <div className="flex-1 bg-background text-foreground pb-[100px] sm:pb-0 overflow-x-hidden">
      <TelegramManagerButton />
      {hero ? (
        <section
          className="relative overflow-hidden flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: "#F0EEE8",
            minHeight: "calc(100dvh - 64px)",
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          {heroBg.url ? (
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
              style={{
                backgroundImage: `url(${heroBg.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden
            />
          ) : null}
          <div className="relative z-10 flex flex-col items-center px-5 sm:px-8" style={{ maxWidth: 700 }}>
            <motion.div
              className="relative cursor-pointer"
              style={{ marginBottom: 20 }}
              onClick={() => navigate("/chat")}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.06 }}
            >
              <div className="hero-mascot-float" style={{ width: "clamp(140px, 22vw, 200px)", height: "clamp(140px, 22vw, 200px)" }}>
                <img
                  src={displayImageUrl(heroMascot)}
                  alt=""
                  width={400}
                  height={400}
                  decoding="async"
                  fetchPriority="high"
                  className={cn(
                    "pointer-events-none h-full w-full object-contain",
                    mediaDebugClassName(heroMascot.missing),
                  )}
                  style={{ filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.15))" }}
                />
              </div>
            </motion.div>
            <motion.h1
              className="font-heading"
              style={{ fontWeight: 800, fontSize: "clamp(30px, 5.5vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "#0D0D0B" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {titleLines(pick(hero.title, lang))}
            </motion.h1>
            <motion.p className="font-body" style={{ fontSize: 16, color: "#807B72", lineHeight: 1.6, marginTop: 14, marginBottom: 28 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {pick(hero.subtitle, lang)}
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="flex items-center justify-center gap-2 font-body w-full sm:w-auto cursor-pointer"
                style={{ fontSize: 15, fontWeight: 600, padding: "14px 28px", background: "#0D0D0B", color: "#fff", border: "none", borderRadius: 14 }}
              >
                {pick(hero.ctaLabel, lang)} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}
                className="font-body cursor-pointer"
                style={{ fontSize: 14, fontWeight: 500, padding: "13px 16px", background: "transparent", color: "#6A6860", border: "none" }}
              >
                {pick(hero.secondaryLabel, lang)} <ChevronDown size={14} className="inline ml-1" />
              </button>
            </motion.div>
          </div>
          {hero.showScrollChevron ? (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={20} color="#B0ADA8" />
            </motion.div>
          ) : null}
          <style>{`.hero-mascot-float { animation: mascot-float 3.5s ease-in-out infinite; will-change: transform; } @keyframes mascot-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
        </section>
      ) : null}
      <Divider />
      {services ? (
        <section className="bg-white" style={{ padding: "48px 20px" }}>
          <div className="max-w-[1280px] mx-auto md:px-10">
            <motion.h2 className="font-heading" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>
              {servicesHeading}
            </motion.h2>
            <div className="grid grid-cols-3 md:grid-cols-6 mt-6" style={{ gap: 10 }}>
              {services.items.map((s, i) => {
                const prev = resolveImageDetailed(s as Record<string, unknown>, "icon", mediaById);
                return (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center text-center cursor-pointer hover:-translate-y-[3px] transition-all"
                  style={{ background: "#F7F6F3", borderRadius: 16, padding: "20px 8px 16px" }}
                  onClick={() => navigate("/chat")}
                  {...fadeUp(i * 0.05)}
                >
                  <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: "#EDECE8" }}>
                    <img
                      src={displayImageUrl(prev)}
                      alt=""
                      className={cn("w-7 h-7 object-contain", mediaDebugClassName(prev.missing))}
                      loading="lazy"
                    />
                  </div>
                  <p className="font-heading mt-3" style={{ fontSize: 13, fontWeight: 700, color: "#0D0D0B" }}>
                    {pick(s.name, lang)}
                  </p>
                  <p className="font-body mt-1" style={{ fontSize: 12, color: "#8A8880" }}>
                    {pick(s.priceLabel, lang)}
                  </p>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      <Divider />
      {casesPreview ? (
        <section id="works" className="bg-white" style={{ padding: "72px 0" }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
            <div className="flex items-center justify-between mb-5">
              <motion.h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800 }} {...fadeUp(0)}>
                {casesHeading}
              </motion.h2>
              <button
                type="button"
                onClick={() => navigate(seeAllPath)}
                className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-semibold"
                style={{ color: "#6A6860", background: "none", border: "none" }}
              >
                {pick(casesPreview.seeAllLabel, lang)} <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {casesPreview.items.map((item, i) => {
                const caseImg = resolveImageDetailed(item as Record<string, unknown>, "cover", mediaById);
                const caseLogo = resolveImageDetailed(item as Record<string, unknown>, "logo", mediaById);
                return (
                <motion.div key={i} className={item.featured ? "col-span-2" : ""} {...fadeUp(i * 0.07)}>
                  <button type="button" className="block w-full border-none bg-transparent p-0 text-left cursor-pointer" onClick={() => navigate(itemNavPath)}>
                    <HolographicCard className="rounded-2xl overflow-hidden relative">
                      <div className="relative w-full" style={{ height: item.featured ? 260 : 180, background: item.bg || "#1a1a2e" }}>
                        <img
                          src={displayImageUrl(caseImg)}
                          alt=""
                          className={cn("absolute inset-0 w-full h-full object-cover", mediaDebugClassName(caseImg.missing))}
                          loading="lazy"
                        />
                        {caseLogo.url ? (
                          <img
                            src={displayImageUrl(caseLogo)}
                            alt=""
                            className={cn(
                              "absolute top-3 right-3 h-10 w-auto max-w-[28%] object-contain z-[2]",
                              mediaDebugClassName(caseLogo.missing),
                            )}
                            loading="lazy"
                          />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                          <span className="font-body rounded-full inline-block" style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                            {pick(item.cat, lang)}
                          </span>
                          <p className="font-body text-white mt-1.5" style={{ fontSize: 15, fontWeight: 700 }}>
                            {pick(item.title, lang)}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span style={{ color: "#4dff91", fontSize: 12 }}>↑</span>
                            <span className="font-body" style={{ fontSize: 12, fontWeight: 600, color: "#4dff91" }}>
                              {pick(item.result, lang)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HolographicCard>
                  </button>
                </motion.div>
                );
              })}
            </div>
            {casesPreview.mobileSeeAllLabel ? (
              <div className="flex justify-center mt-5 md:hidden">
                <button
                  type="button"
                  onClick={() => navigate(seeAllPath)}
                  className="font-body text-[13px] font-semibold text-foreground py-2.5 px-5 rounded-xl transition-colors duration-150 hover:bg-muted/30 flex items-center gap-1.5"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  {pick(casesPreview.mobileSeeAllLabel, lang)}
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      {reviews?.items?.length ? <ReviewsFromCms reviews={reviews} lang={lang} /> : null}
      {how?.steps?.length ? (
        <section style={{ background: "#F0EEE8", padding: "72px 0" }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
            <h2 className="font-heading mb-10" style={{ fontSize: "clamp(28px,3.5vw,36px)", fontWeight: 800, color: "#0D0D0B" }}>
              {pick(how.title, lang)}
            </h2>
            <div className="flex flex-col gap-6 md:flex-row md:justify-between">
              {how.steps.map((s, i) => (
                <div key={i} className="flex-1 md:text-center cursor-pointer" onClick={() => navigate("/chat")}>
                  <span className="font-heading" style={{ fontSize: 48, fontWeight: 800, color: "#D0CCC4" }}>
                    {s.num}
                  </span>
                  <p className="font-body mt-2" style={{ fontSize: 17, fontWeight: 700, color: "#0D0D0B" }}>
                    {pick(s.title, lang)}
                  </p>
                  <p className="font-body mt-1" style={{ fontSize: 14, color: "#6A6860", lineHeight: 1.55 }}>
                    {pick(s.desc, lang)}
                  </p>
                </div>
              ))}
            </div>
            {how.footerNote ? (
              <p className="font-body mt-8" style={{ fontSize: 14, color: "#0D0D0B", fontWeight: 600 }}>
                {pick(how.footerNote, lang)}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
      {cta ? (
        <section style={{ background: "#0D0D0B", padding: "56px 20px", textAlign: "center" }}>
          <h2 className="font-heading text-white" style={{ fontWeight: 800, fontSize: "clamp(22px,4vw,26px)", marginBottom: 8 }}>
            {pick(cta.title, lang)}
          </h2>
          <p className="font-body mx-auto text-white/50" style={{ fontSize: 14, maxWidth: 340, marginBottom: 28 }}>
            {pick(cta.subtitle, lang)}
          </p>
          <a
            href={cta.buttonHref}
            className="font-body inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-[#0D0D0B] font-semibold"
            onClick={(e) => {
              if (cta.buttonHref.startsWith("/")) {
                e.preventDefault();
                navigate(cta.buttonHref);
              }
            }}
          >
            {pick(cta.buttonLabel, lang)} <ArrowRight size={14} />
          </a>
        </section>
      ) : null}
      <Footer />
    </div>
  );
}

function ReviewsFromCms({
  reviews,
  lang,
}: {
  reviews: ReviewsBlock;
  lang: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);
  useEffect(() => {
    check();
    const el = scrollRef.current;
    el?.addEventListener("scroll", check, { passive: true });
    return () => el?.removeEventListener("scroll", check);
  }, [check]);
  const items = reviews.items || [];
  return (
    <section style={{ background: "#F0EEE8", padding: "clamp(40px,5vw,56px) 0" }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 className="font-heading" style={{ fontSize: "clamp(22px,3vw,26px)", fontWeight: 800, color: "#0D0D0B" }} {...fadeUp(0)}>
            {pick(reviews.title, lang)}
          </motion.h2>
          <div className="hidden sm:flex gap-2">
            <button type="button" onClick={() => scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" })} className="w-8 h-8 rounded-full border-none" style={{ background: "#E8E6E0" }} disabled={!canL}>
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })} className="w-8 h-8 rounded-full border-none" style={{ background: "#E8E6E0" }} disabled={!canR}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {items.map((r, i) => (
            <div key={i} className="bg-white flex-shrink-0" style={{ borderRadius: 16, padding: 14, width: 220 }}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="rounded-full flex items-center justify-center font-heading flex-shrink-0 bg-muted text-muted-foreground"
                  style={{ width: 30, height: 30, fontSize: 12, fontWeight: 700 }}
                >
                  {(r.name ?? "").toString().charAt(0)}
                </div>
                <div>
                  <p className="font-body font-semibold text-[13px]">{r.name}</p>
                  <p className="font-body text-[11px] text-muted-foreground">{pick(r.date, lang)}</p>
                </div>
              </div>
              <p className="font-body text-[12px] leading-relaxed text-[#3A3A3A] line-clamp-3">{pick(r.text, lang)}</p>
            </div>
          ))}
        </div>
        {reviews.avitoUrl ? (
          <div className="flex justify-center mt-3">
            <a href={reviews.avitoUrl} target="_blank" rel="noopener noreferrer" className="font-body text-[12px] text-[#9A958B] hover:underline">
              {pick(reviews.avitoLabel, lang)}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
