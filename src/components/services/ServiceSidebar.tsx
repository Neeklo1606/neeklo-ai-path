import { useState, useEffect } from "react";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero",     label: "Обзор" },
  { id: "for-whom", label: "Для кого" },
  { id: "delivers", label: "Что входит" },
  { id: "case",     label: "Кейс" },
  { id: "packages", label: "Пакеты" },
  { id: "process",  label: "Процесс" },
  { id: "faq",      label: "Вопросы" },
  { id: "cta",      label: "Заказать" },
];

export default function ServiceSidebar() {
  const [active, setActive] = useState("hero");

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

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="svc-sidebar">
      <div className="svc-sidebar-inner">
        <div className="svc-sidebar-label">Разделы</div>
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`svc-sidebar-link${active === id ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              setActive(id);
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </aside>
  );
}
