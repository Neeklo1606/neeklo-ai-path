import { Link } from "react-router-dom";
import { Send } from "lucide-react";

// ─── Footer ────────────────────────────────────────────────────────────────────

const SERVICES = [
  { label: "Сайт + ИИ-ассистент + CRM", to: "/catalog/site-ai-crm" },
  { label: "ИИ видео и визуалы",         to: "/catalog/ai-video" },
  { label: "Онлайн-запись и бот",        to: "/catalog/booking-bot" },
  { label: "Telegram Mini App",          to: "/catalog/telegram-mini-app" },
  { label: "Все услуги",                 to: "/services" },
];

const NAV = [
  { label: "Главная",         to: "/" },
  { label: "Работы",          to: "/works" },
  { label: "Кейсы",           to: "/cases" },
  { label: "Блог",            to: "/blog" },
  { label: "Начать проект",   to: "/brief" },
];

const LEGAL = [
  { label: "Политика конфиденциальности", to: "/privacy" },
  { label: "Публичная оферта",            to: "/offer" },
  { label: "Cookies",                     to: "/cookies" },
];

export default function Footer() {
  return (
    <footer className="border-t pt-10 pb-8" style={{ borderColor: "var(--bd)", background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <p
              className="font-bold text-xl"
              style={{ fontFamily: "'Onest', sans-serif", color: "var(--tx)" }}
            >
              neeklo
            </p>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--tx-muted)" }}>
              AI-продакшн студия. Сайты, Mini App, AI-агенты и видео.
            </p>
            <div className="mt-3 space-y-0.5 text-[11px]" style={{ color: "var(--tx-muted)" }}>
              <div>ИП Клочко Н.Н.</div>
              <div>ИНН 263520430560</div>
            </div>
            <a
              href="https://t.me/neeklo_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-[13px] hover:underline transition-colors"
              style={{ color: "var(--ac-b)" }}
            >
              <Send size={13} />
              Написать в Telegram
            </a>
          </div>

          {/* Col 2 — Services */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--tx-faint)" }}>
              Услуги
            </p>
            <div className="space-y-2">
              {SERVICES.map((l) => (
                <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--tx-faint)" }}>
              Навигация
            </p>
            <div className="space-y-2">
              {NAV.map((l) => (
                <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Col 4 — Contacts */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--tx-faint)" }}>
              Контакты
            </p>
            <div className="space-y-2 text-[13px]">
              <a
                href="https://t.me/neeklo_studio"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors duration-150 hover:text-[var(--tx)]"
                style={{ color: "var(--tx-muted)", textDecoration: "none" }}
              >
                @neeklo_studio
              </a>
              <a
                href="mailto:hi@neeklo.ru"
                className="block transition-colors duration-150 hover:text-[var(--tx)]"
                style={{ color: "var(--tx-muted)", textDecoration: "none" }}
              >
                hi@neeklo.ru
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-4" style={{ borderColor: "var(--bd)" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[11px]" style={{ color: "var(--tx-faint)" }}>
            2020–2026 neeklo. Все права защищены.
          </span>
          <div className="flex gap-4 text-[11px]">
            {LEGAL.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="transition-colors duration-150 hover:text-[var(--tx)]"
                style={{ color: "var(--tx-faint)", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="block text-[13px] transition-colors duration-150 hover:text-[var(--tx)]"
    style={{ color: "var(--tx-muted)", textDecoration: "none" }}
  >
    {children}
  </Link>
);
