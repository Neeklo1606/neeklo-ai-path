export interface ForWhomItem {
  emoji: string;
  title: string;
  text: string;
}

export default function ServiceForWhom({ items }: { items: ForWhomItem[] }) {
  return (
    <section id="for-whom" style={{ background: "#0A0A0A", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>ДЛЯ КОГО</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Кому это<br /><span style={{ color: "#C5F04A" }}>подойдёт</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "24px", transition: "border-color 0.2s, background 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,240,74,0.25)"; (e.currentTarget as HTMLElement).style.background = "rgba(197,240,74,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.background = "#111214"; }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0EFE9", marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.45)", lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
