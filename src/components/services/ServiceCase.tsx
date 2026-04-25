export interface CaseData {
  client: string;
  task: string;
  result1: string;
  result2: string;
  result3: string;
}

export default function ServiceCase({ data }: { data: CaseData }) {
  return (
    <section id="case" style={{ background: "#0A0A0A", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>КЕЙС</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Реальный<br /><span style={{ color: "#C5F04A" }}>результат</span>
          </h2>
        </div>
        <div style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(197,240,74,0.7)", textTransform: "uppercase", marginBottom: 8 }}>Клиент</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#F0EFE9", marginBottom: 20 }}>{data.client}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Задача</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(240,239,233,0.65)", lineHeight: 1.6 }}>{data.task}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "start" }}>
            {[data.result1, data.result2, data.result3].map((r, i) => (
              <div key={i} style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "16px", ...(i === 2 ? { gridColumn: "1 / -1" } : {}) }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#C5F04A", marginBottom: 4 }}>{r.split(" ")[0]}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(240,239,233,0.45)", lineHeight: 1.4 }}>{r.split(" ").slice(1).join(" ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
