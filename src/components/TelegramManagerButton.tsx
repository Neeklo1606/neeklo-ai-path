import { useState } from "react";
import { Send } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const TG_URL = "https://t.me/neeekn";

const TelegramManagerButton = () => {
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <a
        href={TG_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed z-50 hidden md:flex items-center gap-2.5 font-body select-none"
        style={{
          right: 28, bottom: 28,
          padding: "14px 26px 14px 22px", borderRadius: 16,
          background: hovered ? "linear-gradient(135deg, #2AABEE 0%, #1E96D1 100%)" : "linear-gradient(135deg, #229ED9 0%, #1B8DC2 100%)",
          color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none",
          boxShadow: hovered ? "0 12px 36px rgba(34,158,217,0.45), 0 4px 12px rgba(0,0,0,0.15)" : "0 8px 24px rgba(34,158,217,0.3), 0 2px 8px rgba(0,0,0,0.1)",
          transform: hovered ? "translateY(-3px) scale(1.03)" : "translateY(0) scale(1)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Send size={18} style={{ transform: "rotate(-15deg)", flexShrink: 0 }} />
        {t("tg.writeManager")}
        <span className="absolute rounded-full" style={{ top: -3, right: -3, width: 12, height: 12, background: "#00C853", border: "2.5px solid #fff", boxShadow: "0 0 8px rgba(0,200,83,0.6)" }} />
      </a>

      <a
        href={TG_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 md:hidden flex items-center justify-center"
        style={{
          right: 16, bottom: 80, width: 52, height: 52, borderRadius: 16,
          background: "linear-gradient(135deg, #229ED9 0%, #1B8DC2 100%)",
          color: "#fff", textDecoration: "none",
          boxShadow: "0 8px 24px rgba(34,158,217,0.35), 0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <Send size={20} style={{ transform: "rotate(-15deg)" }} />
        <span className="absolute rounded-full" style={{ top: -2, right: -2, width: 10, height: 10, background: "#00C853", border: "2px solid #fff", boxShadow: "0 0 6px rgba(0,200,83,0.6)" }} />
      </a>
    </>
  );
};

export default TelegramManagerButton;
