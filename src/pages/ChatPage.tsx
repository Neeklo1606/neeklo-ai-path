import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import ChatMessage, { AIAvatar } from "@/components/ChatMessage";
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
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const hasText = inputValue.trim().length > 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
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

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || inputDisabled) return;
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    handleUserInput(text);
  }, [inputValue, inputDisabled]);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 64,
          flexShrink: 0,
          borderBottom: "1px solid #F0F0F0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center transition-colors duration-150 hover:bg-[#F0F0F0]"
          style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
        </button>

        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 36, height: 36, background: "#0D0D0B" }}
        >
          <span className="text-white font-body" style={{ fontSize: 16, lineHeight: 1 }}>✦</span>
        </div>

        <div style={{ minWidth: 0 }}>
          <p className="font-body" style={{ fontSize: 15, fontWeight: 600, color: "#0D0D0B", lineHeight: 1, marginBottom: 3 }}>
            neeklo AI
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          background: "#F9F9F9",
          padding: "20px 20px 8px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
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
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderTop: "1px solid #F0F0F0",
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: 720, margin: "0 auto" }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={inputDisabled}
            rows={1}
            className="font-body"
            style={{
              flex: 1,
              minHeight: 44,
              maxHeight: 120,
              padding: "11px 16px",
              background: "#F5F4F0",
              border: "1px solid transparent",
              borderRadius: 14,
              fontSize: 15,
              resize: "none",
              outline: "none",
              lineHeight: "1.5",
              color: "#0D0D0B",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#D0D0D0";
            }}
            onBlur={(e) => {
              if (!e.currentTarget.value) {
                e.currentTarget.style.background = "#F5F4F0";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!hasText || inputDisabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: hasText ? "#0D0D0B" : "#F0F0F0",
              color: hasText ? "white" : "#B0B0B0",
              border: "none",
              cursor: hasText ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
