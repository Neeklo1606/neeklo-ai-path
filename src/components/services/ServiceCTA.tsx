import { useState } from "react";
import "@/styles/services.css";
import { TELEGRAM_URL, TELEGRAM_HANDLE, EMAIL } from "@/constants";

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
    window.open(`${TELEGRAM_URL}?text=${text}`, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <section id="cta" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

          {/* Left: text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>ОБСУДИТЬ ЗАДАЧУ</p>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1, marginBottom: 16 }}>
              Нужен<br />{service}?
            </h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7, marginBottom: 32 }}>
              Опишите задачу, ответим в течение часа и подготовим смету за 24 часа. Бесплатно.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "✈️", label: "Telegram", value: TELEGRAM_HANDLE, href: TELEGRAM_URL },
                { icon: "✉️", label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
              ].map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 14, color: "var(--tx)" }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, padding: "36px" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: 32, color: "var(--accent-signal)", marginBottom: 12 }}>✓</div>
                <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--tx)", marginBottom: 8 }}>Заявка отправлена</p>
                <p style={{ fontSize: 14, color: "var(--tx-muted)" }}>Откроется Telegram. Ответим в течение часа.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="svc-cta-form">
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 4 }}>
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
                  style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 9999, background: "var(--accent-signal)", color: "var(--bg)", border: "none", cursor: "pointer", transition: "background 0.2s", width: "100%" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-signal-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-signal)")}
                >
                  Обсудить в Telegram →
                </button>
                <p style={{ fontSize: 11, color: "var(--tx-faint)", textAlign: "center" }}>
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
