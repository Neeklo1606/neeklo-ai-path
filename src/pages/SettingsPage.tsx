import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Moon, Shield, HelpCircle, ChevronRight, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    { icon: Bell, label: t("settings.notifications"), description: t("settings.notifDesc") },
    { icon: Moon, label: t("settings.theme"), description: t("settings.themeDesc") },
    { icon: Globe, label: t("settings.language"), description: t("settings.langDesc") },
    { icon: Shield, label: t("settings.security"), description: "" },
    { icon: HelpCircle, label: t("settings.help"), description: "" },
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <h1 className="text-[22px] font-bold text-foreground leading-tight">{t("settings.title")}</h1>
        </div>

        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button key={item.label} className="w-full game-card flex items-center gap-3 text-left animate-message-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] text-foreground">{item.label}</span>
                {item.description && <p className="text-[12px] text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
              <ChevronRight size={15} className="text-muted-foreground/30 flex-shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[12px] text-muted-foreground/40">neeklo v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
