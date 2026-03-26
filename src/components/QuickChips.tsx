interface QuickChipsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const QuickChips = ({ options, onSelect }: QuickChipsProps) => (
  <div className="flex flex-wrap gap-2 pl-[38px]">
    {options.map((option, i) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className="chip-button animate-chip-pop"
        style={{ animationDelay: `${i * 40}ms` }}
      >
        {option}
      </button>
    ))}
  </div>
);

export default QuickChips;
