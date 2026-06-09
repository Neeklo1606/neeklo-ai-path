import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { clearAuthToken } from "@/lib/auth-token";
import {
  LayoutDashboard, Users, KanbanSquare, MessageCircle,
  Briefcase, Film, Wrench, BookOpen, FileText,
  Library, ScrollText, Image, Settings, LogOut,
  ExternalLink, ChevronRight, Store, Bot, Send,
  DollarSign, MessageSquare, Database
} from "lucide-react";

type NavItem = { to: string; icon: React.ReactNode; label: string; end?: boolean };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Главное",
    items: [
      { to: "/admin", icon: <LayoutDashboard size={15} />, label: "Дашборд", end: true },
    ],
  },
  {
    title: "CRM",
    items: [
      { to: "/admin/crm/contacts", icon: <Users size={15} />, label: "Контакты" },
      { to: "/admin/crm/kanban", icon: <KanbanSquare size={15} />, label: "Проекты" },
      { to: "/admin/chats", icon: <MessageCircle size={15} />, label: "Чаты" },
      { to: "/admin/telegram", icon: <Send size={15} />, label: "Telegram бот" },
    ],
  },
  {
    title: "AI Агент",
    items: [
      { to: "/admin/ai-agent", icon: <Bot size={15} />, label: "Агент" },
      { to: "/admin/global-knowledge", icon: <Database size={15} />, label: "База знаний" },
      { to: "/admin/pricing", icon: <DollarSign size={15} />, label: "Прайс услуг" },
      { to: "/admin/test-chat", icon: <MessageSquare size={15} />, label: "Тест-чат" },
    ],
  },
  {
    title: "Контент сайта",
    items: [
      { to: "/admin/cases", icon: <Briefcase size={15} />, label: "Кейсы" },
      { to: "/admin/videos", icon: <Film size={15} />, label: "Видео" },
      { to: "/admin/blog", icon: <BookOpen size={15} />, label: "Блог" },
      { to: "/admin/site-pages", icon: <FileText size={15} />, label: "Страницы" },
    ],
  },
  {
    title: "Команда",
    items: [
      { to: "/admin/knowledge-base", icon: <Library size={15} />, label: "Ассистенты KB" },
      { to: "/admin/regulations", icon: <ScrollText size={15} />, label: "Регламенты" },
    ],
  },
  {
    title: "Система",
    items: [
      { to: "/admin/media", icon: <Image size={15} />, label: "Медиабиблиотека" },
      { to: "/admin/settings", icon: <Settings size={15} />, label: "Настройки" },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white/85"
      }`}
    >
      <span className={active ? "text-white" : "text-white/45"}>{item.icon}</span>
      <span style={{ fontSize: 13 }}>{item.label}</span>
      {active && <ChevronRight size={11} className="ml-auto text-white/35" />}
    </Link>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [avitoOpen, setAvitoOpen] = useState(true);
  const avitoActive = pathname.startsWith("/admin/avito");
  const avitoItems = useMemo(
    () => [
      { to: "/admin/avito/config", label: "Конфигурация" },
      { to: "/admin/avito/accounts", label: "Аккаунты" },
      { to: "/admin/avito/webhook", label: "Webhook" },
      { to: "/admin/avito/items", label: "Объявления" },
      { to: "/admin/avito/chats", label: "Диалоги" },
      { to: "/admin/avito/events", label: "События" },
    ],
    [],
  );

  const logout = () => {
    clearAuthToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#0F0F0D]">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-[#111110] border-r border-white/[0.05] flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.05]">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-[10px] font-black text-black">N</span>
            </div>
            <span className="text-sm font-semibold text-white">neeklo</span>
            <span className="ml-auto text-[10px] text-white/25 font-mono">crm</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} item={item} />
                ))}
                {section.title === "CRM" && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => setAvitoOpen((v) => !v)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150 ${
                        avitoActive
                          ? "bg-white/10 text-white"
                          : "text-white/55 hover:bg-white/5 hover:text-white/85"
                      }`}
                    >
                      <span className={avitoActive ? "text-white" : "text-white/45"}>
                        <Store size={15} />
                      </span>
                      <span style={{ fontSize: 13 }}>Avito</span>
                      <ChevronRight
                        size={11}
                        className={`ml-auto text-white/40 transition-transform ${avitoOpen ? "rotate-90" : ""}`}
                      />
                    </button>
                    {avitoOpen && (
                      <div className="mt-1 space-y-0.5 pl-6">
                        {avitoItems.map((item) => {
                          const active = pathname === item.to;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`block rounded-md px-2 py-1.5 text-xs transition-colors ${
                                active
                                  ? "bg-white/15 text-white"
                                  : "text-white/55 hover:bg-white/5 hover:text-white/85"
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-white/[0.05] space-y-0.5">
          <a
            href="https://neeklo.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/45 hover:text-white/75 hover:bg-white/5 transition-all"
          >
            <ExternalLink size={14} />
            <span style={{ fontSize: 13 }}>Сайт ↗</span>
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/45 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={14} />
            <span style={{ fontSize: 13 }}>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-[#F5F5F3]">
        <Outlet />
      </main>
    </div>
  );
}
