import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ChatMessage, { AIAvatar } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickChips from "@/components/QuickChips";
import TypingIndicator from "@/components/TypingIndicator";
import BriefCard from "@/components/BriefCard";
import ProposalCard from "@/components/ProposalCard";

type ChatItem =
  | { type: "message"; role: "user" | "ai"; content: string }
  | { type: "chips"; options: string[] }
  | { type: "typing" }
  | { type: "brief" }
  | { type: "proposal" };

const INITIAL_CHIPS = ["Лендинг", "Мобильное приложение", "Интернет-магазин", "Другое"];

const RESPONSES: Record<string, string> = {
  "Лендинг": "Отлично! Лендинг — наша специальность. Расскажи подробнее: какой продукт или услугу продвигаем?",
  "Мобильное приложение": "Круто! Telegram Mini App или нативное? Расскажи идею — соберу бриф.",
  "Интернет-магазин": "Понял, интернет-магазин. Сколько товаров планируешь и есть ли уже каталог?",
  "Другое": "Расскажи подробнее, что хочешь создать — я помогу разобраться.",
};

const DEFAULT_RESPONSE = "Спасибо! Записал. Давай уточню детали и подготовлю предложение.";

const ChatPage = () => {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [firstReply, setFirstReply] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  }, []);

  const addTypingThenMessage = useCallback(
    (message: string, chips?: string[], extra?: ChatItem) => {
      setInputDisabled(true);
      setItems((prev) => [...prev, { type: "typing" }]);
      scrollToBottom();

      setTimeout(() => {
        setItems((prev) => {
          const without = prev.filter((i) => i.type !== "typing");
          const next: ChatItem[] = [
            ...without,
            { type: "message", role: "ai", content: message },
          ];
          if (chips) next.push({ type: "chips", options: chips });
          if (extra) next.push(extra);
          return next;
        });
        setInputDisabled(false);
        scrollToBottom();
      }, 900);
    },
    [scrollToBottom]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    addTypingThenMessage(
      "Привет! Расскажи, что хочешь создать — я соберу всё остальное",
      INITIAL_CHIPS
    );
  }, [addTypingThenMessage]);

  const handleUserInput = useCallback(
    (text: string) => {
      setItems((prev) => [
        ...prev.filter((i) => i.type !== "chips"),
        { type: "message", role: "user", content: text },
      ]);
      scrollToBottom();

      const response = firstReply
        ? RESPONSES[text] || DEFAULT_RESPONSE
        : DEFAULT_RESPONSE;

      if (firstReply) setFirstReply(false);
      addTypingThenMessage(response);
    },
    [firstReply, addTypingThenMessage, scrollToBottom]
  );

  const handleApproveBrief = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Утверждаю ✅" }]);
    scrollToBottom();
    addTypingThenMessage("Готово — вот коммерческое предложение", undefined, { type: "proposal" });
  }, [addTypingThenMessage, scrollToBottom]);

  const handleConnectManager = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Подключить менеджера" }]);
    scrollToBottom();
    addTypingThenMessage("Подключаю менеджера... Один момент");
    setTimeout(() => navigate("/manager-chat"), 2400);
  }, [navigate, addTypingThenMessage, scrollToBottom]);

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      {/* HEADER */}
      <header
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ height: 64, borderBottom: "1px solid #F0F0F0", background: "white" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-md transition-colors duration-150 hover:bg-[#F0F0F0]"
          style={{ width: 36, height: 36 }}
        >
          <ArrowLeft size={20} />
        </button>

        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 36, height: 36, background: "#0D0D0B" }}
        >
          <span className="text-white text-[14px] leading-none">✦</span>
        </div>

        <div className="min-w-0">
          <p className="font-body text-[15px] font-[600] text-foreground leading-none mb-0.5">
            neeklo AI
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full animate-pulse"
              style={{ width: 6, height: 6, background: "#00B341" }}
            />
            <span className="font-body text-[12px] leading-none" style={{ color: "#00B341" }}>
              онлайн
            </span>
          </div>
        </div>
      </header>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ background: "#F9F9F9", padding: "20px 16px" }}
      >
        <div className="max-w-[760px] mx-auto space-y-3">
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
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #F0F0F0",
                      borderRadius: "4px 16px 16px 16px",
                      padding: "12px 16px",
                    }}
                  >
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
              return <ProposalCard key={i} onConnect={handleConnectManager} />;
            }
            return null;
          })}
        </div>
      </div>

      {/* INPUT */}
      <ChatInput onSend={handleUserInput} disabled={inputDisabled} />
    </div>
  );
};

export default ChatPage;
