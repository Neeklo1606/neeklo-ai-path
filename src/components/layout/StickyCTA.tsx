import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QuickLeadForm from "@/components/QuickLeadForm";

const HIDE_PREFIXES = ["/chat", "/manager-chat", "/admin", "/kp", "/privacy", "/offer", "/cookies"];

/**
 * Мобильный sticky-бар с быстрой формой (1 поле).
 * Появляется только после скролла мимо hero (IntersectionObserver);
 * на страницах без #hero — после 400px скролла.
 */
export default function StickyCTA() {
  const { pathname } = useLocation();
  const [pastHero, setPastHero] = useState(false);

  const hidden = HIDE_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    setPastHero(false);
    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    // Скролл-фолбэк: hero полностью выше вьюпорта / либо 400px на страницах без hero.
    // Дешёвая проверка (один getBoundingClientRect), троттлинг не нужен —
    // браузер сам выравнивает scroll-события по кадрам.
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        setPastHero(hero.getBoundingClientRect().bottom <= 0);
      } else {
        setPastHero(window.scrollY > 400);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Основной механизм — IntersectionObserver по #hero
    // (#hero может появиться с задержкой на lazy-роутах — пробуем несколько раз)
    let tries = 0;
    const attach = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        observer = new IntersectionObserver(
          ([entry]) => setPastHero(!entry.isIntersecting),
          { threshold: 0 }
        );
        observer.observe(hero);
      } else if (tries++ < 8) {
        retryTimer = setTimeout(attach, 250);
      }
    };
    attach();

    return () => {
      observer?.disconnect();
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {!hidden && pastHero && (
        <motion.div
          key="sticky-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 md:hidden z-30 px-3"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 10px)" }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: "0 auto",
              padding: 8,
              borderRadius: 9999,
              background: "var(--surface)",
              border: "1px solid var(--bd)",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            <QuickLeadForm variant="bar" source="sticky-cta" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
