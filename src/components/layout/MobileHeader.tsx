import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useBrief } from "@/context/BriefContext";

const NAV_ITEMS = [
  { key: "nav.home" as const, path: "/" },
  { key: "nav.chat" as const, path: "/chat" },
  { key: "nav.services" as const, path: "/services" },
  { key: "nav.works" as const, path: "/cases" },
  { key: "nav.projects" as const, path: "/projects" },
  { key: "nav.profile" as const, path: "/profile" },
] as const;

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLanguage();
  const { open: openBrief } = useBrief();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4"
        style={{
          height: 52,
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--bd)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center hover:opacity-75 transition-opacity"
          aria-label="На главную"
        >
          <BrandLogo variant="header" className="h-7 w-auto" />
        </button>

        <div className="flex items-center gap-1">
          <ThemeToggle size="sm" />
          <button
            onClick={toggleLang}
            className="flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-semibold uppercase tracking-wide"
            style={{
              color: "var(--tx-muted)",
              background: "var(--surface-2)",
              border: "1px solid var(--bd)",
            }}
          >
            {lang === "ru" ? "EN" : "RU"}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ color: "var(--tx)" }}
            aria-label="Открыть меню"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-[70] flex flex-col md:hidden"
        style={{
          width: "min(78vw, 300px)",
          height: "100dvh",
          background: "var(--surface)",
          borderLeft: "1px solid var(--bd)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.26s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: open ? "var(--shadow-modal)" : "none",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{
            height: 52,
            borderBottom: "1px solid var(--bd)",
          }}
        >
          <BrandLogo variant="header" className="h-7 w-auto" />
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--tx-muted)" }}
            aria-label="Закрыть меню"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV_ITEMS.map(({ key, path }) => {
            const active =
              path === "/" ? pathname === "/" : pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className="flex items-center w-full text-left px-4 rounded-xl text-[15px] font-medium transition-colors duration-150 touch-manipulation"
                style={{
                  height: 48,
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--tx)" : "var(--tx-muted)",
                  borderLeft: active
                    ? "2px solid var(--ac-b)"
                    : "2px solid transparent",
                }}
              >
                {t(key)}
              </button>
            );
          })}
        </nav>

        {/* CTA */}
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--bd)" }}
        >
          <button
            onClick={() => { setOpen(false); openBrief(); }}
            className="flex items-center justify-center gap-2 w-full rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.97] touch-manipulation"
            style={{
              height: 48,
              background: "var(--tx)",
              color: "var(--bg)",
            }}
          >
            {lang === "ru" ? "Начать проект" : "Start project"}
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </>
  );
}
