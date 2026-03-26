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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-md mx-auto flex items-center gap-3 h-[56px]" style={{ padding: "0 20px" }}>
          <div className="w-[38px] h-[38px] rounded-full bg-primary/8 border border-primary/12 flex items-center justify-center animate-glow-pulse">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground leading-none mb-1">neeklo AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-accent" />
              <span className="text-[12px] text-muted-foreground leading-none">онлайн</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto pt-5 pb-40 space-y-3.5" style={{ padding: "20px 20px 160px" }}>
          {items.map((item, i) => {
            if (item.type === "message") {
              return <ChatMessage key={i} role={item.role} content={item.content} />;
            }
            if (item.type === "chips") {
              return <QuickChips key={i} options={item.options} onSelect={handleUserInput} />;
            }
            if (item.type === "typing") {
              return (
                <div key={i} className="flex items-end gap-2 animate-message-in">
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
                  projectType="Landing Page"
                  budget="$500–$2000"
                  timeline="2–3 недели"
                  onApprove={handleApproveBrief}
                />
              );
            }
            if (item.type === "proposal") {
              return (
                <ProposalCard
                  key={i}
                  price="$850"
                  timeline="14 дней"
                  deliverables={[
                    "Дизайн и разработка лендинга",
                    "SEO-оптимизация и аналитика",
                    "2 раунда правок + 30 дней поддержки",
                  ]}
                  onConnect={handleConnectManager}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      <ChatInput onSend={handleUserInput} disabled={inputDisabled} />
      <BottomNav />
    </div>
  );
};

export default ChatPage;
