import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Вы вышли из аккаунта");
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Профиль</h1>

        <div className="flex flex-col items-center pb-8 animate-message-in">
          <div className="w-[72px] h-[72px] rounded-full bg-card border border-border flex items-center justify-center mb-4">
            <User size={28} className="text-foreground" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground leading-tight">Пользователь</h2>
          <p className="text-[13px] text-muted-foreground mt-1">user@neeklo.app</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/settings")}
            className="w-full game-card flex items-center gap-3 text-left animate-message-in active:scale-[0.98] transition-transform"
            style={{ animationDelay: "60ms" }}
          >
            <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center flex-shrink-0">
              <Settings size={16} className="text-muted-foreground" />
            </div>
            <span className="text-[14px] text-foreground flex-1">Настройки</span>
            <ChevronRight size={15} className="text-muted-foreground/30" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full game-card flex items-center gap-3 text-left animate-message-in active:scale-[0.98] transition-transform"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-destructive/8">
              <LogOut size={16} className="text-destructive" />
            </div>
            <span className="text-[14px] text-destructive flex-1">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
