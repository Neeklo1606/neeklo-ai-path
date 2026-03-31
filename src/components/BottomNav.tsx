import { Home, MessageCircle, FolderOpen, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: MessageCircle, label: "Чат", path: "/chat" },
  { icon: FolderOpen, label: "Проекты", path: "/projects" },
  { icon: User, label: "Профиль", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 sm:hidden"
      style={{
        height: 64,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid #F0F0F0",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-4 h-full">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-1 active:scale-[0.92] transition-transform duration-75"
              style={{ color: active ? "#0D0D0B" : "#888" }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span
                className="font-body leading-none"
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
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
