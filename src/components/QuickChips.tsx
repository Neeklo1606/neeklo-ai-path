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
    <div className="flex flex-wrap gap-2 pl-[46px]">
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className="font-body text-[14px] font-medium text-white rounded-full transition-all duration-150"
          style={{
            background: "#0D0D0B",
            padding: "8px 18px",
            opacity: hiding ? 0 : 1,
            transform: hiding ? "scale(0.9)" : "scale(1)",
            animationDelay: `${i * 50}ms`,
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default QuickChips;
