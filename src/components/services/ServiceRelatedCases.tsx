import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cases } from "@/data/cases";
import { serviceTagLabelsFor, type ServiceSlug } from "@/data/serviceTags";
import FadeIn from "@/components/ui/FadeIn";

/**
 * «Наши работы» на страницах услуг: 3 последних кейса с тегом текущей услуги.
 * Если совпадений нет — секция не рендерится вовсе (ни заглушки, ни пустого блока).
 */
export default function ServiceRelatedCases({ serviceSlug }: { serviceSlug: ServiceSlug }) {
  const related = cases.filter((c) => (c.tags as string[]).includes(serviceSlug)).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section id="works" style={{ background: "var(--surface)", padding: "80px 0" }}>
      <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="flex items-end justify-between" style={{ marginBottom: 48, gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>НАШИ РАБОТЫ</p>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
              Уже сделали<br />похожее
            </h2>
          </div>
          <Link
            to="/cases"
            className="flex items-center gap-1 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-muted)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, paddingBottom: 6 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-muted)"; }}
          >
            Все кейсы
            <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {related.map((c) => {
            const labels = serviceTagLabelsFor(c.id);
            const inner = (
              <>
                {/* Media */}
                <div className={`relative aspect-video bg-gradient-to-br ${c.color} overflow-hidden`}>
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.title}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", padding: "3px 9px", borderRadius: 6, background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}>
                      {c.badge}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div style={{ padding: "16px 18px 18px" }}>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--tx)", lineHeight: 1.3, marginBottom: 6 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "var(--accent-signal)", lineHeight: 1.2, marginBottom: 8 }}>
                    {c.metric}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.55, marginBottom: 12 }}>
                    {c.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {labels.map((label) => (
                      <span key={label} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 9999, background: "var(--surface-2)", color: "var(--tx-faint)", border: "1px solid var(--bd)" }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );

            const cardStyle: React.CSSProperties = {
              background: "var(--bg)",
              border: "1px solid var(--bd)",
              borderRadius: 16,
              overflow: "hidden",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
            };
            const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--bd-hover)";
              el.style.boxShadow = "var(--shadow-card-hover)";
              el.style.transform = "translateY(-2px)";
            };
            const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--bd)";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            };

            if (c.url) {
              return (
                <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="group" style={cardStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  {inner}
                </a>
              );
            }
            return (
              <Link key={c.id} to="/cases" className="group" style={cardStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {inner}
              </Link>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
}
