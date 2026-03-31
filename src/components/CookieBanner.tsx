import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "neeklo_cookie_consent";
const EASE = "cubic-bezier(0.16,1,0.3,1)";

const CookieBanner = () => {
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "exiting" | "gone">("hidden");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setPhase("gone");
      return;
    }
    const timer = setTimeout(() => setPhase("entering"), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === "entering") {
      const raf = requestAnimationFrame(() => setPhase("visible"));
      return () => cancelAnimationFrame(raf);
    }
    if (phase === "exiting") {
      const timer = setTimeout(() => setPhase("gone"), 400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleChoice = useCallback((value: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, value);
    setPhase("exiting");
  }, []);

  if (phase === "gone" || phase === "hidden") return null;

  const show = phase === "visible";

  return (
    <div
      className="fixed z-[500] left-4 right-4 sm:left-6 sm:right-auto sm:w-[480px] bottom-[calc(64px+12px)] sm:bottom-6"
      style={{
        background: "white",
        border: "1px solid #E5E5E5",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: 16,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(100%)",
        transition: `opacity 0.4s ${EASE}, transform 0.4s ${EASE}`,
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <p className="font-body text-[13px] leading-[1.5] mb-3" style={{ color: "#3A3A3A" }}>
        Мы используем cookie для улучшения сайта. Используя сайт, вы соглашаетесь с нашей{" "}
        <Link to="/legal/cookie-policy" className="underline" style={{ color: "#0052FF" }}>
          Политикой Cookie
        </Link>{" "}
        и обработкой персональных данных (152-ФЗ).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleChoice("declined")}
          className="font-body text-[13px] font-[600] rounded-lg active:scale-[0.97] transition-all duration-150 hover:bg-[#F5F5F5]"
          style={{
            padding: "8px 16px",
            border: "1px solid #E5E5E5",
            background: "white",
            color: "#3A3A3A",
          }}
        >
          Отклонить
        </button>
        <button
          onClick={() => handleChoice("accepted")}
          className="font-body text-[13px] font-[600] rounded-lg active:scale-[0.97] transition-all duration-150 hover:opacity-90"
          style={{
            padding: "8px 16px",
            background: "#0D0D0B",
            color: "white",
          }}
        >
          Принять все
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
