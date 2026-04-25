export interface ProcessStep {
  num: string;
  title: string;
  text: string;
}

export default function ServiceProcess({ steps }: { steps: ProcessStep[] }) {
  return (
    <section id="process" style={{ background: "#0A0A0A", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>ПРОЦЕСС</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Как мы<br /><span style={{ color: "#C5F04A" }}>работаем</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative", padding: "28px", background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 40, color: "rgba(197,240,74,0.12)", lineHeight: 1, marginBottom: 16 }}>{step.num}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0EFE9", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.45)", lineHeight: 1.5 }}>{step.text}</p>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: "50%", right: -7, width: 14, height: 14, background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transform: "translateY(-50%)", zIndex: 1 }}>
                  <svg width="6" height="6" viewBox="0 0 6 6"><path d="M1 3h4M3 1l2 2-2 2" stroke="rgba(240,239,233,0.25)" strokeWidth="1" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
