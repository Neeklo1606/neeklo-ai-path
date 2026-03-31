import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Palette, Briefcase, MessageSquare, FileText } from "lucide-react";

const projectsData: Record<string, { icon: typeof Palette; title: string; status: string; price: string; timeline: string; description: string; manager: string }> = {
  "1": {
    icon: Palette,
    title: "Лендинг для стартапа",
    status: "В работе",
    price: "$850",
    timeline: "14 дней",
    description: "Дизайн и разработка адаптивного лендинга с формой заявки, SEO-оптимизацией и подключением аналитики.",
    manager: "Алексей К.",
  },
  "2": {
    icon: Briefcase,
    title: "Интернет-магазин",
    status: "Ожидает утверждения",
    price: "$2 400",
    timeline: "30 дней",
    description: "Полноценный интернет-магазин с каталогом, корзиной, оплатой и личным кабинетом покупателя.",
    manager: "Не назначен",
  },
};

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const project = projectsData[id || "1"];

  if (!project) {
    return (
      <div className="page-container">
        <div className="page-content">
          <button onClick={() => navigate("/projects")} className="text-foreground text-[14px] underline">
            ← Назад к проектам
          </button>
        </div>
      </div>
    );
  }

  const Icon = project.icon;

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/projects")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <h1 className="text-[18px] font-bold text-foreground leading-tight truncate flex-1">{project.title}</h1>
        </div>

        <div className="game-card mb-3 animate-message-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
              <Icon size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-foreground">{project.title}</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{project.status}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="tag-primary">{project.price}</span>
            <span className="tag-accent">{project.timeline}</span>
          </div>
        </div>

        <div className="game-card mb-3 animate-message-in" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <FileText size={15} className="text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">Описание</span>
          </div>
          <p className="text-[14px] text-foreground/80 leading-relaxed">{project.description}</p>
        </div>

        <div className="game-card mb-3 animate-message-in" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <MessageSquare size={15} className="text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">Менеджер</span>
          </div>
          <p className="text-[14px] text-foreground font-medium">{project.manager}</p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
          <button
            onClick={() => navigate("/manager-chat")}
            className="btn-accent"
          >
            <MessageSquare size={16} />
            Написать менеджеру
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
