interface LogoIconProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Inline SVG logo — respects currentColor for light/dark theme support */
export function LogoIcon({ height = 28, className, style }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      aria-label="neeklo"
      role="img"
      style={{ height, width: "auto", ...style }}
      className={className}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="6" fill="none" />
      {/* Letter n */}
      <path
        d="M28 68V32h8v6.5c2.2-4.6 6.8-7.5 12.5-7.5C56.8 31 64 38 64 47.5V68h-8V48.5C56 42.5 52.5 39 47 39c-5.8 0-11 4.5-11 11V68h-8z"
        fill="currentColor"
      />
    </svg>
  );
}
