import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "neeklo_cookie";

const CookieBanner = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-50 bottom-[76px] left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[440px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-4"
            style={{ border: "1px solid #E8E6E0" }}
          >
            <div className="flex gap-2.5">
              <span style={{ fontSize: 20, lineHeight: 1 }}>🍪</span>
              <p className="font-body" style={{ fontSize: 13, color: "#3A3A3A", lineHeight: 1.55 }}>
                Мы используем cookie для улучшения сайта. Продолжая использование, вы соглашаетесь с нашей{" "}
                <span className="underline underline-offset-2 cursor-pointer" style={{ color: "#0052FF" }}>
                  Политикой Cookie
                </span>
                .
              </p>
            </div>
            <div className="flex gap-2 justify-end mt-3">
              <button
                onClick={dismiss}
                className="font-body rounded-lg cursor-pointer hover:bg-[#F5F5F5] active:scale-[0.97] transition-all"
                style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", border: "1px solid #E0E0E0", color: "#6A6860" }}
              >
                Отклонить
              </button>
              <button
                onClick={dismiss}
                className="font-body text-white rounded-lg cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.97] transition-all"
                style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", background: "#0D0D0B" }}
              >
                Принять
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
