import { useNavigate } from "react-router-dom";
import { CheckCircle, MessageSquare, ArrowRight, Briefcase } from "lucide-react";

interface Notification {
  id: string;
  icon: typeof CheckCircle;
  iconClass: string;
  title: string;
  desc: string;
  time: string;
  to: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    icon: CheckCircle,
    iconClass: "text-primary",
    title: "Заявка принята",
    desc: "Ваша заявка на AI-ролик принята в работу",
    time: "2 мин назад",
    to: "/projects",
    read: false,
  },
  {
    id: "2",
    icon: MessageSquare,
    iconClass: "text-foreground",
    title: "Менеджер Алексей написал вам",
    desc: "Уточнил детали по брифу проекта",
    time: "1 час назад",
    to: "/manager-chat",
    read: false,
  },
  {
    id: "3",
    icon: Briefcase,
    iconClass: "text-muted-foreground",
    title: "Проект перешёл на этап «В работе»",
    desc: "Лендинг для стартапа — дизайн начат",
    time: "вчера",
    to: "/projects",
    read: true,
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Уведомления</h1>

        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.to)}
                className={`w-full game-card flex items-start gap-3 text-left active:scale-[0.98] transition-transform animate-message-in ${
                  !n.read ? "border-primary/20" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !n.read ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Icon size={16} className={n.iconClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[14px] leading-tight ${!n.read ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{n.time}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground/40 mt-1 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
