interface QuickChipsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const QuickChips = ({ options, onSelect }: QuickChipsProps) => (
  <div className="flex flex-wrap gap-2 pl-10">
    {options.map((option, i) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className="chip-button animate-chip-pop"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        {option}
      </button>
    ))}
  </div>
);

export default QuickChips;
