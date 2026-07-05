export interface ServicePackage {
  name: string;
  price: string;
  duration: string;
  desc: string;
  featured?: boolean;
}

import FadeIn from "@/components/ui/FadeIn";

export default function ServicePackages({ packages, ctaUrl = "#cta" }: { packages: ServicePackage[]; ctaUrl?: string }) {
  return (
    <section id="packages" style={{ background: "var(--surface)", padding: "80px 0" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>ПАКЕТЫ</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Выбери<br />свой формат
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {packages.map((pkg, i) => (
            <div key={i} style={{ background: pkg.featured ? "var(--surface-2)" : "var(--bg)", border: `1px solid ${pkg.featured ? "color-mix(in srgb, var(--accent-signal) 30%, transparent)" : "var(--bd)"}`, borderRadius: 16, padding: "28px", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              {pkg.featured && (
                <div style={{ position: "absolute", top: -1, left: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: "0 0 8px 8px", background: "var(--accent-signal)", color: "var(--bg)" }}>
                  ОПТИМАЛЬНО
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>{pkg.name}</div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: 28, color: "var(--accent-signal)", lineHeight: 1 }}>{pkg.price}</div>
                <div style={{ fontSize: 11, color: "var(--tx-faint)", marginTop: 4 }}>{pkg.duration}</div>
              </div>
              <div style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.5, flexGrow: 1 }}>{pkg.desc}</div>
              <a href={ctaUrl} style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 13, padding: "12px 20px", borderRadius: 9999, background: pkg.featured ? "var(--accent-signal)" : "transparent", color: pkg.featured ? "var(--bg)" : "var(--tx-muted)", border: pkg.featured ? "none" : "1px solid var(--bd)", textDecoration: "none", textAlign: "center", display: "block", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!pkg.featured) { (e.currentTarget as HTMLElement).style.color = "var(--tx)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bd-hover)"; } else { (e.currentTarget as HTMLElement).style.background = "var(--accent-signal-hover)"; } }}
                onMouseLeave={e => { if (!pkg.featured) { (e.currentTarget as HTMLElement).style.color = "var(--tx-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bd)"; } else { (e.currentTarget as HTMLElement).style.background = "var(--accent-signal)"; } }}>
                Обсудить {pkg.name} →
              </a>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
