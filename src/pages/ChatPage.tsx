import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickChips from "@/components/QuickChips";
import TypingIndicator from "@/components/TypingIndicator";
import BriefCard from "@/components/BriefCard";
import ProposalCard from "@/components/ProposalCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

type ChatItem =
  | { type: "message"; role: "user" | "ai"; content: string }
  | { type: "chips"; options: string[] }
  | { type: "typing" }
  | { type: "brief" }
  | { type: "proposal" };

const FLOW_STEPS = [
  {
    ai: "Привет! Расскажи, что хочешь создать — я соберу всё остальное 🚀",
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

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

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
        if (chips) {
          newItems.push({ type: "chips", options: chips });
        }
        if (extra) {
          newItems.push(extra);
        }
        return newItems;
      });
      setInputDisabled(false);
      scrollToBottom();
    }, 1200);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const firstStep = FLOW_STEPS[0];
    addTypingThenMessage(firstStep.ai, firstStep.chips);
  }, [addTypingThenMessage]);

  const handleUserInput = (text: string) => {
    setItems((prev) => [
      ...prev.filter((i) => i.type !== "chips"),
      { type: "message", role: "user", content: text },
    ]);
    scrollToBottom();

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < FLOW_STEPS.length) {
      const s = FLOW_STEPS[nextStep];
      addTypingThenMessage(s.ai, s.chips);
    } else if (nextStep === FLOW_STEPS.length) {
      addTypingThenMessage("Собрал для тебя бриф — посмотри 👇", undefined, { type: "brief" });
    }
  };

  const handleApproveBrief = () => {
    setItems((prev) => [
      ...prev,
      { type: "message", role: "user", content: "Утверждаю ✅" },
    ]);
    scrollToBottom();
    addTypingThenMessage("Готово — вот коммерческое предложение 🎯", undefined, { type: "proposal" });
  };

  const handleConnectManager = () => {
    setItems((prev) => [
      ...prev,
      { type: "message", role: "user", content: "Подключить менеджера" },
    ]);
    scrollToBottom();
    setInputDisabled(true);
    setItems((prev) => [...prev, { type: "typing" }]);

    setTimeout(() => {
      setItems((prev) => {
        const withoutTyping = prev.filter((i) => i.type !== "typing");
        return [
          ...withoutTyping,
          { type: "message", role: "ai", content: "Подключаю менеджера... Один момент ⏳" },
        ];
      });
      scrollToBottom();

      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-glow-pulse">
            <span className="text-primary text-sm font-bold">n</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">neeklo AI</h2>
            <p className="text-[11px] text-accent">онлайн</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        <div className="max-w-md mx-auto space-y-4">
          {items.map((item, i) => {
            if (item.type === "message") {
              return <ChatMessage key={i} role={item.role} content={item.content} />;
            }
            if (item.type === "chips") {
              return <QuickChips key={i} options={item.options} onSelect={handleUserInput} />;
            }
            if (item.type === "typing") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-glow-pulse">
                    <span className="text-primary text-sm font-bold">n</span>
                  </div>
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
                  title="Лендинг для стартапа"
                  type="Landing Page"
                  timeline="2–3 недели"
                  features={["Адаптивный дизайн", "SEO-оптимизация", "Форма заявки", "Аналитика"]}
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
                  scope="Полный цикл: дизайн, разработка, запуск. Включает 2 раунда правок и техподдержку 30 дней."
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
