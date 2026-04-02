import { useState } from "react";
import { Home, MessageSquare, FolderOpen, User, Sparkles, Image, Search, Bell } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import SearchOverlay from "@/components/SearchOverlay";
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
      <header className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[64px] px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="neeklo studio" className="h-12 w-auto" />
          </button>

          <nav className="flex items-center gap-1">
            {navItems.filter((n) => n.path !== "/profile").map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                  {label}
                </button>
              );
            })}

            {/* Lang switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 ml-1 font-body uppercase tracking-wide"
              title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>

            <button onClick={() => setSearchOpen(true)} className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 ml-1">
              <Search size={18} strokeWidth={1.8} />
            </button>

            <button onClick={() => navigate("/notifications")} className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150">
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>

            {(() => {
              const prof = navItems.find((n) => n.path === "/profile")!;
              const active = location.pathname === prof.path;
              return (
                <button
                  onClick={() => navigate(prof.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
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
