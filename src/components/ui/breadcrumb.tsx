import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap" style={{ marginBottom: 20 }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} style={{ color: "var(--tx-faint)" }} />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                style={{ fontSize: 12, color: "var(--tx-muted)", textDecoration: "none" }}
                className="hover:text-[var(--tx)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ fontSize: 12, color: isLast ? "var(--tx)" : "var(--tx-muted)", fontWeight: isLast ? 500 : 400 }}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
