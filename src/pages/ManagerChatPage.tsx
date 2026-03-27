import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Phone, Video, Check, CheckCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Message {
  role: "user" | "manager";
  content: string;
  time: string;
  status?: "sent" | "read";
}

const initialMessages: Message[] = [
  { role: "manager", content: "Привет! Получил твой бриф, уже смотрю 🔥\nКрутая задача — берём в работу.", time: "10:30" },
  { role: "manager", content: "Пара вопросов по деталям:\nесть референсы по стилю?", time: "10:31" },
  { role: "user", content: "Да, сейчас скину", time: "10:33", status: "read" },
  { role: "manager", content: "Отлично. И по срокам —\nстарт на этой неделе?", time: "10:34" },
];

const quickReplies = ["Да, всё верно", "Скину сейчас", "Когда созвонимся?"];

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
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { role: "user", content: input.trim(), time, status: "read" }]);
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
    <div className="flex-1 bg-background flex flex-col max-w-[800px] md:mx-auto md:w-full h-[calc(100dvh-60px)] md:h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 h-[56px] px-5">
          <button
            onClick={() => navigate("/projects")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="w-[36px] h-[36px] rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-semibold text-background leading-none">АК</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground leading-none mb-1">Алексей К.</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
              <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
              <Phone size={18} />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
              <Video size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3 px-5 pt-5 pb-[200px] md:pb-[140px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start gap-2.5"} animate-message-in`}
            >
              {msg.role === "manager" && (
                <div className="w-[32px] h-[32px] rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-semibold text-background leading-none">АК</span>
                </div>
              )}
              <div className={`max-w-[78%] md:max-w-[70%] ${msg.role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                <p className="text-[14px] md:text-[15px] leading-[1.65] whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 justify-end`}>
                  <span className={`text-[10px] ${msg.role === "user" ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
                    {msg.time}
                  </span>
                  {msg.role === "user" && (
                    msg.status === "read"
                      ? <CheckCheck size={12} className="text-primary-foreground/50" />
                      : <Check size={12} className="text-primary-foreground/50" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick replies + Input */}
      <div className="fixed-bottom-bar md:static bg-background border-t border-border flex-shrink-0" style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}>
        {/* Quick replies */}
        <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto no-scrollbar">
          {quickReplies.map((text) => (
            <button
              key={text}
              onClick={() => setInput(text)}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-card border border-border text-[13px] text-foreground active:scale-95 transition-transform hover:bg-accent"
            >
              {text}
            </button>
          ))}
        </div>
        {/* Input bar */}
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-2">
          <button className="w-[42px] h-[42px] rounded-full bg-card flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground active:scale-90 transition-all">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Написать..."
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
