import { useState } from "react";

export interface FAQItem {
  q: string;
  a: string;
}

export default function ServiceFAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ background: "#111214", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1 }}>
            Частые<br /><span style={{ color: "#C5F04A" }}>вопросы</span>
          </h2>
        </div>
        <div style={{ maxWidth: 800 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
              >
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0EFE9", lineHeight: 1.4 }}>{item.q}</span>
                <div style={{ width: 28, height: 28, borderRadius: 2, border: `1px solid ${open === i ? "rgba(197,240,74,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.2s" }}>
                  <span style={{ color: open === i ? "#C5F04A" : "rgba(240,239,233,0.5)", fontSize: 18, lineHeight: 1, fontFamily: "monospace" }}>{open === i ? "×" : "+"}</span>
                </div>
              </button>
              <div style={{ maxHeight: open === i ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(240,239,233,0.55)", lineHeight: 1.6, paddingBottom: 20 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
