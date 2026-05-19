import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import SearchOverlay from "@/components/SearchOverlay";
import { useLanguage } from "@/hooks/useLanguage";

const NAV_ITEMS = [
  { key: "nav.home" as const, path: "/" },
  { key: "nav.services" as const, path: "/services" },
  { key: "nav.works" as const, path: "/cases" },
  { key: "nav.projects" as const, path: "/projects" },
] as const;

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header
        className="hidden md:block sticky top-0 z-50"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--bd)",
        }}
      >
        <div
          className="mx-auto flex items-center gap-8 px-8"
          style={{ maxWidth: 1200, height: 60 }}
        >
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0 hover:opacity-75 transition-opacity duration-150"
            aria-label="На главную"
          >
            <BrandLogo variant="header" className="h-8 w-auto" />
          </button>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map(({ key, path }) => {
              const active =
                path === "/" ? pathname === "/" : pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150"
                  style={{
                    color: active ? "var(--tx)" : "var(--tx-muted)",
                    background: active ? "var(--surface-2)" : "transparent",
                  }}
                >
                  {t(key)}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--ac-b)" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleLang}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150"
              style={{
                color: "var(--tx-muted)",
                background: "var(--surface-2)",
                border: "1px solid var(--bd)",
                letterSpacing: "0.08em",
              }}
              title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>

            <ThemeToggle size="sm" />

            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
              style={{
                background: "var(--tx)",
                color: "var(--bg)",
              }}
            >
              {lang === "ru" ? "Начать" : "Start"}
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
