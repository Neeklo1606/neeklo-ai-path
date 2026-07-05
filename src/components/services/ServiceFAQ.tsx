import { useState } from "react";
import FadeIn from "@/components/ui/FadeIn";

export interface FAQItem {
  q: string;
  a: string;
}

export default function ServiceFAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ background: "var(--surface)", padding: "80px 0" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
            Частые<br />вопросы
          </h2>
        </div>
        <div style={{ maxWidth: 800 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--bd)" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
              >
                <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--tx)", lineHeight: 1.4 }}>{item.q}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${open === i ? "var(--bd-hover)" : "var(--bd)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.2s" }}>
                  <span style={{ color: open === i ? "var(--tx)" : "var(--tx-muted)", fontSize: 18, lineHeight: 1, fontFamily: "monospace" }}>{open === i ? "×" : "+"}</span>
                </div>
              </button>
              <div style={{ maxHeight: open === i ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.6, paddingBottom: 20 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
