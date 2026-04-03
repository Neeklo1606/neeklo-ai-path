import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Send, Globe } from "lucide-react";
const LOGO_WHITE_SRC = "/cms-static/logo-white.png";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const serviceLinks = [
    { label: t("footer.aiVideos"), path: "/chat" },
    { label: t("footer.websiteKey"), path: "/chat" },
    { label: t("footer.tgMiniApp"), path: "/chat" },
    { label: t("footer.aiAgent"), path: "/chat" },
    { label: t("footer.automation"), path: "/chat" },
  ];

  const navLinks = [
    { label: t("footer.home"), path: "/" },
    { label: t("footer.chat"), path: "/chat" },
    { label: t("footer.ourWorks"), path: "/works" },
    { label: t("footer.services"), path: "/services" },
    { label: t("nav.projects"), path: "/projects" },
  ];

  const legalLinks = [
    { label: t("footer.privacy"), path: "/legal/privacy" },
    { label: t("footer.offer"), path: "/legal/offer" },
    { label: t("footer.cookies"), path: "/legal/cookies" },
  ];

  return (
    <footer style={{ background: "#0D0D0B", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mx-auto" style={{ maxWidth: 1200, padding: "64px 40px 32px" }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="flex items-center">
              <img src={LOGO_WHITE_SRC} alt="neeklo studio" className="h-12 w-auto opacity-90" />
            </div>
            <p className="font-body whitespace-pre-line" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 300 }}>
              {t("footer.desc")}
            </p>
            <p className="font-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              ИП Клочко Н.Н. · ИНН 263520430560
            </p>

            <button
              onClick={() => navigate("/chat")}
              className="flex items-center justify-center gap-2 font-body cursor-pointer hover:bg-[#F0EEE8] hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200 mt-2"
              style={{ width: "100%", maxWidth: 280, padding: "14px 20px", borderRadius: 12, background: "#fff", color: "#0D0D0B", fontSize: 15, fontWeight: 700, border: "none" }}
            >
              {t("footer.startProject")} <ArrowRight size={16} />
            </button>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">
            <div>
              <ColumnTitle>{t("footer.services")}</ColumnTitle>
              <div className="flex flex-col gap-3">
                {serviceLinks.map((l) => <FooterLink key={l.label} to={l.path}>{l.label}</FooterLink>)}
              </div>
            </div>
            <div>
              <ColumnTitle>{t("footer.navigation")}</ColumnTitle>
              <div className="flex flex-col gap-3">
                {navLinks.map((l) => <FooterLink key={l.label} to={l.path}>{l.label}</FooterLink>)}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <ColumnTitle>{t("footer.contacts")}</ColumnTitle>
              <div className="flex flex-col gap-3">
                <a href="mailto:neeklostudio@gmail.com" className="font-body hover:text-white transition-colors duration-150" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>neeklostudio@gmail.com</a>
                <a href="https://t.me/neeekn" target="_blank" rel="noopener noreferrer" className="font-body flex items-center gap-2 hover:text-white transition-colors duration-150" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                  <Send size={14} /> @neeekn
                </a>
              </div>
              <div className="flex gap-3 mt-4">
                <a href="https://t.me/neeekn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-150" style={{ color: "rgba(255,255,255,0.4)" }}><Send size={18} /></a>
                <a href="https://neeklo.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-150" style={{ color: "rgba(255,255,255,0.4)" }}><Globe size={18} /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-12 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-mono font-body text-center md:text-left" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            © 2026 Neeklo Studio
          </span>
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            {legalLinks.map((l) => (
              <Link key={l.path} to={l.path} className="font-body hover:text-[rgba(255,255,255,0.6)] transition-colors duration-150" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          footer > .relative { padding: 48px 20px calc(32px + env(safe-area-inset-bottom)) !important; }
        }
      `}</style>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="group flex items-center gap-2 font-body transition-colors duration-150"
    style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
  >
    <span className="rounded-full flex-shrink-0 transition-all duration-200 group-hover:bg-white" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.2)" }} />
    <span className="group-hover:text-white transition-colors duration-150">{children}</span>
  </Link>
);

const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body uppercase mb-4" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
    {children}
  </p>
);

export default Footer;
