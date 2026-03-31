import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { FolderOpen, Briefcase, Palette, Star, MessageSquare, ChevronDown } from "lucide-react";

type StepStatus = "done" | "active" | "pending";

interface TimelineStep {
  label: string;
  status: StepStatus;
}

interface Project {
  id: string;
  icon: typeof FolderOpen;
  title: string;
  status: string;
  price: string;
  timeline: string;
  manager: string;
  steps: TimelineStep[];
}

const projects: Project[] = [
  {
    id: "1",
    icon: Palette,
    title: "Лендинг для стартапа",
    status: "В работе",
    price: "$850",
    timeline: "14 дней",
    manager: "Алексей К.",
    steps: [
      { label: "Заявка принята", status: "done" },
      { label: "Бриф согласован", status: "done" },
      { label: "В работе", status: "active" },
      { label: "На проверке", status: "pending" },
      { label: "Готово", status: "pending" },
    ],
  },
  {
    id: "2",
    icon: Briefcase,
    title: "Интернет-магазин",
    status: "Ожидает утверждения",
    price: "$2 400",
    timeline: "30 дней",
    manager: "Мария С.",
    steps: [
      { label: "Заявка принята", status: "done" },
      { label: "Бриф согласован", status: "done" },
      { label: "В работе", status: "active" },
      { label: "На проверке", status: "pending" },
      { label: "Готово", status: "pending" },
    ],
  },
];

const SkeletonCard = () => (
  <div className="game-card">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-3/4 bg-muted rounded-lg animate-pulse mb-1.5" />
        <div className="h-3 w-1/2 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-muted rounded-lg animate-pulse" />
      <div className="h-6 w-16 bg-muted rounded-lg animate-pulse" />
    </div>
  </div>
);

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const Icon = project.icon;

  return (
    <div
      className="w-full game-card text-left animate-message-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground leading-tight truncate">{project.title}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{project.status}</p>
          </div>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="tag-primary">{project.price}</span>
          <span className="tag-accent">{project.timeline}</span>
          <span className="ml-auto flex items-center gap-1">
            <Star size={10} className="text-foreground fill-foreground" />
            <span className="text-[11px] text-muted-foreground">4.9</span>
          </span>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="border-t border-border pt-4">
          <div className="space-y-0 mb-5">
            {project.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      s.status === "done"
                        ? "bg-foreground border-foreground"
                        : s.status === "active"
                          ? "bg-primary border-primary"
                          : "bg-transparent border-muted-foreground/30"
                    }`}
                  />
                  {i < project.steps.length - 1 && (
                    <div className={`w-0.5 h-6 ${
                      s.status === "done" ? "bg-foreground/30" : "bg-muted-foreground/15"
                    }`} />
                  )}
                </div>
                <span
                  className={`text-[13px] -mt-0.5 ${
                    s.status === "done"
                      ? "font-semibold text-foreground"
                      : s.status === "active"
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-[12px] font-bold text-muted-foreground">
                {project.manager.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Менеджер</p>
              <p className="text-[13px] font-semibold">{project.manager}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/manager-chat")}
            className="w-full flex items-center justify-center gap-2 border border-border bg-card h-[48px] text-[13px] font-semibold text-foreground hover:bg-muted transition-colors"
            style={{ borderRadius: 12 }}
          >
            <MessageSquare size={14} />
            Написать менеджеру
          </button>
        </div>
      </div>
    </div>
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
  const [loading] = useState(false);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Проекты</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
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
