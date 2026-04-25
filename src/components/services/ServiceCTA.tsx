import { useState } from "react";
import "@/styles/services.css";

export default function ServiceCTA({ service }: { service: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Заявка: ${service}\nИмя: ${name}\nКонтакт: ${contact}\n${message ? `Задача: ${message}` : ""}`
    );
    window.open(`https://t.me/neeeekn?text=${text}`, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <section id="cta" style={{ background: "#0A0A0A", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

          {/* Left: text */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 12 }}>ОБСУДИТЬ ЗАДАЧУ</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-1px", color: "#F0EFE9", lineHeight: 1.1, marginBottom: 16 }}>
              Нужен<br /><span style={{ color: "#C5F04A" }}>{service}?</span>
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(240,239,233,0.5)", lineHeight: 1.7, marginBottom: 32 }}>
              Опишите задачу — ответим в течение часа и подготовим смету за 24 часа. Бесплатно.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "✈️", label: "Telegram", value: "@neeeekn", href: "https://t.me/neeeekn" },
                { icon: "✉️", label: "Email", value: "neeklostudio@gmail.com", href: "mailto:neeklostudio@gmail.com" },
              ].map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.12em", color: "rgba(240,239,233,0.35)", textTransform: "uppercase", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.7)" }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "36px" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#C5F04A", marginBottom: 12 }}>✓</div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#F0EFE9", marginBottom: 8 }}>Заявка отправлена</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.5)" }}>Откроется Telegram. Ответим в течение часа.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="svc-cta-form">
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 4 }}>
                  Оставить заявку
                </p>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="svc-cta-input"
                />
                <input
                  type="text"
                  placeholder="Telegram или телефон"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="svc-cta-input"
                />
                <textarea
                  placeholder="Опишите задачу (опционально)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="svc-cta-input svc-cta-textarea"
                />
                <button
                  type="submit"
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 2, background: "#C5F04A", color: "#0A0A0A", border: "none", cursor: "pointer", transition: "background 0.2s", width: "100%" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#DEFF72")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#C5F04A")}
                >
                  Обсудить в Telegram →
                </button>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(240,239,233,0.3)", textAlign: "center" }}>
                  Откроется Telegram с заполненным сообщением
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
