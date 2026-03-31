import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Phone, Video, Check, CheckCheck } from "lucide-react";
import TypingIndicator from "@/components/TypingIndicator";

interface Message {
  role: "user" | "manager";
  content: string;
  time: string;
  status?: "sent" | "read";
}

const initialMessages: Message[] = [
  { role: "manager", content: "Привет! Получил твой бриф, уже смотрю 🔥\nКрутая задача – берём в работу.", time: "10:30" },
  { role: "manager", content: "Пара вопросов по деталям:\nесть референсы по стилю?", time: "10:31" },
  { role: "user", content: "Да, сейчас скину", time: "10:33", status: "read" },
  { role: "manager", content: "Отлично. И по срокам —\nстарт на этой неделе?", time: "10:34" },
];

const quickReplies = ["Да, всё верно", "Скину сейчас", "Когда созвонимся?"];

const ManagerChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { role: "user", content: input.trim(), time, status: "read" }]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "manager", content: "Отлично, принял! Вернусь с ответом в ближайшее время.", time },
      ]);
      scrollToBottom();
    }, 2000);
  };

  return (
    <div className="flex-1 bg-background flex flex-col max-w-[800px] md:mx-auto md:w-full h-[calc(100dvh-60px)] md:h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 h-[56px] px-4">
          <button
            onClick={() => navigate("/projects")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-bold text-background leading-none tracking-tight">АК</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-bold text-foreground leading-tight">Алексей К.</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
              <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
              <Phone size={20} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform text-muted-foreground hover:text-foreground">
              <Video size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 px-4 pt-5 pb-[200px] md:pb-[140px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start gap-2.5"} animate-message-in`}
            >
              {msg.role === "manager" && (
                <div className="w-[34px] h-[34px] rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mb-0.5">
                  <span className="text-[11px] font-bold text-background leading-none tracking-tight">АК</span>
                </div>
              )}
              <div className={`max-w-[75%] ${msg.role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                <p className="text-[14.5px] md:text-[15px] leading-[1.55] whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1.5 justify-end">
                  <span className={`text-[11px] ${msg.role === "user" ? "text-primary-foreground/40" : "text-muted-foreground/40"}`}>
                    {msg.time}
                  </span>
                  {msg.role === "user" && (
                    msg.status === "read"
                      ? <CheckCheck size={13} className="text-primary-foreground/40" />
                      : <Check size={13} className="text-primary-foreground/40" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end justify-start gap-2.5 animate-message-in">
              <div className="w-[34px] h-[34px] rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mb-0.5">
                <span className="text-[11px] font-bold text-background leading-none tracking-tight">АК</span>
              </div>
              <div className="message-bubble-ai">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick replies + Input */}
      <div className="fixed-bottom-bar md:static bg-background border-t border-border flex-shrink-0" style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}>
        {/* Quick replies */}
        <div className="flex gap-2 px-4 pt-3 pb-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((text) => (
            <button
              key={text}
              onClick={() => setInput(text)}
              className="flex-shrink-0 px-4 py-2.5 rounded-full bg-card border border-border text-[13px] font-medium text-foreground active:scale-95 transition-transform hover:bg-accent"
            >
              {text}
            </button>
          ))}
        </div>
        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 pb-3 pt-1.5">
          <button className="w-[44px] h-[44px] rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground active:scale-90 transition-all">
            <Paperclip size={19} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Написать..."
            className="flex-1 h-[44px] bg-card rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:ring-0 transition-colors duration-200 px-5"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-[44px] h-[44px] rounded-full bg-muted text-muted-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-20 flex-shrink-0"
          >
            <Send size={18} className="translate-x-[1px] -translate-y-[0.5px]" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ManagerChatPage;
