import { useState } from "react";

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
    <section id="hero" style={{ background: "#0A0A0A", padding: "120px 0 80px", position: "relative", overflow: "hidden" }}>
      {/* Subtle grid bg */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        {data.badge && (
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", padding: "4px 10px", borderRadius: 2, border: "1px solid rgba(197,240,74,0.25)", background: "rgba(197,240,74,0.1)", color: "#C5F04A" }}>
              {data.badge}
            </span>
          </div>
        )}

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(44px, 8vw, 80px)", letterSpacing: "-1.5px", lineHeight: 1.05, color: "#F0EFE9", marginBottom: 24 }}>
          {lines.map((line, i) => (
            <span key={i}>
              {i === lines.length - 1 ? <span style={{ color: "#C5F04A" }}>{line}</span> : line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 18, color: "rgba(240,239,233,0.6)", maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
          {data.subtitle}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 64 }}>
          <a href="#cta" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 2, background: "#C5F04A", color: "#0A0A0A", textDecoration: "none", display: "inline-block", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#DEFF72")}
            onMouseLeave={e => (e.currentTarget.style.background = "#C5F04A")}>
            Обсудить задачу →
          </a>
          <a href="#packages" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "16px 24px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,239,233,0.5)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#F0EFE9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,239,233,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            Смотреть пакеты
          </a>
        </div>

        {/* Package cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {packages.map((pkg, i) => (
            <div key={i} style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "20px" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", marginBottom: 8, textTransform: "uppercase" }}>{pkg.name}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#C5F04A", marginBottom: 4 }}>{pkg.price}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(240,239,233,0.45)", lineHeight: 1.4 }}>{pkg.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
