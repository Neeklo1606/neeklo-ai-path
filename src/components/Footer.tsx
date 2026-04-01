import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Send, Globe, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoWhite from "@/assets/logo-white.png";

const serviceLinks = [
  { label: "AI-ролики", path: "/chat" },
  { label: "Сайт под ключ", path: "/chat" },
  { label: "Telegram Mini App", path: "/chat" },
  { label: "AI-агент", path: "/chat" },
  { label: "Автоматизация", path: "/chat" },
];

const navLinks = [
  { label: "Главная", path: "/" },
  { label: "Чат", path: "/chat" },
  { label: "Наши работы", path: "/works" },
  { label: "Услуги", path: "/services" },
  { label: "Проекты", path: "/projects" },
];

const legalLinks = [
  { label: "Политика конфиденциальности", path: "/legal/privacy" },
  { label: "Публичная оферта", path: "/legal/offer" },
  { label: "Политика Cookie", path: "/legal/cookies" },
];

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="group flex items-center gap-2 font-body transition-colors duration-150"
    style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
  >
    <span
      className="rounded-full flex-shrink-0 transition-all duration-200 group-hover:bg-white"
      style={{ width: 6, height: 6, background: "rgba(255,255,255,0.2)" }}
    />
    <span className="group-hover:text-white transition-colors duration-150">{children}</span>
  </Link>
);

const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <p
    className="font-body uppercase mb-4"
    style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}
  >
    {children}
  </p>
);

const Footer = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimName = name.trim();
    const trimContact = contact.trim();
    if (!trimName || !trimContact) {
      setError("Заполните обязательные поля");
      return;
    }
    if (trimName.length > 100 || trimContact.length > 255 || message.length > 1000) {
      setError("Слишком длинный текст");
      return;
    }
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("contact_requests").insert({
        name: trimName,
        contact: trimContact,
        message: message.trim() || null,
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError("Ошибка отправки, попробуйте позже");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setContact("");
    setMessage("");
    setError("");
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    width: "100%",
    transition: "0.15s",
    fontFamily: "Onest, sans-serif",
  };

  return (
    <footer style={{ background: "#0D0D0B", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
          zIndex: 0,
        }}
      />

      <div
        className="relative z-[1] mx-auto"
        style={{ maxWidth: 1200, padding: "64px 40px 32px" }}
      >
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Left block */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logoWhite} alt="neeklo studio" className="h-12 w-auto opacity-90" />
            </div>

            {/* Tagline */}
            <p className="font-body" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 300 }}>
              AI-продакшн студия в Бангкоке.<br />
              Сайты, Mini App, AI-агенты и видео.
            </p>

            {/* Legal */}
            <p className="font-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              ИП Клочко Н.Н. · ИНН 263520430560
            </p>

            {/* Contact form */}
            <div className="mt-1">
              <p className="font-body mb-2" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                Оставить заявку
              </p>

              {submitted ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 40, height: 40, background: "rgba(0,200,83,0.15)" }}
                  >
                    <Check size={20} color="#00C853" />
                  </div>
                  <p className="font-body mt-3" style={{ fontSize: 15, fontWeight: 600 }}>Заявка отправлена!</p>
                  <p className="font-body mt-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Свяжемся в течение часа</p>
                  <button
                    onClick={handleReset}
                    className="font-body mt-3 cursor-pointer hover:text-white transition-colors"
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", background: "none", border: "none" }}
                  >
                    Отправить ещё
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(255,255,255,0.3)] focus:bg-[rgba(255,255,255,0.1)]"
                  />
                  <input
                    type="text"
                    placeholder="Email или Telegram"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(255,255,255,0.3)] focus:bg-[rgba(255,255,255,0.1)]"
                  />
                  <textarea
                    placeholder="Опишите задачу вкратце"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "none", maxHeight: 100 }}
                    className="placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(255,255,255,0.3)] focus:bg-[rgba(255,255,255,0.1)]"
                  />
                  {error && (
                    <p className="font-body" style={{ fontSize: 12, color: "#FF6B6B" }}>{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 font-body cursor-pointer hover:bg-[#F0EEE8] hover:-translate-y-[1px] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      borderRadius: 10,
                      background: "#fff",
                      color: "#0D0D0B",
                      fontSize: 14,
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Отправить заявку <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right block — 3 link columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">
            {/* Services */}
            <div>
              <ColumnTitle>Услуги</ColumnTitle>
              <div className="flex flex-col gap-3">
                {serviceLinks.map((l) => (
                  <FooterLink key={l.label} to={l.path}>{l.label}</FooterLink>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <ColumnTitle>Навигация</ColumnTitle>
              <div className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <FooterLink key={l.label} to={l.path}>{l.label}</FooterLink>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="col-span-2 md:col-span-1">
              <ColumnTitle>Контакты</ColumnTitle>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:hello@neeklo.studio"
                  className="font-body hover:text-white transition-colors duration-150"
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
                >
                  hello@neeklo.studio
                </a>
                <a
                  href="https://t.me/neeklo_studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body flex items-center gap-2 hover:text-white transition-colors duration-150"
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
                >
                  <Send size={14} />
                  @neeklo_studio
                </a>
                <span className="font-body" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                  Бангкок / Москва
                </span>
              </div>

              {/* Social icons */}
              <div className="flex gap-3 mt-4">
                <a
                  href="https://t.me/neeklo_studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <Send size={18} />
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <ArrowRight size={18} />
                </a>
                <a
                  href="https://neeklo.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <Globe size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-12 md:mt-12 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Left */}
          <span className="font-mono font-body text-center md:text-left" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            // © 2026 Neeklo Studio
          </span>

          {/* Center — status */}
          <div
            className="flex items-center justify-center gap-1.5 self-center"
            style={{
              padding: "4px 12px",
              border: "1px solid rgba(0,200,83,0.15)",
              borderRadius: 9999,
              background: "rgba(0,200,83,0.05)",
            }}
          >
            <span
              className="rounded-full flex-shrink-0 animate-pulse"
              style={{ width: 6, height: 6, background: "#00C853" }}
            />
            <span className="font-body uppercase" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
              Все системы работают
            </span>
          </div>

          {/* Right — legal */}
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            {legalLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="font-body hover:text-[rgba(255,255,255,0.6)] transition-colors duration-150"
                style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile safe area padding */}
      <style>{`
        @media (max-width: 767px) {
          footer > .relative { padding: 48px 20px calc(32px + env(safe-area-inset-bottom)) !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
