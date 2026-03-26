import BottomNav from "@/components/BottomNav";
import { FolderOpen, Briefcase, Palette } from "lucide-react";

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

const ProjectCard = ({ project }: { project: Project }) => {
  const Icon = project.icon;
  return (
    <div className="game-card animate-message-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-foreground leading-tight truncate">{project.title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{project.status}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="px-2.5 py-1 bg-primary/8 text-primary text-[11px] rounded-lg font-medium">{project.price}</span>
        <span className="px-2.5 py-1 bg-accent/8 text-accent text-[11px] rounded-lg font-medium">{project.timeline}</span>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center pt-32 px-8">
    <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
      <FolderOpen size={20} className="text-muted-foreground" />
    </div>
    <p className="text-[14px] text-muted-foreground text-center">
      Здесь появятся все твои проекты
    </p>
  </div>
);

const ProjectsPage = () => {
  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-[22px] font-semibold text-foreground mb-5">Проекты</h1>

        {hasProjects ? (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <div key={project.id} style={{ animationDelay: `${i * 80}ms` }}>
                <ProjectCard project={project} />
              </div>
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
