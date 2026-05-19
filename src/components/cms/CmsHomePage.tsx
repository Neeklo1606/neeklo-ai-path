import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
// import HomeHero from "@/components/home/HomeHero";
import HeroNew from "@/components/sections/HeroNew";
import HomeSolutions from "@/components/home/HomeSolutions";
import HomeProcess from "@/components/home/HomeProcess";
import HomeCases from "@/components/home/HomeCases";
import HomeStats from "@/components/home/HomeStats";
import HomeNews from "@/components/home/HomeNews";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";
import BriefWizard from "@/components/BriefWizard";

const ease = [0.16, 1, 0.3, 1] as const;

const INCLUDED = [
  { icon: "🌐", label: { ru: "Сайт или лендинг", en: "Site or landing" }, sub: { ru: "Дизайн + верстка + CMS", en: "Design + dev + CMS" } },
  { icon: "🤖", label: { ru: "Форма или бот", en: "Form or bot" }, sub: { ru: "Сбор и квалификация заявок", en: "Lead capture and qualification" } },
  { icon: "📊", label: { ru: "Аналитика", en: "Analytics" }, sub: { ru: "Яндекс.Метрика, цели", en: "Yandex.Metrica, goals" } },
  { icon: "⚡", label: { ru: "Поддержка 48ч", en: "48h support" }, sub: { ru: "Правки после сдачи", en: "Edits after delivery" } },
];

function HomeIncluded({ lang }: { lang: string }) {
  const ru = lang === "ru";
  return (
    <section style={{ padding: "64px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease }}
          className="mb-8"
        >
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
            {ru ? "Что входит в каждый проект" : "What's included in every project"}
          </p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--tx)" }}>
            {ru ? "Не просто сайт, а система" : "Not just a site, a system"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INCLUDED.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease, delay: i * 0.06 }}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--bd)",
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)", marginTop: 12, marginBottom: 4 }}>
                {item.label[ru ? "ru" : "en"]}
              </p>
              <p style={{ fontSize: 12, color: "var(--tx-muted)", lineHeight: 1.5 }}>
                {item.sub[ru ? "ru" : "en"]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CmsHomePage() {
  const { lang } = useLanguage();
  usePageTitle("neeklo · цифровые продукты для бизнеса");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardServiceId, setWizardServiceId] = useState<string | undefined>();
  const casesRef = useRef<HTMLDivElement>(null);

  const openWizard = useCallback((serviceId?: string) => {
    setWizardServiceId(serviceId);
    setWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => setWizardOpen(false), []);

  const scrollToCases = useCallback(() => {
    casesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div
      className="flex-1 flex flex-col overflow-x-hidden"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* <HomeHero lang={lang} onOpenWizard={openWizard} /> */}
      <HeroNew onOpenWizard={openWizard} />
      <HomeSolutions lang={lang} />
      <HomeProcess lang={lang} />
      <div ref={casesRef}>
        <HomeCases lang={lang} />
      </div>
      <HomeNews lang={lang} />
      <HomeStats lang={lang} />
      <HomeFinalCTA lang={lang} onOpenWizard={() => openWizard()} />
      <Footer />

      <BriefWizard
        open={wizardOpen}
        initialServiceId={wizardServiceId}
        lang={lang}
        onClose={closeWizard}
      />
    </div>
  );
}
