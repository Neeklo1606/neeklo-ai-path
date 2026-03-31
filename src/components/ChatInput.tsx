import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasText = value.trim().length > 0;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 96) + "px"; // max ~4 rows
  }, [value]);

  const handleSend = () => {
    if (!hasText || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="bg-white flex items-end gap-3"
      style={{ borderTop: "1px solid #F0F0F0", padding: "12px 16px" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение..."
        disabled={disabled}
        rows={1}
        className="flex-1 font-body text-[15px] text-foreground placeholder:text-muted-foreground outline-none resize-none"
        style={{
          background: "#F9F9F9",
          border: "1px solid #E5E5E5",
          borderRadius: 9999,
          padding: "11px 16px",
          lineHeight: "1.4",
        }}
      />
      <button
        onClick={handleSend}
        disabled={!hasText || disabled}
        className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
        style={{
          width: 40,
          height: 40,
          background: hasText ? "#0D0D0B" : "#F0F0F0",
          color: hasText ? "white" : "#999",
        }}
      >
        <Send size={17} className="translate-x-[1px]" />
      </button>
    </div>
  );
};

export default ChatInput;
