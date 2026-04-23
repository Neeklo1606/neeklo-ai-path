import type { KpPackagesData } from "@/lib/cms-api";

interface KPPackagesProps {
  data: KpPackagesData;
  ctaUrl?: string;
}

export default function KPPackages({ data, ctaUrl = "#cta" }: KPPackagesProps) {
  return (
    <section className="kp-section kp-section--cream" id="packages">
      <div className="kp-container">
        <div className="kp-sec-num">03 / ВАРИАНТЫ</div>
        <h2 className="kp-sec-title">
          {data.title_1}<br />
          <span className="kp-accent">{data.title_2}</span>
        </h2>
        <div className="kp-packages">
          {data.items.map((pkg, i) => (
            <div key={i} className={`kp-pkg${pkg.featured ? " featured" : ""}`}>
              {pkg.featured && pkg.badge && (
                <div className="kp-pkg-badge">{pkg.badge}</div>
              )}
              <div className="kp-pkg-name">{pkg.name}</div>
              <div className="kp-pkg-sub">{pkg.subtitle}</div>
              <div className="kp-pkg-price-big">
                {pkg.price}
                <span className="kp-pkg-price-sup">тыс. ₽</span>
              </div>
              <div className="kp-pkg-price-sub">{pkg.price_sub}</div>
              <div className="kp-pkg-divider" />
              <ul className="kp-pkg-list">
                {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <a href={ctaUrl} className="kp-pkg-cta">
                {pkg.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-4-4 4 4-4 4" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
