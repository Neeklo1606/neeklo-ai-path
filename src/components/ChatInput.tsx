import { Send, Mic } from "lucide-react";
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
    <div className="fixed-bottom-bar bg-background border-t border-border" style={{ bottom: "calc(60px + env(safe-area-inset-bottom))", padding: "10px 20px" }}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Напишите сообщение..."
          disabled={disabled}
          className="flex-1 bg-background rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-foreground/20 transition-colors duration-200"
          style={{ padding: "11px 20px" }}
        />
        <button
          disabled={disabled}
          className="w-[44px] h-[44px] rounded-full bg-card text-muted-foreground flex items-center justify-center active:scale-90 transition-all duration-150 flex-shrink-0"
        >
          <Mic size={18} />
        </button>
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
