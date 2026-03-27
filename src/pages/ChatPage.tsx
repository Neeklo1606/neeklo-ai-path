import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { AIAvatar } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickChips from "@/components/QuickChips";
import TypingIndicator from "@/components/TypingIndicator";
import BriefCard from "@/components/BriefCard";
import ProposalCard from "@/components/ProposalCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send } from "lucide-react";

type ChatItem =
  | { type: "message"; role: "user" | "ai"; content: string }
  | { type: "chips"; options: string[] }
  | { type: "typing" }
  | { type: "brief" }
  | { type: "proposal" };

const FLOW_STEPS = [
  {
    ai: "Привет! Расскажи, что хочешь создать — я соберу всё остальное",
    chips: ["Лендинг", "Мобильное приложение", "Интернет-магазин", "Другое"],
  },
  {
    ai: "Отлично! Уточню пару деталей. Какой бюджет планируешь?",
    chips: ["До $500", "$500–$2000", "$2000+", "Обсудим"],
  },
  {
    ai: "Когда нужен результат?",
    chips: ["Срочно (до недели)", "2–4 недели", "Без спешки"],
  },
];

const ChatPage = () => {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [step, setStep] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [desktopInput, setDesktopInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  }, []);

  const addTypingThenMessage = useCallback((message: string, chips?: string[], extra?: ChatItem) => {
    setInputDisabled(true);
    setItems((prev) => [...prev, { type: "typing" }]);
    scrollToBottom();

    setTimeout(() => {
      setItems((prev) => {
        const withoutTyping = prev.filter((i) => i.type !== "typing");
        const newItems: ChatItem[] = [
          ...withoutTyping,
          { type: "message", role: "ai", content: message },
        ];
        if (chips) newItems.push({ type: "chips", options: chips });
        if (extra) newItems.push(extra);
        return newItems;
      });
      setInputDisabled(false);
      scrollToBottom();
    }, 1000);
  }, [scrollToBottom]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    addTypingThenMessage(FLOW_STEPS[0].ai, FLOW_STEPS[0].chips);
  }, [addTypingThenMessage]);

  const handleUserInput = useCallback((text: string) => {
    setItems((prev) => [
      ...prev.filter((i) => i.type !== "chips"),
      { type: "message", role: "user", content: text },
    ]);
    scrollToBottom();

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < FLOW_STEPS.length) {
      addTypingThenMessage(FLOW_STEPS[nextStep].ai, FLOW_STEPS[nextStep].chips);
    } else if (nextStep === FLOW_STEPS.length) {
      addTypingThenMessage("Собрал для тебя бриф — посмотри", undefined, { type: "brief" });
    }
  }, [step, addTypingThenMessage, scrollToBottom]);

  const handleApproveBrief = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Утверждаю ✅" }]);
    scrollToBottom();
    addTypingThenMessage("Готово — вот коммерческое предложение", undefined, { type: "proposal" });
  }, [addTypingThenMessage, scrollToBottom]);

  const handleConnectManager = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Подключить менеджера" }]);
    scrollToBottom();
    setInputDisabled(true);
    setItems((prev) => [...prev, { type: "typing" }]);

    setTimeout(() => {
      setItems((prev) => {
        const withoutTyping = prev.filter((i) => i.type !== "typing");
        return [...withoutTyping, { type: "message", role: "ai", content: "Подключаю менеджера... Один момент" }];
      });
      scrollToBottom();
      setTimeout(() => navigate("/manager-chat"), 1500);
    }, 1000);
  }, [navigate, scrollToBottom]);

  const handleDesktopSend = useCallback(() => {
    if (!desktopInput.trim() || inputDisabled) return;
    handleUserInput(desktopInput.trim());
    setDesktopInput("");
  }, [desktopInput, inputDisabled, handleUserInput]);

  return (
    <div className="flex-1 bg-background flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border md:hidden">
        <div className="flex items-center gap-3 h-[56px] px-4">
          <div className="w-[36px] h-[36px] rounded-full bg-card border border-border flex items-center justify-center">
            <Sparkles size={14} className="text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground leading-none mb-0.5">neeklo AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
              <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <div className="hidden md:block border-b border-border bg-background">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="flex items-center gap-3 h-[60px]">
            <div className="w-[40px] h-[40px] rounded-full bg-card border border-border flex items-center justify-center">
              <Sparkles size={15} className="text-foreground" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-foreground leading-none mb-0.5">neeklo AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area - scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[760px] mx-auto px-4 md:px-6 py-5 space-y-3 md:space-y-4 pb-4">
          {items.map((item, i) => {
            if (item.type === "message") {
              return <ChatMessage key={i} role={item.role} content={item.content} />;
            }
            if (item.type === "chips") {
              return <QuickChips key={i} options={item.options} onSelect={handleUserInput} />;
            }
            if (item.type === "typing") {
              return (
                <div key={i} className="flex items-end gap-2.5 animate-message-in">
                  <AIAvatar />
                  <div className="message-bubble-ai">
                    <TypingIndicator />
                  </div>
                </div>
              );
            }
            if (item.type === "brief") {
              return (
                <BriefCard
                  key={i}
                  projectType="Лендинг"
                  budget="$500–$2 000"
                  timeline="2–3 недели"
                  onApprove={handleApproveBrief}
                />
              );
            }
            if (item.type === "proposal") {
              return (
                <ProposalCard
                  key={i}
                  onConnect={handleConnectManager}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Desktop input - pinned bottom */}
      <div className="hidden md:block border-t border-border bg-background">
        <div className="max-w-[760px] mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={desktopInput}
              onChange={(e) => setDesktopInput(e.target.value)}
              placeholder="Напишите сообщение..."
              disabled={inputDisabled}
              className="flex-1 bg-card rounded-2xl text-[15px] text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0 transition-colors duration-200 h-[48px] px-5"
              onKeyDown={(e) => e.key === "Enter" && handleDesktopSend()}
            />
            <button
              onClick={handleDesktopSend}
              disabled={!desktopInput.trim() || inputDisabled}
              className="w-[48px] h-[48px] rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-15 flex-shrink-0"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile input */}
      <div className="md:hidden">
        <ChatInput onSend={handleUserInput} disabled={inputDisabled} />
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatPage;
