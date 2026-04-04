import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FileStack, ImageIcon, Bot, Settings, LogOut, Users, BarChart3, CreditCard } from "lucide-react";
import { clearAuthToken } from "@/lib/auth-token";

const linkCls = (active: boolean) =>
  `text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${active ? "bg-[#0D0D0B] text-white" : "text-[#6A6860] hover:bg-[#eee]"}`;

export default function AdminCmsShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    clearAuthToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#0D0D0B]">
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-[#E8E6E0] bg-white/95 px-4 py-3 backdrop-blur"
        style={{ fontFamily: "'Onest', sans-serif" }}
      >
        <Link to="/admin" className="mr-2 text-sm font-semibold text-[#0052FF]">
          ← CRM
        </Link>
        <nav className="flex flex-wrap gap-1">
          <Link to="/admin/crm" className={linkCls(pathname.startsWith("/admin/crm"))}>
            <span className="inline-flex items-center gap-1.5">
              <Users size={16} /> CRM
            </span>
          </Link>
          <Link to="/admin/pages" className={linkCls(pathname.startsWith("/admin/pages"))}>
            <span className="inline-flex items-center gap-1.5">
              <FileStack size={16} /> Страницы
            </span>
          </Link>
          <Link to="/admin/media" className={linkCls(pathname.startsWith("/admin/media"))}>
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon size={16} /> Медиа
            </span>
          </Link>
          <Link to="/admin/branding" className={linkCls(pathname.startsWith("/admin/branding"))}>
            <span className="inline-flex items-center gap-1.5">Брендинг</span>
          </Link>
          <Link to="/admin/assistants" className={linkCls(pathname.startsWith("/admin/assistants"))}>
            <span className="inline-flex items-center gap-1.5">
              <Bot size={16} /> Ассистенты
            </span>
          </Link>
          <Link to="/admin/ai-analytics" className={linkCls(pathname.startsWith("/admin/ai-analytics"))}>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 size={16} /> AI
            </span>
          </Link>
          <Link to="/admin/billing" className={linkCls(pathname.startsWith("/admin/billing"))}>
            <span className="inline-flex items-center gap-1.5">
              <CreditCard size={16} /> Биллинг
            </span>
          </Link>
          <Link to="/admin/settings" className={linkCls(pathname.startsWith("/admin/settings"))}>
            <span className="inline-flex items-center gap-1.5">
              <Settings size={16} /> Настройки
            </span>
          </Link>
          <button type="button" onClick={logout} className={linkCls(false)}>
            <span className="inline-flex items-center gap-1.5">
              <LogOut size={16} /> Выйти
            </span>
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
