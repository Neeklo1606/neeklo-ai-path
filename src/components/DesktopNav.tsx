import { useState } from "react";
import { Home, MessageSquare, FolderOpen, User, Sparkles, Image, Search, Bell } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import SearchOverlay from "@/components/SearchOverlay";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: MessageSquare, label: "Чат", path: "/chat" },
  { icon: Sparkles, label: "Услуги", path: "/services" },
  { icon: Image, label: "Работы", path: "/cases" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
  { icon: User, label: "Профиль", path: "/profile" },
];

const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[64px] px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <img src={logoImg} alt="neeklo studio" className="h-11 w-auto" />
          </button>

          <nav className="flex items-center gap-1">
            {navItems.filter((n) => n.path !== "/profile").map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                  {label}
                </button>
              );
            })}

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 ml-1"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>

            {/* Profile */}
            {(() => {
              const prof = navItems.find((n) => n.path === "/profile")!;
              const active = location.pathname === prof.path;
              return (
                <button
                  onClick={() => navigate(prof.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
