import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
}

const AIAvatar = () => (
  <div className="w-[32px] h-[32px] rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 animate-avatar-breathe">
    <Sparkles size={13} className="text-foreground/70" />
  </div>
);

const ChatMessage = ({ role, content }: ChatMessageProps) => (
  <div
    className={`flex items-end ${
      role === "user" ? "justify-end" : "justify-start gap-2.5"
    } animate-message-in`}
  >
    {role === "ai" && <AIAvatar />}
    <div className={`max-w-[80%] ${role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
      <p className="text-[14px] md:text-[15px] leading-[1.6] whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

export { AIAvatar };
export default ChatMessage;
