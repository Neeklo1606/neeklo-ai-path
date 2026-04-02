import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ─── data ─── */
interface Service {
  slug: string;
  catRu: string;
  catEn: string;
  icon: string;
  nameKey: string;
  descKey: string;
  priceFrom: number;
  priceTo: number;
  days: number;
  badge?: string;
  badgeColor?: string;
  includeKeys: string[];
}

const servicesData: Service[] = [
  { slug: "ai-video", catRu: "AI-видео", catEn: "AI Video", icon: "🎬", nameKey: "sn.aiRoliki", descKey: "sd.aiRoliki", priceFrom: 25000, priceTo: 150000, days: 5, badge: "hit", badgeColor: "#0D0D0B", includeKeys: ["si.scriptStoryboard", "si.aiVideoGen", "si.voiceover", "si.revisions2"] },
  { slug: "website", catRu: "Сайты", catEn: "Websites", icon: "🌐", nameKey: "sn.saitPodKlyuch", descKey: "sd.saitPodKlyuch", priceFrom: 95000, priceTo: 400000, days: 14, includeKeys: ["si.figmaDesign", "si.reactDev", "si.seo", "si.analytics"] },
  { slug: "landing", catRu: "Сайты", catEn: "Websites", icon: "📄", nameKey: "sn.landing", descKey: "sd.landing", priceFrom: 35000, priceTo: 120000, days: 7, includeKeys: ["si.proto2days", "si.adaptive", "si.formCrm", "si.fastLoad"] },
  { slug: "mini-app", catRu: "Mini App", catEn: "Mini App", icon: "📱", nameKey: "sn.tgMiniApp", descKey: "sd.tgMiniApp", priceFrom: 65000, priceTo: 300000, days: 21, includeKeys: ["si.uiux", "si.frontBack", "si.payment", "si.support1m"] },
  { slug: "ai-agent", catRu: "AI-агенты", catEn: "AI Agents", icon: "✦", nameKey: "sn.aiAgent", descKey: "sd.aiAgent", priceFrom: 150000, priceTo: 500000, days: 14, badge: "top", badgeColor: "#0052FF", includeKeys: ["si.dialogScenarios", "si.gptIntegration", "si.crmConnect", "si.requestAnalytics"] },
  { slug: "chatbot", catRu: "AI-агенты", catEn: "AI Agents", icon: "💬", nameKey: "sn.tgBot", descKey: "sd.tgBot", priceFrom: 35000, priceTo: 200000, days: 10, includeKeys: ["si.scenarioDesign", "si.aiogramDev", "si.integrations", "si.testLaunch"] },
  { slug: "ai-content", catRu: "AI-видео", catEn: "AI Video", icon: "🖼️", nameKey: "sn.aiContent", descKey: "sd.aiContent", priceFrom: 40000, priceTo: 120000, days: 5, includeKeys: ["si.aiImages", "si.shortVideos", "si.contentPlan", "si.branding"] },
  { slug: "automation", catRu: "Автоматизация", catEn: "Automation", icon: "⚙️", nameKey: "sn.automation", descKey: "sd.automation", priceFrom: 60000, priceTo: 300000, days: 14, includeKeys: ["si.processAudit", "si.n8nDev", "si.serviceIntegration", "si.docsTraining"] },
];

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease, delay },
});

/* ─── Detail Sheet ─── */
const DetailSheet = ({
  service, onClose, isMobile, navigate, t, lang,
}: {
  service: Service; onClose: () => void; isMobile: boolean;
  navigate: ReturnType<typeof useNavigate>;
  t: (key: any) => string; lang: string;
}) => (
  <>
    <motion.div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.4)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
    <motion.div
      className={`fixed z-50 bg-white overflow-y-auto ${isMobile ? "inset-x-0 bottom-0 rounded-t-3xl" : "right-0 top-0 h-full shadow-2xl"}`}
      style={{ maxHeight: isMobile ? "85vh" : undefined, width: isMobile ? undefined : 480 }}
      initial={isMobile ? { y: "100%" } : { x: "100%" }}
      animate={isMobile ? { y: 0 } : { x: 0 }}
      exit={isMobile ? { y: "100%" } : { x: "100%" }}
      transition={{ duration: 0.3, ease }}
    >
      <div className="p-6 sm:p-8">
        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors">
          <X size={18} strokeWidth={1.8} />
        </button>
        <div className="flex items-start gap-3 mt-2">
          <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-2xl flex-shrink-0">{service.icon}</div>
          <div>
            {service.badge && (
              <span className="font-body text-white rounded-full inline-block mb-1" style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: service.badgeColor }}>
                {service.badge === "hit" ? t("services.badgeHit") : t("services.badgeTop")}
              </span>
            )}
            <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800 }}>{t(service.nameKey as any)}</h2>
            <p className="font-body mt-1" style={{ fontSize: 16, fontWeight: 700, color: "#0052FF" }}>
              {t("sp.from")} {service.priceFrom.toLocaleString(lang === "en" ? "en" : "ru")} ₽
            </p>
          </div>
        </div>
        <p className="font-body mt-4" style={{ fontSize: 14, color: "#6A6860" }}>
          ⏱ {service.days} {t("sp.workDays")}
        </p>
        <p className="font-body mt-4" style={{ fontSize: 15, lineHeight: 1.65, color: "#0D0D0B" }}>{t(service.descKey as any)}</p>
        <div className="mt-6">
          <p className="font-body" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{t("sp.included")}</p>
          <div className="flex flex-col gap-2">
            {service.includeKeys.map((key) => (
              <p key={key} className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>
                <span style={{ color: "#00B341", marginRight: 6 }}>✓</span>{t(key as any)}
              </p>
            ))}
          </div>
        </div>
        <p className="font-body mt-4" style={{ fontSize: 14, color: "#6A6860" }}>
          {t("sp.from")} {service.priceFrom.toLocaleString(lang === "en" ? "en" : "ru")} — {service.priceTo.toLocaleString(lang === "en" ? "en" : "ru")} ₽
        </p>
        <button onClick={() => navigate("/chat")} className="w-full font-body text-white rounded-xl mt-6 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-200" style={{ background: "#0D0D0B", padding: "14px 0", fontSize: 15, fontWeight: 600 }}>
          {t("sp.orderProduct")}
        </button>
      </div>
    </motion.div>
  </>
);

/* ─── Page ─── */
const ServicesPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t, lang } = useLanguage();
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Service | null>(null);
  usePageTitle(lang === "en" ? "Services – neeklo" : "Услуги – neeklo");

  const filterKeys = [
    { key: "all", label: t("sp.all") },
    { key: "ai-video", label: t("sp.aiVideo") },
    { key: "sites", label: t("sp.sites") },
    { key: "mini-app", label: t("sp.miniApp") },
    { key: "ai-agents", label: t("sp.aiAgents") },
    { key: "automation", label: t("sp.automation") },
  ];

  const catMap: Record<string, string> = {
    "ai-video": lang === "en" ? "AI Video" : "AI-видео",
    "sites": lang === "en" ? "Websites" : "Сайты",
    "mini-app": "Mini App",
    "ai-agents": lang === "en" ? "AI Agents" : "AI-агенты",
    "automation": lang === "en" ? "Automation" : "Автоматизация",
  };

  const filtered = active === "all" ? servicesData : servicesData.filter((s) => {
    const target = catMap[active];
    return (lang === "en" ? s.catEn : s.catRu) === target;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky z-10 border-b border-[#F0F0F0]" style={{ top: isMobile ? 52 : 64, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {filterKeys.map((f) => (
              <button key={f.key} onClick={() => setActive(f.key)} className="font-body whitespace-nowrap rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0" style={{ fontSize: 13, fontWeight: 600, padding: "6px 16px", background: active === f.key ? "#0D0D0B" : "transparent", color: active === f.key ? "#fff" : "#6A6860", border: active === f.key ? "1px solid #0D0D0B" : "1px solid #E0E0E0" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div style={{ paddingTop: 32 }}>
          <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800 }}>{t("sp.title")}</h1>
          <p className="font-body mt-1" style={{ fontSize: 15, color: "#6A6860" }}>{t("sp.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4" style={{ paddingTop: 24, paddingBottom: 100 }}>
          {filtered.map((s, i) => (
            <motion.div key={s.slug} className="relative bg-white border border-[#F0F0F0] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all duration-200" {...fadeUp(i * 0.05)}>
              {s.badge && (
                <span className="absolute top-4 right-4 font-body text-white rounded-full" style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: s.badgeColor }}>
                  {s.badge === "hit" ? t("services.badgeHit") : t("services.badgeTop")}
                </span>
              )}
              <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-xl">{s.icon}</div>
              <p className="font-heading mt-3" style={{ fontSize: 16, fontWeight: 700 }}>{t(s.nameKey as any)}</p>
              <p className="font-body mt-1" style={{ fontSize: 14, fontWeight: 700, color: "#0052FF" }}>
                {t("sp.from")} {s.priceFrom.toLocaleString(lang === "en" ? "en" : "ru")} ₽
              </p>
              <p className="font-body mt-0.5" style={{ fontSize: 12, color: "#6A6860" }}>
                {t("sp.deadline")} {s.days} {t("sp.days")}
              </p>
              <p className="font-body mt-3 line-clamp-2" style={{ fontSize: 14, color: "#6A6860", lineHeight: 1.5 }}>{t(s.descKey as any)}</p>
              <div className="hidden md:flex flex-col gap-1.5 mt-3">
                {s.includeKeys.map((key) => (
                  <p key={key} className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>
                    <span style={{ color: "#00B341", marginRight: 4 }}>✓</span>{t(key as any)}
                  </p>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <button onClick={() => setSelected(s)} className="flex-1 font-body rounded-lg cursor-pointer hover:bg-[#F5F5F5] active:scale-[0.97] transition-all" style={{ border: "1px solid #E0E0E0", background: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>
                  {t("sp.details")}
                </button>
                <button onClick={() => navigate("/chat")} className="flex-1 font-body text-white rounded-lg cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background: "#0D0D0B", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>
                  {t("sp.order")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <DetailSheet service={selected} onClose={() => setSelected(null)} isMobile={isMobile} navigate={navigate} t={t} lang={lang} />}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;
