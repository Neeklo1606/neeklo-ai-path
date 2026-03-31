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

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  }, []);

  const addTypingThenMessage = useCallback(
    (message: string, chips?: string[], extra?: ChatItem) => {
      setInputDisabled(true);
      setTimeout(() => {
        setItems((prev) => [...prev, { type: "typing" }]);
        scrollToBottom();
      }, 200);

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
      }, 1100);
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
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* Desktop centered card wrapper */}
      <div className="flex flex-col h-full w-full lg:max-w-[720px] lg:mx-auto lg:border-x lg:border-[#F0F0F0]">

        {/* HEADER */}
        <header
          className="flex items-center flex-shrink-0"
          style={{
            height: 64,
            borderBottom: "1px solid #F0F0F0",
            background: "white",
            padding: "0 20px",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-colors duration-150 hover:bg-[#F0F0F0]"
            style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}
          >
            <ArrowLeft size={18} />
          </button>

          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: "#0D0D0B" }}
          >
            <span className="text-white font-body" style={{ fontSize: 16, lineHeight: 1 }}>✦</span>
          </div>

          <div className="min-w-0">
            <p className="font-body leading-none" style={{ fontSize: 15, fontWeight: 600, color: "#0D0D0B", marginBottom: 3 }}>
              neeklo AI
            </p>
            <div className="flex items-center" style={{ gap: 5 }}>
              <span
                className="rounded-full inline-block"
                style={{
                  width: 6, height: 6, background: "#00C853",
                  boxShadow: "0 0 0 3px rgba(0,200,83,0.2)",
                  animation: "pulse 2s infinite",
                }}
              />
              <span className="font-body" style={{ fontSize: 12, color: "#00B341", lineHeight: 1 }}>
                онлайн
              </span>
            </div>
          </div>
        </header>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ background: "#F9F9F9", padding: "20px 20px 8px" }}
        >
          <div className="flex flex-col" style={{ gap: 12 }}>
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
                    <AIAvatar size={28} />
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
    </div>
  );
};

export default ChatPage;
