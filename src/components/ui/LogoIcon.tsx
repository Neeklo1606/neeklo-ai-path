import { useTheme } from "@/hooks/useTheme";

interface LogoIconProps {
  height?: number;
  className?: string;
}

/**
 * Shows black logo on light theme, white logo on dark theme.
 * Reacts to useTheme — no CSS class dependency.
 */
export function LogoIcon({ height = 28, className }: LogoIconProps) {
  const { theme } = useTheme();
  return (
    <img
      src={theme === "light" ? "/logo-black.svg" : "/logo-white.svg"}
      alt="neeklo"
      style={{ height, width: "auto", display: "block" }}
      className={className}
    />
  );
}
