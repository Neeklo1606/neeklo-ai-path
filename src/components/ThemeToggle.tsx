import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
}

const ThemeToggle = ({ size = "md", className = "" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const dim = size === "sm" ? 32 : 36;
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-md transition-all duration-200 ${className}`}
      style={{
        width: dim,
        height: dim,
        background: "var(--surface-2)",
        border: "1px solid var(--bd)",
        color: "var(--tx-muted)",
        cursor: "pointer",
        flexShrink: 0,
      }}
      title={isLight ? "Тёмная тема" : "Светлая тема"}
      aria-label={isLight ? "Переключить на тёмную тему" : "Переключить на светлую тему"}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isLight ? "rotate(0deg) scale(1)" : "rotate(-30deg) scale(0.9)",
          opacity: isLight ? 1 : 0,
          position: "absolute",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <Sun size={iconSize} />
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isLight ? "rotate(30deg) scale(0.9)" : "rotate(0deg) scale(1)",
          opacity: isLight ? 0 : 1,
          position: "absolute",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <Moon size={iconSize} />
      </span>
    </button>
  );
};

export default ThemeToggle;
