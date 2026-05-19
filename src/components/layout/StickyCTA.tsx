import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const HIDE_PREFIXES = ["/chat", "/manager-chat", "/admin", "/kp", "/brief", "/privacy", "/offer", "/cookies"];

export default function StickyCTA() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const hidden = HIDE_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          key="sticky-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 flex justify-center pointer-events-none md:hidden z-30"
          style={{
            bottom: "calc(56px + env(safe-area-inset-bottom) + 10px)",
          }}
        >
          <button
            onClick={() => navigate("/brief")}
            className="pointer-events-auto flex items-center gap-2 rounded-full text-[14px] font-semibold transition-transform duration-100 active:scale-[0.96] touch-manipulation"
            style={{
              height: 44,
              paddingLeft: 22,
              paddingRight: 18,
              background: "var(--tx)",
              color: "var(--bg)",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            {lang === "ru" ? "Начать проект" : "Start project"}
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
