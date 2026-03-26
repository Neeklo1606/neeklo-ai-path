import { Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
  delay?: number;
}

const ChatMessage = ({ role, content, delay = 0 }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} animate-message-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {role === "ai" && (
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0 animate-glow-pulse">
          <Bot size={16} className="text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] ${role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
