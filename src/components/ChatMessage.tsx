import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
}

const AIAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 animate-glow-pulse">
    <Sparkles size={14} className="text-primary" />
  </div>
);

const ChatMessage = ({ role, content }: ChatMessageProps) => (
  <div
    className={`flex items-end ${
      role === "user" ? "justify-end" : "justify-start gap-2"
    } animate-message-in`}
  >
    {role === "ai" && <AIAvatar />}
    <div className={`max-w-[80%] ${role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
      <p className="text-[14px] leading-[1.55] whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

export { AIAvatar };
export default ChatMessage;
