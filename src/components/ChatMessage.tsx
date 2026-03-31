interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
}

const AIAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    className="flex-shrink-0 flex items-center justify-center rounded-full"
    style={{ width: size, height: size, background: "#0D0D0B" }}
  >
    <span className="text-white leading-none" style={{ fontSize: size * 0.43 }}>✦</span>
  </div>
);

const ChatMessage = ({ role, content }: ChatMessageProps) => (
  <div
    className={`flex items-end ${
      role === "user" ? "justify-end" : "justify-start"
    } animate-message-in`}
    style={{ gap: role === "ai" ? 10 : 0 }}
  >
    {role === "ai" && <AIAvatar size={28} />}
    <div
      className="max-w-[85%] sm:max-w-[75%]"
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
      <p className="font-body whitespace-pre-wrap" style={{ fontSize: 15, lineHeight: 1.55 }}>{content}</p>
    </div>
  </div>
);

export { AIAvatar };
export default ChatMessage;
