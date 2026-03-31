import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

const ProfilePage = () => {
  const navigate = useNavigate();
  usePageTitle("Профиль — neeklo");

  // TODO: replace with real auth check
  const isLoggedIn = false;

  const handleLogout = () => {
    toast.success("Вы вышли из аккаунта");
    setTimeout(() => navigate("/"), 500);
  };

  if (!isLoggedIn) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Профиль</h1>
          <div className="flex flex-col items-center justify-center pt-20 px-8">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-5">
              <User size={28} className="text-[#B0B0B0]" />
            </div>
            <p className="font-body text-[16px] font-semibold text-[#0D0D0B] text-center mb-6">
              Войдите, чтобы видеть профиль
            </p>
            <div className="flex gap-3 w-full max-w-[280px]">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 font-body text-[14px] font-semibold text-white cursor-pointer"
                style={{ background: "#0D0D0B", borderRadius: 12, padding: "13px 24px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#0D0D0B"; }}
              >
                Войти
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex-1 font-body text-[14px] font-semibold text-[#0D0D0B] cursor-pointer"
                style={{ border: "1px solid #E0E0E0", borderRadius: 12, padding: "13px 24px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
