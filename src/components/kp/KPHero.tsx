import type { KpHeroData } from "@/lib/cms-api";

interface KPHeroProps {
  hero: KpHeroData;
  date: string;
  expired?: boolean;
}

export default function KPHero({ hero, date, expired }: KPHeroProps) {
  return (
    <section className="kp-hero">
      <div className="kp-hero-bg" />
      <div className="kp-hero-inner">
        {expired && (
          <div className="kp-expired-banner">
            <span>⚠</span>
            Срок действия этого КП истёк. Свяжитесь с нами для получения актуальной версии.
          </div>
        )}
        <div className="kp-eyebrow kp-fade-up">
          <span className="kp-eyebrow-dot" />
          <span>Коммерческое предложение · {date}</span>
        </div>
        <h1 className="kp-hero-h1 kp-fade-up kp-fade-up-1">
          {hero.title_line_1}
          <br />
          <span className="kp-accent">{hero.title_line_2}</span>
        </h1>
        <p className="kp-hero-sub kp-fade-up kp-fade-up-2">{hero.subtitle}</p>
        <div className="kp-stats kp-fade-up kp-fade-up-3">
          {hero.stats.map((s, i) => (
            <div key={i}>
              <div className="kp-stat-num">
                {s.num}
                {s.unit && <span className="kp-stat-unit">{s.unit}</span>}
              </div>
              <div className="kp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
