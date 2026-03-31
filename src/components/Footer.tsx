import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Политика конфиденциальности", path: "/legal/privacy" },
  { label: "Пользовательское соглашение", path: "/legal/terms" },
  { label: "Публичная оферта", path: "/legal/offer" },
  { label: "Согласие на обработку ПДн", path: "/legal/consent" },
  { label: "Политика Cookie", path: "/legal/cookies" },
];

const linkClass = "font-body text-[13px] text-[#6A6860] hover:text-[#0D0D0B] transition-colors duration-150";

const Footer = () => (
  <footer className="bg-white" style={{ borderTop: "1px solid #F0F0F0" }}>
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
      {/* Row 1 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#0D0D0B] flex items-center justify-center text-white font-body" style={{ fontSize: 12 }}>✦</div>
            <span className="font-heading" style={{ fontSize: 16, fontWeight: 700 }}>neeklo</span>
          </div>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "#6A6860" }}>ИП Клочко Н.Н. · ИНН 263520430560</p>
          <a href="mailto:hello@neeklo.studio" className={`${linkClass} block mt-1`}>hello@neeklo.studio</a>
        </div>

        {/* Right: legal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 sm:max-w-[480px] sm:justify-items-end">
          {legalLinks.map((l) => (
            <Link key={l.path} to={l.path} className={linkClass}>{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 mt-5 pt-5" style={{ borderTop: "1px solid #F0F0F0" }}>
        <span className="font-body" style={{ fontSize: 13, color: "#6A6860" }}>© 2026 Neeklo Studio</span>
        <a href="https://t.me/neeklo" target="_blank" rel="noopener noreferrer" className={linkClass}>Telegram →</a>
      </div>
    </div>
  </footer>
);

export default Footer;
