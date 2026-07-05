import FadeIn from "@/components/ui/FadeIn";

export interface ForWhomItem {
  emoji: string;
  title: string;
  text: string;
}

export default function ServiceForWhom({ items }: { items: ForWhomItem[] }) {
  return (
    <section id="for-whom" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>ДЛЯ КОГО</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Кому это<br />подойдёт
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, padding: "24px", transition: "border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--bd-hover)"; el.style.background = "var(--surface-2)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-card-hover)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--bd)"; el.style.background = "var(--surface)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--tx)", marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
