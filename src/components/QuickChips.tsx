import { useState } from "react";

interface QuickChipsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const QuickChips = ({ options, onSelect }: QuickChipsProps) => {
  const [hiding, setHiding] = useState(false);

  const handleClick = (option: string) => {
    setHiding(true);
    setTimeout(() => onSelect(option), 150);
  };

  return (
    <div className="flex flex-wrap" style={{ gap: 8, paddingLeft: 38, marginTop: 4 }}>
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className="font-body text-white cursor-pointer"
          style={{
            fontSize: 14,
            fontWeight: 500,
            background: "#0D0D0B",
            padding: "9px 18px",
            borderRadius: 9999,
            border: "none",
            opacity: hiding ? 0 : 1,
            transform: hiding ? "scale(0.95)" : "scale(1)",
            transition: "all 0.15s cubic-bezier(0.16,1,0.3,1)",
            animationDelay: `${i * 50}ms`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2a2a2a";
            if (!hiding) e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0D0D0B";
            if (!hiding) e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.96)";
          }}
          onMouseUp={(e) => {
            if (!hiding) e.currentTarget.style.transform = "scale(1.02)";
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default QuickChips;
