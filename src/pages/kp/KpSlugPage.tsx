import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "@/styles/kp.css";
import { fetchKp, type CommercialOffer } from "@/lib/cms-api";
import KPTopbar    from "@/components/kp/KPTopbar";
import KPHero      from "@/components/kp/KPHero";
import KPProblems  from "@/components/kp/KPProblems";
import KPSolution  from "@/components/kp/KPSolution";
import KPPackages  from "@/components/kp/KPPackages";
import KPIncluded  from "@/components/kp/KPIncluded";
import KPTimeline  from "@/components/kp/KPTimeline";
import KPNextPhase from "@/components/kp/KPNextPhase";
import KPWhyUs     from "@/components/kp/KPWhyUs";
import KPCta       from "@/components/kp/KPCta";
import KPFooter    from "@/components/kp/KPFooter";

function isExpired(createdAt: string, expiresDays: number): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created > expiresDays * 24 * 60 * 60 * 1000;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export default function KpSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const [offer, setOffer] = useState<CommercialOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchKp(slug)
      .then(setOffer)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (offer) {
      document.title = `КП · ${offer.clientName} · neeklo.studio`;
    }
    return () => { document.title = "neeklo — Сайты и AI-агенты под ключ"; };
  }, [offer]);

  if (loading) {
    return (
      <div className="kp-root">
        <KPTopbar />
        <div className="kp-loading"><div className="kp-spinner" /></div>
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="kp-root">
        <KPTopbar />
        <div className="kp-not-found">
          <div className="kp-not-found-code">404</div>
          <h1 className="kp-not-found-title">КП не найдено или срок истёк</h1>
          <p className="kp-not-found-text">
            Возможно, ссылка устарела или КП было отозвано. Свяжитесь с нами
            для получения актуального предложения.
          </p>
          <a href="https://t.me/neeeekn" target="_blank" rel="noopener noreferrer" className="kp-cta-btn">
            Написать в Telegram
          </a>
        </div>
        <KPFooter kpNumber="—" expiresDays={14} />
      </div>
    );
  }

  const expired = isExpired(offer.createdAt, offer.expiresDays);
  const date    = formatDate(offer.createdAt);

  return (
    <div className="kp-root">
      <KPTopbar
        clientName={offer.clientName}
        clientIndustry={offer.clientIndustry}
        date={date}
      />
      <KPHero      hero={offer.heroData}        date={date} expired={expired} />
      <KPProblems  data={offer.problemsData} />
      <KPSolution  data={offer.solutionData} />
      <KPPackages  data={offer.packagesData} ctaUrl="#cta" />
      <KPIncluded  data={offer.includedData} />
      <KPTimeline  data={offer.timelineData} />
      <KPNextPhase data={offer.nextPhaseData} />
      <KPWhyUs     data={offer.whyUsData} />
      <KPCta       cta={offer.ctaData} contacts={offer.contactsData} />
      <KPFooter    kpNumber={offer.kpNumber} expiresDays={offer.expiresDays} />
    </div>
  );
}
