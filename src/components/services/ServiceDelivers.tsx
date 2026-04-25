export default function ServiceDelivers({ items }: { items: string[] }) {
  return (
    <section id="delivers" style={{ background: "#111214", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>ЧТО ВХОДИТ</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Что вы<br /><span style={{ color: "#C5F04A" }}>получаете</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 2, background: "rgba(197,240,74,0.1)", border: "1px solid rgba(197,240,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#C5F04A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(240,239,233,0.8)", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
