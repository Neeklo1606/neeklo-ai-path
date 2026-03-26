import { Send, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const productLinks = [
  { label: "Разработка сайтов", path: "/services/sajt-pod-klyuch" },
  { label: "Telegram-боты и Mini Apps", path: "/services/telegram-mini-app" },
  { label: "AI-видео", path: "/services/ai-roliki" },
  { label: "AI-агент", path: "/services/ai-agent" },
];

const companyLinks = [
  { label: "О нас", path: "/" },
  { label: "Кейсы", path: "/projects" },
  { label: "Продукты", path: "/#works" },
  { label: "Процесс", path: "/#how" },
  { label: "Контакты", path: "/profile" },
];

const legalLinks = [
  { label: "Политика конфиденциальности", path: "/legal/privacy" },
  { label: "Пользовательское соглашение", path: "/legal/terms" },
  { label: "Публичная оферта", path: "/legal/offer" },
  { label: "Согласие на обработку ПДн", path: "/legal/consent" },
  { label: "Политика Cookie", path: "/legal/cookies" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted/40 border-t border-border">
      {/* Main footer — desktop */}
      <div className="hidden md:block">
        <div className="max-w-[1200px] mx-auto px-8 py-14">
          <div className="grid grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles size={12} className="text-primary-foreground" />
                </div>
                <span className="text-[16px] font-bold text-foreground tracking-tight">neeklo</span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
                Цифровая студия нового поколения.
                <br />
                AI-продакшн, сайты и автоматизация.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/neeklo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:border-foreground/20 transition-colors"
                  aria-label="Telegram канал"
                >
                  <Send size={14} className="text-foreground" />
                </a>
                <a
                  href="mailto:klochkonikita@mail.ru"
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:border-foreground/20 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={14} className="text-foreground" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Продукты</h3>
              <ul className="space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Компания</h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requisites */}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Реквизиты</h3>
              <div className="space-y-1.5 text-[13px] text-muted-foreground mb-5">
                <p className="text-[11px] uppercase tracking-wide font-medium text-foreground/60">Индивидуальный предприниматель</p>
                <p className="font-medium text-foreground">Клочко Никита Николаевич</p>
                <p>ИНН 263520430560</p>
              </div>
              <div className="space-y-2.5">
                <a
                  href="mailto:klochkonikita@mail.ru"
                  className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail size={13} />
                  klochkonikita@mail.ru
                </a>
                <a
                  href="https://t.me/neeklo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Send size={13} />
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground">
              © {new Date().getFullYear()} Neeklo Studio. Все права защищены.
            </p>
            <div className="flex items-center gap-5">
              {legalLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer — compact */}
      <div className="md:hidden px-5 py-6 pb-28">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Sparkles size={10} className="text-primary-foreground" />
          </div>
          <span className="text-[14px] font-bold text-foreground">neeklo</span>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">
          ИП Клочко Н.Н. · ИНН 263520430560
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {legalLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          © {new Date().getFullYear()} Neeklo Studio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
