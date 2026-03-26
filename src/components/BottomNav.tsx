import { Home, MessageSquare, FolderOpen, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: MessageSquare, label: "Чат", path: "/chat" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
  { icon: User, label: "Профиль", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed-bottom-nav bg-background/95 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex justify-around" style={{ padding: "10px 0 calc(10px + env(safe-area-inset-bottom))" }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 min-w-[64px] min-h-[44px] justify-center rounded-lg transition-colors duration-150"
              style={{ color: active ? "hsl(var(--foreground))" : "hsl(215 16% 35%)" }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span
                className="leading-none"
                style={{
                  fontSize: "10px",
                  fontWeight: active ? 600 : 500,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
