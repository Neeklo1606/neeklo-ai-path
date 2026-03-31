interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
}

const AIAvatar = () => (
  <div
    className="flex-shrink-0 flex items-center justify-center rounded-full"
    style={{ width: 36, height: 36, background: "#0D0D0B" }}
  >
    <span className="text-white text-[14px] leading-none">✦</span>
  </div>
);

const ChatMessage = ({ role, content }: ChatMessageProps) => (
  <div
    className={`flex items-end ${
      role === "user" ? "justify-end" : "justify-start gap-2.5"
    } animate-message-in`}
  >
    {role === "ai" && <AIAvatar />}
    <div
      className="max-w-[75%]"
      style={
        role === "user"
          ? {
              background: "#0D0D0B",
              color: "white",
              borderRadius: "16px 4px 16px 16px",
              padding: "12px 16px",
            }
          : {
              background: "white",
              border: "1px solid #F0F0F0",
              borderRadius: "4px 16px 16px 16px",
              padding: "12px 16px",
            }
      }
    >
      <p className="font-body text-[15px] leading-[1.6] whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

export { AIAvatar };
export default ChatMessage;
