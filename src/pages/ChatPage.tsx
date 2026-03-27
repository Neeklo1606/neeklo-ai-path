import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { AIAvatar } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickChips from "@/components/QuickChips";
import TypingIndicator from "@/components/TypingIndicator";
import BriefCard from "@/components/BriefCard";
import ProposalCard from "@/components/ProposalCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

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

  return (
    <div className="flex-1 bg-background flex flex-col max-w-[800px] md:mx-auto md:w-full">
      {/* Header - mobile only */}
      <header className="sticky top-0 z-30 bg-background border-b border-border md:hidden">
        <div className="flex items-center gap-3 h-[56px] px-5">
          <div className="w-[32px] h-[32px] rounded-full bg-card border border-border flex items-center justify-center">
            <Sparkles size={13} className="text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground leading-none mb-1">neeklo AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
              <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto space-y-4" style={{ padding: "20px 20px 160px" }}>
          {/* Desktop chat header */}
          <div className="hidden md:flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-[36px] h-[36px] rounded-full bg-card border border-border flex items-center justify-center">
              <Sparkles size={14} className="text-foreground" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-foreground leading-none mb-1">neeklo AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
                <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
              </div>
            </div>
          </div>

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

      {/* Desktop input - inline */}
      <div className="hidden md:block border-t border-border bg-background">
        <div className="max-w-[700px] mx-auto py-4 px-5">
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Напишите сообщение..."
              disabled={inputDisabled}
              className="flex-1 bg-card rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0 transition-colors duration-200"
              style={{ padding: "12px 20px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    handleUserInput(target.value.trim());
                    target.value = "";
                  }
                }
              }}
            />
            <button
              disabled={inputDisabled}
              className="w-[46px] h-[46px] rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-15 flex-shrink-0 shadow-sm"
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input.value.trim()) {
                  handleUserInput(input.value.trim());
                  input.value = "";
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px]">
                <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
              </svg>
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
