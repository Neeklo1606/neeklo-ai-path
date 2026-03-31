import { useLocation, useNavigate } from "react-router-dom";
import navHome from "@/assets/nav-home.png";
import navChat from "@/assets/nav-chat.png";
import navProjects from "@/assets/nav-projects.png";
import navProfile from "@/assets/nav-profile.png";

const navItems = [
  { icon: navHome, label: "Главная", path: "/" },
  { icon: navChat, label: "Чат", path: "/chat" },
  { icon: navProjects, label: "Проекты", path: "/projects" },
  { icon: navProfile, label: "Профиль", path: "/profile" },
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
        {navItems.map(({ icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-1 active:scale-[0.92] transition-transform duration-75"
              style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
            >
              <img
                src={icon}
                alt={label}
                className="w-[22px] h-[22px]"
                style={{
                  opacity: active ? 1 : 0.5,
                  transition: "opacity 0.15s",
                }}
              />
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
