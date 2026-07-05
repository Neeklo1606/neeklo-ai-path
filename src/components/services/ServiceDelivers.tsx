import FadeIn from "@/components/ui/FadeIn";

export default function ServiceDelivers({ items }: { items: string[] }) {
  return (
    <section id="delivers" style={{ background: "var(--surface)", padding: "80px 0" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>ЧТО ВХОДИТ</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Что вы<br />получаете
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1px solid var(--bd)", alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="var(--tx-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 15, color: "var(--tx)", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
