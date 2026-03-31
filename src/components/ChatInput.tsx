import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const isMobile = () =>
  typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [readOnlyGuard, setReadOnlyGuard] = useState(() => isMobile());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const hasText = value.trim().length > 0;

  /* Auto-resize */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  /* Autofocus on desktop only */
  useEffect(() => {
    if (!isMobile()) {
      const t = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, []);

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
      className="bg-white flex-shrink-0 relative z-10"
      style={{
        borderTop: "1px solid #F0F0F0",
        padding: "12px 16px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-end" style={{ gap: 10 }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => {
            if (readOnlyGuard) setReadOnlyGuard(false);
          }}
          readOnly={readOnlyGuard}
          placeholder="Напишите сообщение..."
          disabled={disabled}
          rows={1}
          className="flex-1 font-body outline-none resize-none"
          style={{
            fontSize: 15,
            color: "#0D0D0B",
            lineHeight: 1.5,
            background: focused ? "white" : "#F5F4F0",
            border: focused ? "1px solid #D0D0D0" : "1px solid transparent",
            borderRadius: 14,
            padding: "11px 16px",
            minHeight: 44,
            maxHeight: 120,
            transition: "background 0.15s, border-color 0.15s",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!hasText || disabled}
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: hasText ? "#0D0D0B" : "#F0F0F0",
            color: hasText ? "white" : "#B0B0B0",
            cursor: hasText ? "pointer" : "default",
            transition: "all 0.15s cubic-bezier(0.16,1,0.3,1)",
            transform: "scale(1)",
          }}
          onMouseEnter={(e) => {
            if (hasText) e.currentTarget.style.background = "#2a2a2a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hasText ? "#0D0D0B" : "#F0F0F0";
          }}
          onMouseDown={(e) => {
            if (hasText) e.currentTarget.style.transform = "scale(0.93)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Send size={18} className="translate-x-[1px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
