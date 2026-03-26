import { MessageSquare, FolderOpen, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: MessageSquare, label: "Чат", path: "/chat" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
  { icon: User, label: "Профиль", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-lg transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
