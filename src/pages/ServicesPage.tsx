import { useNavigate } from "react-router-dom";

interface ServiceCard {
  slug: string;
  emoji: string;
  badge?: string;
  title: string;
  desc: string;
  includes: string[];
  tags: string[];
  price: string;
  duration: string;
}

const services: ServiceCard[] = [
  {
    slug: "ai-video",
    emoji: "🎬",
    badge: "ХИТ",
    title: "AI-видеоролики",
    desc: "Рекламные ролики, reels и презентации с нейросетями без съёмочной группы.",
    includes: ["Сценарий и раскадровка", "Генерация (Runway / Kling / HeyGen)", "Монтаж и озвучка"],
    tags: ["Runway", "HeyGen", "Kling"],
    price: "от 25 000 ₽",
    duration: "от 3 дней",
  },
  {
    slug: "web",
    emoji: "🌐",
    title: "Сайт с админ-панелью",
    desc: "Лендинг или корпоративный сайт с AI-ассистентом, SEO и удобной CMS.",
    includes: ["Дизайн и вёрстка (React)", "AI-ассистент на сайте", "CMS для редактирования"],
    tags: ["React", "Next.js", "Tailwind"],
    price: "от 95 000 ₽",
    duration: "от 14 дней",
  },
  {
    slug: "ai-assistant",
    emoji: "🤖",
    title: "AI-ассистент",
    desc: "Отвечает на вопросы, обрабатывает заявки и работает 24/7 вместо менеджера.",
    includes: ["GPT-4 / Claude база", "Квалификация лидов", "CRM-интеграция"],
    tags: ["GPT-4", "Claude", "RAG"],
    price: "от 50 000 ₽",
    duration: "от 7 дней",
  },
  {
    slug: "telegram",
    emoji: "✈️",
    badge: "POPULAR",
    title: "Telegram-бот / Mini App",
    desc: "AI-продавец в Telegram, который квалифицирует заявки и не теряет клиентов.",
    includes: ["AI-ответы в диалоге", "Квалификация лидов", "Mini App (опционально)"],
    tags: ["Telegram", "Python", "Mini App"],
    price: "от 40 000 ₽",
    duration: "от 7 дней",
  },
  {
    slug: "education",
    emoji: "🧠",
    title: "Обучение по нейросетям",
    desc: "Практический курс для предпринимателей и команд. Внедряешь AI — сразу в работу.",
    includes: ["Под вашу нишу и задачи", "ChatGPT, Claude, Midjourney", "Промпты и шаблоны"],
    tags: ["ChatGPT", "Claude", "Midjourney"],
    price: "от 8 900 ₽",
    duration: "от 1 дня",
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#0A0A0A", color: "#F0EFE9", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ padding: "80px 0 60px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(240,239,233,0.4)", textTransform: "uppercase", marginBottom: 16 }}>УСЛУГИ</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-1.5px", lineHeight: 1.05, color: "#F0EFE9", marginBottom: 16 }}>
            Делаем AI-продукты<br /><span style={{ color: "#C5F04A" }}>под ключ</span>
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 17, color: "rgba(240,239,233,0.55)", maxWidth: 500, lineHeight: 1.6 }}>
            Сайты, боты, AI-ассистенты и видео с нейросетями. От идеи до результата.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
            {services.map((s) => (
              <div
                key={s.slug}
                onClick={() => navigate(`/services/${s.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/services/${s.slug}`); }}
                style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "28px", cursor: "pointer", transition: "border-color 0.2s, background 0.2s", position: "relative", display: "flex", flexDirection: "column", gap: 16 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,240,74,0.25)"; (e.currentTarget as HTMLElement).style.background = "rgba(197,240,74,0.04)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.background = "#111214"; }}
              >
                {s.badge && (
                  <span style={{ position: "absolute", top: 20, right: 20, fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.14em", padding: "3px 8px", borderRadius: 2, border: "1px solid rgba(197,240,74,0.25)", background: "rgba(197,240,74,0.1)", color: "#C5F04A" }}>
                    {s.badge}
                  </span>
                )}

                <div style={{ fontSize: 32 }}>{s.emoji}</div>

                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#F0EFE9", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(240,239,233,0.45)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.includes.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0, marginTop: 4 }}><path d="M1 4L3.5 6.5L9 1" stroke="#C5F04A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(240,239,233,0.6)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.1em", padding: "3px 7px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,239,233,0.4)" }}>{tag}</span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: "auto" }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#C5F04A" }}>{s.price}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(240,239,233,0.4)", marginTop: 2 }}>{s.duration}</div>
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(240,239,233,0.6)" }}>Заказать →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 40px)", letterSpacing: "-1px", color: "#F0EFE9", marginBottom: 12 }}>
              Не знаешь что выбрать?
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(240,239,233,0.5)", marginBottom: 28 }}>
              Опишите задачу — подберём решение и сделаем смету за 24 часа. Бесплатно.
            </p>
            <a href="https://t.me/neeeekn" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 40px", borderRadius: 2, background: "#C5F04A", color: "#0A0A0A", textDecoration: "none", display: "inline-block" }}>
              Написать в Telegram →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
