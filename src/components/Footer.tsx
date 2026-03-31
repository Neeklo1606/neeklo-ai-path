import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const legalLinks = [
  { label: "Политика конфиденциальности", path: "/legal/privacy" },
  { label: "Пользовательское соглашение", path: "/legal/terms" },
  { label: "Публичная оферта", path: "/legal/offer" },
  { label: "Согласие на обработку ПДн", path: "/legal/consent" },
  { label: "Политика Cookie", path: "/legal/cookies" },
];

const linkClass =
  "font-body text-[13px] transition-colors duration-150 hover:text-[#0D0D0B]";

const Footer = () => (
  <footer
    className="max-w-[1200px] mx-auto px-4 sm:px-8"
    style={{ borderTop: "1px solid #F0F0F0", padding: "32px 0" }}
  >
    {/* ROW 1 */}
    <div className="flex flex-col sm:flex-row sm:justify-between gap-6 sm:gap-6 px-4 sm:px-8">
      {/* Left: brand */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <img src={logoImg} alt="neeklo studio" className="h-6 w-auto" />
        </div>
        <p className="font-body text-[13px] leading-[1.5]" style={{ color: "#888" }}>
          ИП Клочко Н.Н. · ИНН 263520430560
        </p>
        <a
          href="mailto:hello@neeklo.studio"
          className={`${linkClass} block mt-1`}
          style={{ color: "#888" }}
        >
          hello@neeklo.studio
        </a>
      </div>

      {/* Right: legal links */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-2 sm:max-w-[480px] sm:justify-end">
        {legalLinks.map((l) => (
          <Link key={l.path} to={l.path} className={linkClass} style={{ color: "#888" }}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>

    {/* ROW 2 */}
    <div
      className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 mt-5 pt-5 px-4 sm:px-8"
      style={{ borderTop: "1px solid #F0F0F0" }}
    >
      <span className="font-body text-[13px]" style={{ color: "#888" }}>
        © 2026 Neeklo Studio
      </span>
      <a
        href="https://t.me/neeklo"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        style={{ color: "#888" }}
      >
        Telegram →
      </a>
    </div>
  </footer>
);

export default Footer;
