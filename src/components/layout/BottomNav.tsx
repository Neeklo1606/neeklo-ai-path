import { useLocation, useNavigate } from "react-router-dom";
import { Home, Sparkles, PenLine, Image, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

type NavItem = {
  icon: React.ElementType;
  key: "nav.home" | "nav.services" | "nav.chat" | "nav.works" | "nav.profile";
  path: string;
  accent?: boolean;
};

const ITEMS: NavItem[] = [
  { icon: Home,     key: "nav.home",     path: "/" },
  { icon: Sparkles, key: "nav.services", path: "/services" },
  { icon: PenLine,  key: "nav.chat",     path: "/brief", accent: true },
  { icon: Image,    key: "nav.works",    path: "/cases" },
  { icon: User,     key: "nav.profile",  path: "/profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-40"
      style={{
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--bd)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-5" style={{ height: 56 }}>
        {ITEMS.map(({ icon: Icon, key, path, accent }) => {
          const active =
            path === "/" ? pathname === "/" : pathname.startsWith(path);

          if (accent) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-0.5 touch-manipulation"
                style={{ minHeight: 44 }}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width: 40,
                    height: 28,
                    background: active ? "var(--tx)" : "var(--surface-3)",
                    border: active ? "none" : "1px solid var(--bd)",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2}
                    style={{
                      color: active ? "var(--bg)" : "var(--tx-muted)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--tx)" : "var(--tx-muted)",
                    lineHeight: 1,
                  }}
                >
                  {t(key)}
                </span>
              </button>
            );
          }

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 touch-manipulation active:scale-[0.90] transition-transform duration-75"
              style={{ minHeight: 44 }}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className="absolute top-1 w-1 h-1 rounded-full"
                  style={{ background: "var(--ac-b)" }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.5}
                style={{
                  color: active ? "var(--tx)" : "var(--tx-faint)",
                  transition: "color 0.15s",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--tx)" : "var(--tx-faint)",
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
