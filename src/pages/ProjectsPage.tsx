import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { FolderOpen, Briefcase, Palette, Star } from "lucide-react";

interface Project {
  id: string;
  icon: typeof FolderOpen;
  title: string;
  status: string;
  price: string;
  timeline: string;
}

const projects: Project[] = [
  {
    id: "1",
    icon: Palette,
    title: "Лендинг для стартапа",
    status: "В работе",
    price: "$850",
    timeline: "14 дней",
  },
  {
    id: "2",
    icon: Briefcase,
    title: "Интернет-магазин",
    status: "Ожидает утверждения",
    price: "$2 400",
    timeline: "30 дней",
  },
];

const ProjectCard = ({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) => {
  const Icon = project.icon;
  return (
    <button
      onClick={onClick}
      className="w-full game-card text-left animate-message-in active:scale-[0.98] transition-transform"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-foreground leading-tight truncate">{project.title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{project.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="tag-primary">{project.price}</span>
        <span className="tag-accent">{project.timeline}</span>
        <span className="ml-auto flex items-center gap-1">
          <Star size={10} className="text-foreground fill-foreground" />
          <span className="text-[11px] text-muted-foreground">4.9</span>
        </span>
      </div>
    </button>
  );
};

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center pt-28 px-8">
      <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center mb-4">
        <FolderOpen size={18} className="text-muted-foreground" />
      </div>
      <p className="text-[15px] font-medium text-foreground text-center mb-1.5">
        Здесь появятся все твои проекты
      </p>
      <p className="text-[13px] text-muted-foreground text-center mb-6">
        Создай первый проект через чат
      </p>
      <button
        onClick={() => navigate("/chat")}
        className="text-[13px] font-medium text-foreground underline underline-offset-2 active:scale-95 transition-transform"
      >
        Перейти в чат →
      </button>
    </div>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Проекты</h1>

        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ProjectsPage;
