import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { useBrief } from "@/context/BriefContext";

const SERVICES = [
  { label: "Сайт + AI-ассистент", to: "/products/site-ai-crm" },
  { label: "AI-видео",            to: "/products/ai-video" },
  { label: "Telegram-бот",        to: "/products/telegram-bot" },
  { label: "AI-ассистент",        to: "/products/ai-assistant" },
  { label: "Все услуги",          to: "/services" },
];

const COL_HEAD = "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3";

export default function Footer() {
  const { open } = useBrief();

  return (
    <footer className="border-t border-border pt-10 pb-8 bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Grid — 1 col xs, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-0">

          {/* Col 1 — Brand */}
          <div className="col-span-2 lg:col-span-1">
            <p className="font-bold text-xl text-foreground" style={{ fontFamily: "'Onest', sans-serif" }}>
              neeklo
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[200px]">
              AI-продакшн студия. Сайты, боты, AI-агенты и видео.
            </p>
            <div className="mt-4 space-y-0.5 text-xs text-muted-foreground">
              <div>ИП Клочко Н.Н.</div>
              <div>ИНН 263520430560</div>
            </div>
            <a
              href="https://t.me/neeekn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline transition-colors"
            >
              <Send size={13} />
              Написать в Telegram
            </a>
          </div>

          {/* Col 2 — Services */}
          <div>
            <p className={COL_HEAD}>УСЛУГИ</p>
            <div className="space-y-2">
              {SERVICES.map((l) => (
                <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <p className={COL_HEAD}>НАВИГАЦИЯ</p>
            <div className="space-y-2">
              <FooterLink to="/">Главная</FooterLink>
              <FooterLink to="/cases">Работы</FooterLink>
              <FooterLink to="/blog">Блог</FooterLink>
              <FooterLink to="/contact">Контакты</FooterLink>
              <button
                type="button"
                onClick={() => open()}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 text-left"
              >
                Начать проект
              </button>
            </div>
          </div>

          {/* Col 4 — Contacts */}
          <div>
            <p className={COL_HEAD}>КОНТАКТЫ</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a
                href="https://t.me/neeekn"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-foreground transition-colors duration-150"
                style={{ textDecoration: "none" }}
              >
                @neeekn
              </a>
              <a
                href="mailto:hi@neeklo.ru"
                className="block hover:text-foreground transition-colors duration-150"
                style={{ textDecoration: "none" }}
              >
                hi@neeklo.ru
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-border mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-xs text-muted-foreground">
              © 2020–2026 neeklo
            </span>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors duration-150"
                style={{ textDecoration: "none" }}
              >
                Конфиденциальность
              </Link>
              <Link
                to="/offer"
                className="hover:text-foreground transition-colors duration-150"
                style={{ textDecoration: "none" }}
              >
                Оферта
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
      style={{ textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}
