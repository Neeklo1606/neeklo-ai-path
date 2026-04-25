export interface ServicePackage {
  name: string;
  price: string;
  duration: string;
  desc: string;
  featured?: boolean;
}

export default function ServicePackages({ packages, ctaUrl = "#cta" }: { packages: ServicePackage[]; ctaUrl?: string }) {
  return (
    <section id="packages" style={{ background: "#111214", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>ПАКЕТЫ</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Выбери<br /><span style={{ color: "#C5F04A" }}>свой формат</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {packages.map((pkg, i) => (
            <div key={i} style={{ background: pkg.featured ? "#161819" : "#0A0A0A", border: `1px solid ${pkg.featured ? "rgba(197,240,74,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 4, padding: "28px", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              {pkg.featured && (
                <div style={{ position: "absolute", top: -1, left: 20, fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.14em", padding: "3px 8px", background: "#C5F04A", color: "#0A0A0A", fontWeight: 700 }}>
                  ОПТИМАЛЬНО
                </div>
              )}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 8 }}>{pkg.name}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#C5F04A", lineHeight: 1 }}>{pkg.price}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(240,239,233,0.4)", marginTop: 4 }}>{pkg.duration}</div>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.55)", lineHeight: 1.5, flexGrow: 1 }}>{pkg.desc}</div>
              <a href={ctaUrl} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, padding: "12px 20px", borderRadius: 2, background: pkg.featured ? "#C5F04A" : "transparent", color: pkg.featured ? "#0A0A0A" : "rgba(240,239,233,0.5)", border: pkg.featured ? "none" : "1px solid rgba(255,255,255,0.1)", textDecoration: "none", textAlign: "center", display: "block", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!pkg.featured) { (e.currentTarget as HTMLElement).style.color = "#F0EFE9"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; } else { (e.currentTarget as HTMLElement).style.background = "#DEFF72"; } }}
                onMouseLeave={e => { if (!pkg.featured) { (e.currentTarget as HTMLElement).style.color = "rgba(240,239,233,0.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; } else { (e.currentTarget as HTMLElement).style.background = "#C5F04A"; } }}>
                Обсудить {pkg.name} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
