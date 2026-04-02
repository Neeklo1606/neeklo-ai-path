import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { FolderOpen, MessageCircle, Bell, Settings, FileText, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1] as const;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  usePageTitle(lang === "en" ? "Profile – neeklo" : "Профиль – neeklo");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const menuItems = [
    { icon: FolderOpen, label: t("profile.myProjects"), action: "navigate" as const, path: "/projects" },
    { icon: MessageCircle, label: t("profile.writeChat"), action: "navigate" as const, path: "/chat" },
    { icon: Bell, label: t("profile.notifications"), action: "navigate" as const, path: "/notifications" },
    { icon: Settings, label: t("profile.settings"), action: "navigate" as const, path: "/settings" },
    { icon: FileText, label: t("profile.privacy"), action: "toast" as const, msg: t("profile.privacy") },
    { icon: HelpCircle, label: t("profile.support"), action: "navigate" as const, path: "/chat" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-start justify-center" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <motion.div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <h1 className="font-heading text-center" style={{ fontSize: 22, fontWeight: 800 }}>{t("profile.login")}</h1>
          <p className="font-body text-center mt-2" style={{ fontSize: 14, color: "#6A6860" }}>{t("profile.loginDesc")}</p>
          <div className="flex flex-col gap-2.5 mt-8">
            <button onClick={() => navigate("/login")} className="w-full font-body text-white rounded-xl cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all" style={{ background: "#0D0D0B", padding: "13px 0", fontSize: 15, fontWeight: 600 }}>
              {t("profile.signIn")}
            </button>
            <button onClick={() => navigate("/register")} className="w-full font-body rounded-xl cursor-pointer hover:bg-[#F9F9F9] active:scale-[0.97] transition-all" style={{ border: "1px solid #E0E0E0", padding: "13px 0", fontSize: 15, fontWeight: 600, color: "#0D0D0B", background: "white" }}>
              {t("profile.register")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 100 }}>
      <div className="max-w-[480px] mx-auto px-5 sm:px-8">
        <motion.div className="flex flex-col items-center pt-8 pb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <div className="rounded-full flex items-center justify-center shadow-lg" style={{ width: 72, height: 72, background: "linear-gradient(135deg, #D4C5B2, #B8C9D4)", border: "3px solid white" }}>
            <span className="font-heading text-white" style={{ fontSize: 24, fontWeight: 700 }}>НК</span>
          </div>
          <p className="font-heading mt-3" style={{ fontSize: 18, fontWeight: 700 }}>Никита Клочко</p>
          <p className="font-body mt-1" style={{ fontSize: 14, color: "#6A6860" }}>hello@neeklo.studio</p>
          <span className="font-body rounded-full mt-2" style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "#F0F0F0", color: "#6A6860" }}>
            {t("profile.client")}
          </span>
        </motion.div>

        <motion.div className="bg-white border border-[#F0F0F0] rounded-2xl flex divide-x divide-[#F0F0F0]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.08 }}>
          {[
            { num: "4", label: t("profile.projects") },
            { num: "2", label: t("profile.activeProjects") },
            { num: "2", label: t("profile.completedProjects") },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-4">
              <p className="font-heading" style={{ fontSize: 24, fontWeight: 800 }}>{s.num}</p>
              <p className="font-body mt-1" style={{ fontSize: 11, color: "#6A6860" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className="bg-white rounded-2xl overflow-hidden mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.14 }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => { if (item.action === "navigate" && item.path) navigate(item.path); else if (item.action === "toast" && item.msg) toast(item.msg); }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F9F9F9] transition-colors cursor-pointer text-left" style={{ borderBottom: i < menuItems.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                <Icon size={20} color="#6A6860" />
                <span className="font-body flex-1" style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                <ChevronRight size={16} color="#D0D0D0" />
              </button>
            );
          })}
        </motion.div>

        <motion.button onClick={() => { setIsLoggedIn(false); toast(t("profile.loggedOut")); }} className="w-full font-body rounded-xl mt-4 cursor-pointer hover:bg-[#FFF5F5] active:scale-[0.97] transition-all flex items-center justify-center gap-2" style={{ border: "1px solid #E0E0E0", background: "white", padding: "13px 0", fontSize: 15, fontWeight: 600, color: "#FF3B30" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.2 }}>
          <LogOut size={16} />
          {t("profile.logout")}
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePage;
