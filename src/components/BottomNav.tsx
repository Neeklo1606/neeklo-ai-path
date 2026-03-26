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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around" style={{ padding: "8px 0 calc(8px + env(safe-area-inset-bottom))" }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] justify-center rounded-lg transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
