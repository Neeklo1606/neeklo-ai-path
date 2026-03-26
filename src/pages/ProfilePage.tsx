import BottomNav from "@/components/BottomNav";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";

const ProfilePage = () => (
  <div className="min-h-screen bg-background pb-24">
    <div className="max-w-md mx-auto px-4 pt-6">
      <h1 className="text-[22px] font-semibold text-foreground mb-6">Профиль</h1>

      {/* Avatar + info */}
      <div className="flex flex-col items-center py-6 mb-6 animate-message-in">
        <div className="w-20 h-20 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center mb-4">
          <User size={32} className="text-primary" />
        </div>
        <h2 className="text-[17px] font-semibold text-foreground">Пользователь</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">user@neeklo.app</p>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <button className="w-full game-card flex items-center gap-3.5 text-left animate-message-in" style={{ animationDelay: "60ms" }}>
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Settings size={17} className="text-muted-foreground" />
          </div>
          <span className="text-[14px] text-foreground flex-1">Настройки</span>
          <ChevronRight size={16} className="text-muted-foreground/40" />
        </button>

        <button className="w-full game-card flex items-center gap-3.5 text-left animate-message-in" style={{ animationDelay: "120ms" }}>
          <div className="w-9 h-9 rounded-xl bg-destructive/8 flex items-center justify-center flex-shrink-0">
            <LogOut size={17} className="text-destructive" />
          </div>
          <span className="text-[14px] text-destructive flex-1">Выйти</span>
        </button>
      </div>
    </div>
    <BottomNav />
  </div>
);

export default ProfilePage;
