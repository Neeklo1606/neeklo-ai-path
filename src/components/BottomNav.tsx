import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, FolderOpen, User } from "lucide-react";

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
        borderTop: "1px solid hsl(var(--border))",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-4 h-full">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-1 active:scale-[0.92] transition-transform duration-75 relative"
            >
              {/* Active dot indicator */}
              {active && (
                <div
                  className="absolute top-1.5 w-1 h-1 rounded-full transition-all duration-200"
                  style={{ background: "#0D0D0B" }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                style={{
                  color: active ? "#0D0D0B" : "#888",
                  transition: "color 0.15s",
                }}
              />
              <span
                className="font-body leading-none"
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#0D0D0B" : "#888",
                  transition: "color 0.15s",
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
