export interface ProcessStep {
  num: string;
  title: string;
  text: string;
}

import FadeIn from "@/components/ui/FadeIn";

export default function ServiceProcess({ steps }: { steps: ProcessStep[] }) {
  return (
    <section id="process" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>ПРОЦЕСС</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Как мы<br />работаем
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative", padding: "28px", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16 }}>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 40, color: "var(--tx-faint)", lineHeight: 1, marginBottom: 16 }}>{step.num}</div>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--tx)", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.5 }}>{step.text}</p>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: "50%", right: -7, width: 14, height: 14, background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transform: "translateY(-50%)", zIndex: 1 }}>
                  <svg width="6" height="6" viewBox="0 0 6 6"><path d="M1 3h4M3 1l2 2-2 2" stroke="var(--tx-faint)" strokeWidth="1" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
