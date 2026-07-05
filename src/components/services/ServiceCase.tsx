export interface CaseData {
  client: string;
  task: string;
  result1: string;
  result2: string;
  result3: string;
}

import FadeIn from "@/components/ui/FadeIn";

export default function ServiceCase({ data }: { data: CaseData }) {
  return (
    <section id="case" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>КЕЙС</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Реальный<br />результат
          </h2>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>Клиент</div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 22, color: "var(--tx)", marginBottom: 20 }}>{data.client}</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>Задача</div>
            <div style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.6 }}>{data.task}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "start" }}>
            {[data.result1, data.result2, data.result3].map((r, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: "16px", ...(i === 2 ? { gridColumn: "1 / -1" } : {}) }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: 20, color: "var(--accent-signal)", marginBottom: 4 }}>{r.split(" ")[0]}</div>
                <div style={{ fontSize: 12, color: "var(--tx-muted)", lineHeight: 1.4 }}>{r.split(" ").slice(1).join(" ")}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
