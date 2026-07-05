export interface HeroData {
  title: string;        // may contain \n for line breaks
  subtitle: string;
  price: string;
  duration: string;
  badge?: string;
}

interface Props {
  data: HeroData;
  packages: PackageItem[];
}

export interface PackageItem {
  name: string;
  price: string;
  desc: string;
}

export default function ServiceHero({ data, packages }: Props) {
  const lines = data.title.split("\n");
  return (
    <section id="hero" style={{ background: "var(--bg)", padding: "120px 0 80px", position: "relative", overflow: "hidden" }}>
      {/* Subtle grid bg */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        {data.badge && (
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", padding: "4px 10px", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--accent-signal) 30%, transparent)", background: "color-mix(in srgb, var(--accent-signal) 12%, transparent)", color: "var(--accent-signal)", textTransform: "uppercase" }}>
              {data.badge}
            </span>
          </div>
        )}

        <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(44px, 8vw, 80px)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--tx)", marginBottom: 24 }}>
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p style={{ fontSize: 18, fontWeight: 300, color: "var(--tx-muted)", maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
          {data.subtitle}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 64 }}>
          <a href="#cta" style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 9999, background: "var(--accent-signal)", color: "var(--bg)", textDecoration: "none", display: "inline-block", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-signal-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-signal)")}>
            Обсудить задачу →
          </a>
          <a href="#packages" style={{ fontSize: 14, padding: "16px 24px", borderRadius: 9999, border: "1px solid var(--bd)", color: "var(--tx-muted)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--tx)"; e.currentTarget.style.borderColor = "var(--bd-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--tx-muted)"; e.currentTarget.style.borderColor = "var(--bd)"; }}>
            Смотреть пакеты
          </a>
        </div>

        {/* Package cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {packages.map((pkg, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, padding: "20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>{pkg.name}</div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--accent-signal)", marginBottom: 4 }}>{pkg.price}</div>
              <div style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.4 }}>{pkg.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
