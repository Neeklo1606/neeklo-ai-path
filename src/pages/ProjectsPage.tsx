import BottomNav from "@/components/BottomNav";
import { FolderOpen } from "lucide-react";

const ProjectsPage = () => (
  <div className="min-h-screen bg-background pb-24">
    <div className="px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-foreground mb-6">Проекты</h1>

      <div className="game-card animate-message-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FolderOpen size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Лендинг для стартапа</h3>
            <p className="text-xs text-muted-foreground">В работе • менеджер подключён</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium">$850</span>
          <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-lg font-medium">14 дней</span>
        </div>
      </div>

      <div className="mt-8 text-center text-muted-foreground/40 text-sm">
        Здесь появятся все твои проекты
      </div>
    </div>
    <BottomNav />
  </div>
);

export default ProjectsPage;
