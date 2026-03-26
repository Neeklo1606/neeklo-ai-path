interface QuickChipsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const QuickChips = ({ options, onSelect }: QuickChipsProps) => (
  <div className="flex flex-wrap gap-2 pl-[42px] animate-message-in">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className="chip-button"
      >
        {option}
      </button>
    ))}
  </div>
);

export default QuickChips;
