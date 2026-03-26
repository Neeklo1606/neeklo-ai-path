import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Message {
  role: "user" | "manager";
  content: string;
  time: string;
}

const initialMessages: Message[] = [
  { role: "manager", content: "Привет! Я ваш менеджер по проекту. Бриф получен, начинаем работу.", time: "10:30" },
  { role: "manager", content: "Есть несколько уточнений по дизайну — напишите, когда будет удобно обсудить.", time: "10:31" },
];

const ManagerChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { role: "user", content: input.trim(), time }]);
    setInput("");
    scrollToBottom();

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "manager", content: "Отлично, принял! Вернусь с ответом в ближайшее время.", time },
      ]);
      scrollToBottom();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 h-[56px] px-5">
          <button
            onClick={() => navigate("/projects")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="w-[32px] h-[32px] rounded-full bg-card border border-border flex items-center justify-center">
            <User size={13} className="text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground leading-none mb-1">Алексей К.</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-green-500" />
              <span className="text-[12px] text-muted-foreground leading-none">менеджер</span>
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-4" style={{ padding: "20px 20px 160px" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start gap-2.5"} animate-message-in`}
            >
              {msg.role === "manager" && (
                <div className="w-[32px] h-[32px] rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-foreground" />
                </div>
              )}
              <div className={`max-w-[78%] ${msg.role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                <p className="text-[14px] leading-[1.65]">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed-bottom-bar bg-background border-t border-border" style={{ bottom: "calc(60px + env(safe-area-inset-bottom))", padding: "12px 20px" }}>
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-card rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0 transition-colors duration-200"
            style={{ padding: "12px 20px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-[46px] h-[46px] rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-15 flex-shrink-0 shadow-sm"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ManagerChatPage;
