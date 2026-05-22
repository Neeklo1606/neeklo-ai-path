interface LogoIconProps {
  height?: number;
  className?: string;
}

/**
 * Renders black logo in light mode, white logo in dark mode.
 * Requires Tailwind darkMode: ["class"] (already configured).
 */
export function LogoIcon({ height = 28, className }: LogoIconProps) {
  const style: React.CSSProperties = { height, width: "auto", display: "block" };

  return (
    <>
      {/* Light theme — black logo */}
      <img
        src="/logo-black.svg"
        alt="neeklo"
        style={style}
        className={`dark:hidden${className ? ` ${className}` : ""}`}
      />
      {/* Dark theme — white logo */}
      <img
        src="/logo-white.svg"
        alt="neeklo"
        style={style}
        className={`hidden dark:block${className ? ` ${className}` : ""}`}
      />
    </>
  );
}
