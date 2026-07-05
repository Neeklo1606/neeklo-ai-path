import { useEffect, useRef, useState } from "react";

interface RailItem {
  id: string;
  num: string;
  label: string;
}

const RAIL_ITEMS: RailItem[] = [
  { id: "hero",      num: "01", label: "Что это" },
  { id: "solutions", num: "02", label: "Решение" },
  { id: "process",   num: "03", label: "Доверие" },
  { id: "cases",     num: "04", label: "Доказательства" },
  { id: "stats",     num: "05", label: "Почему мы" },
  { id: "cta",       num: "06", label: "Начать" },
];

export default function SeriesRail() {
  const [active, setActive] = useState(RAIL_ITEMS[0].id);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Desktop: highlight active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    RAIL_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Mobile: scroll progress across the page
  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <>
      {/* Desktop rail — fixed vertical navigator, ≥1024px */}
      <nav
        aria-label="Разделы главной страницы"
        className="hidden lg:flex flex-col gap-1"
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      >
        {RAIL_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "5px 8px",
                justifyContent: "flex-end",
                opacity: isActive ? 1 : 0.45,
              }}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: isActive ? "var(--tx)" : "var(--tx-muted)",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {item.num} — {item.label}
              </span>
              <span
                style={{
                  width: isActive ? 18 : 6,
                  height: 2,
                  borderRadius: 9999,
                  background: isActive ? "var(--accent-data)" : "var(--bd-hover)",
                  transition: "width 0.25s, background 0.25s",
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Mobile progress bar — <1024px */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "var(--bd)",
          zIndex: 60,
        }}
        aria-hidden
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--accent-data)",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </>
  );
}
