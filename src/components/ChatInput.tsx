import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="fixed bottom-[calc(3rem+env(safe-area-inset-bottom))] left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-40" style={{ padding: "10px 20px" }}>
      <div className="max-w-md mx-auto flex items-center gap-2.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Напиши сообщение..."
          disabled={disabled}
          className="flex-1 bg-card rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/25 transition-colors duration-200"
          style={{ padding: "11px 20px" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-[44px] h-[44px] rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-20 flex-shrink-0"
        >
          <Send size={17} className="translate-x-[1px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
