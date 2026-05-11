import { useState } from "react";
import { Home, MessageSquare, FolderOpen, User, Sparkles, Image, Search, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import SearchOverlay from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";

const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, lang, toggleLang } = useLanguage();

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: MessageSquare, label: t("nav.chat"), path: "/chat" },
    { icon: Sparkles, label: t("nav.services"), path: "/services" },
    { icon: Image, label: t("nav.works"), path: "/cases" },
    { icon: FolderOpen, label: t("nav.projects"), path: "/projects" },
    { icon: User, label: t("nav.profile"), path: "/profile" },
  ];

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 backdrop-blur-xl" style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)", borderBottom: "1px solid var(--bd)" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[64px] px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <BrandLogo variant="header" className="h-12 w-auto" />
          </button>

          <nav className="flex items-center gap-1">
            {navItems.filter((n) => n.path !== "/profile").map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    color: active ? "var(--tx)" : "var(--tx-muted)",
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                  {label}
                </button>
              );
            })}

            {/* Lang switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg text-[12px] font-semibold transition-colors duration-150 ml-1 font-body uppercase tracking-wide"
              style={{ color: "var(--tx-muted)", background: "var(--surface-2)", border: "1px solid var(--bd)" }}
              title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>

            <ThemeToggle className="ml-1" />
            <button onClick={() => setSearchOpen(true)} className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150 ml-0.5" style={{ color: "var(--tx-muted)" }}>
              <Search size={18} strokeWidth={1.8} />
            </button>

            <button onClick={() => navigate("/notifications")} className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150" style={{ color: "var(--tx-muted)" }}>
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>

            {(() => {
              const prof = navItems.find((n) => n.path === "/profile")!;
              const active = location.pathname === prof.path;
              return (
                <button
                  onClick={() => navigate(prof.path)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    color: active ? "var(--tx)" : "var(--tx-muted)",
                  }}
                >
                  <prof.icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                  {prof.label}
                </button>
              );
            })()}
          </nav>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
};

export default DesktopNav;
