import BottomNav from "@/components/BottomNav";
import { User, Settings, LogOut } from "lucide-react";

const ProfilePage = () => (
  <div className="min-h-screen bg-background pb-24">
    <div className="px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-foreground mb-6">Профиль</h1>

      <div className="game-card animate-message-in flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Пользователь</h3>
          <p className="text-sm text-muted-foreground">user@neeklo.app</p>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full game-card flex items-center gap-3 text-left">
          <Settings size={18} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Настройки</span>
        </button>
        <button className="w-full game-card flex items-center gap-3 text-left">
          <LogOut size={18} className="text-destructive" />
          <span className="text-sm text-destructive">Выйти</span>
        </button>
      </div>
    </div>
    <BottomNav />
  </div>
);

export default ProfilePage;
