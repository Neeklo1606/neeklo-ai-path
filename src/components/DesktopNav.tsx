import { Home, MessageSquare, FolderOpen, User, Sparkles, Image } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[64px] px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={14} className="text-primary-foreground" />
          </div>
          <span className="text-[18px] font-bold text-foreground tracking-tight">neeklo</span>
        </button>

        <nav className="flex items-center gap-1">
          {navItems.map(({ icon: Icon, label, path }) => {
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
        </nav>
      </div>
    </header>
  );
};

export default DesktopNav;
