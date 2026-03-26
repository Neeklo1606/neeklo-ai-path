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
    <div className="fixed-bottom-bar bg-background border-t border-border" style={{ bottom: "calc(60px + env(safe-area-inset-bottom))", padding: "12px 20px" }}>
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Напишите сообщение..."
          disabled={disabled}
          className="flex-1 bg-card rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0 transition-colors duration-200"
          style={{ padding: "12px 20px" }}
        />
        <button
          disabled={disabled}
          className="w-[42px] h-[42px] rounded-full bg-card text-muted-foreground flex items-center justify-center active:scale-90 transition-all duration-150 flex-shrink-0 hover:text-foreground"
        >
          <Mic size={18} />
        </button>
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-[46px] h-[46px] rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-15 flex-shrink-0 shadow-sm"
        >
          <Send size={18} className="translate-x-[1px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
