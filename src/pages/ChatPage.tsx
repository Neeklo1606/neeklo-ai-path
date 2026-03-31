import { useState, useRef, useEffect, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Download } from "lucide-react";
import ChatMessage, { AIAvatar } from "@/components/ChatMessage";
import QuickChips from "@/components/QuickChips";
import TypingIndicator from "@/components/TypingIndicator";
import BriefCard from "@/components/BriefCard";
import ProposalCard from "@/components/ProposalCard";

type ChatItem =
  | { type: "message"; role: "user" | "ai"; content: string }
  | { type: "chips"; options: string[] }
  | { type: "typing" }
  | { type: "brief"; data: BriefData }
  | { type: "proposal" };

interface BriefData {
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
}

const STORAGE_KEY = "neeklo_chat_history";
const STEP_KEY = "neeklo_chat_step";

const INITIAL_CHIPS = ["Лендинг", "Мобильное приложение", "Интернет-магазин", "Другое"];

const DETAIL_QUESTIONS: Record<string, { question: string; chips: string[] }> = {
  "Лендинг": {
    question: "Отлично! Какой тип лендинга нужен?",
    chips: ["Продающий", "Подписная страница", "Визитка", "Свой вариант"],
  },
  "Мобильное приложение": {
    question: "Круто! Какой тип приложения?",
    chips: ["Telegram Mini App", "iOS/Android", "Кроссплатформенное", "Свой вариант"],
  },
  "Интернет-магазин": {
    question: "Понял! Сколько товаров планируешь?",
    chips: ["До 50", "50–500", "500+", "Не знаю пока"],
  },
  "Другое": {
    question: "Расскажи подробнее — что хочешь создать?",
    chips: [],
  },
};

const BUDGET_CHIPS = ["До $500", "$500–$1500", "$1500–$5000", "Обсудим"];
const TIMELINE_CHIPS = ["1 неделя", "2–3 недели", "1 месяц", "Не срочно"];

function saveChat(items: ChatItem[], step: number) {
  try {
    const serializable = items.filter(i => i.type === "message" || i.type === "brief" || i.type === "proposal");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    localStorage.setItem(STEP_KEY, String(step));
  } catch {}
}

function loadChat(): { items: ChatItem[]; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const step = parseInt(localStorage.getItem(STEP_KEY) || "0", 10);
    if (!raw) return null;
    const items = JSON.parse(raw) as ChatItem[];
    if (items.length === 0) return null;
    return { items, step };
  } catch {
    return null;
  }
}

function generateBriefPDF(data: BriefData) {
  const content = `
══════════════════════════════════════
        БРИФ ПРОЕКТА — neeklo studio
══════════════════════════════════════

Тип проекта:    ${data.projectType}
Описание:       ${data.description}
Бюджет:         ${data.budget}
Сроки:          ${data.timeline}

══════════════════════════════════════
Дата:           ${new Date().toLocaleDateString("ru-RU")}
══════════════════════════════════════

Данный документ сформирован автоматически
на основе вашего запроса в neeklo AI.

Для обсуждения деталей — подключите менеджера.
  `.trim();

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brief-${data.projectType.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const ChatPage = () => {
  usePageTitle("Чат с AI — neeklo");
  const saved = useRef(loadChat());
  const [items, setItems] = useState<ChatItem[]>(saved.current?.items || []);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [step, setStep] = useState(saved.current?.step || 0);
  // step: 0=initial, 1=picked category, 2=picked detail, 3=picked budget, 4=picked timeline, 5=brief shown, 6=proposal
  const [inputValue, setInputValue] = useState("");
  const [briefData, setBriefData] = useState<Partial<BriefData>>({});
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

  // Save on change
  useEffect(() => {
    saveChat(items, step);
  }, [items, step]);

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
          if (chips && chips.length > 0) next.push({ type: "chips", options: chips });
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
    if (items.length === 0) {
      addTypingThenMessage(
        "Привет! 👋 Расскажи, что хочешь создать — я соберу бриф и предложу варианты",
        INITIAL_CHIPS
      );
    }
  }, [addTypingThenMessage, items.length]);

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

      if (step === 0) {
        // Category selected
        const detail = DETAIL_QUESTIONS[text];
        const bd = { ...briefData, projectType: text };
        setBriefData(bd);
        setStep(1);
        if (detail) {
          addTypingThenMessage(detail.question, detail.chips.length > 0 ? detail.chips : undefined);
        } else {
          addTypingThenMessage("Хороший выбор! Расскажи подробнее — что именно нужно?");
        }
      } else if (step === 1) {
        // Detail answered
        const bd = { ...briefData, description: text };
        setBriefData(bd);
        setStep(2);
        addTypingThenMessage("Отлично, записал! 💰 Какой бюджет планируешь?", BUDGET_CHIPS);
      } else if (step === 2) {
        // Budget
        const bd = { ...briefData, budget: text };
        setBriefData(bd);
        setStep(3);
        addTypingThenMessage("Понял! ⏱ Какие сроки?", TIMELINE_CHIPS);
      } else if (step === 3) {
        // Timeline → generate brief
        const finalBrief: BriefData = {
          projectType: briefData.projectType || "Проект",
          description: briefData.description || text,
          budget: briefData.budget || "Обсудим",
          timeline: text,
        };
        setBriefData(finalBrief);
        setStep(4);
        addTypingThenMessage(
          "Готово! 📋 Вот твой бриф — проверь и утверди",
          undefined,
          { type: "brief", data: finalBrief }
        );
      } else {
        // Free chat after brief
        addTypingThenMessage("Спасибо! Записал. Давай уточню детали и подготовлю предложение.");
      }
    },
    [step, briefData, addTypingThenMessage, scrollToBottom]
  );

  const handleApproveBrief = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Утверждаю ✅" }]);
    scrollToBottom();
    setStep(5);
    addTypingThenMessage("Отлично! 🚀 Вот коммерческое предложение — выбери подходящий вариант", undefined, { type: "proposal" });
  }, [addTypingThenMessage, scrollToBottom]);

  const handleDownloadBrief = useCallback((data: BriefData) => {
    generateBriefPDF(data);
  }, []);

  const handleConnectManager = useCallback(() => {
    setItems((prev) => [...prev, { type: "message", role: "user", content: "Подключить менеджера" }]);
    scrollToBottom();
    setStep(6);
    addTypingThenMessage("Подключаю менеджера... Один момент ⏳");
    setTimeout(() => navigate("/manager-chat"), 2400);
  }, [navigate, addTypingThenMessage, scrollToBottom]);

  const handleClearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
    setItems([]);
    setStep(0);
    setBriefData({});
    initialized.current = false;
    setTimeout(() => {
      initialized.current = true;
      addTypingThenMessage(
        "Привет! 👋 Расскажи, что хочешь создать — я соберу бриф и предложу варианты",
        INITIAL_CHIPS
      );
    }, 100);
  }, [addTypingThenMessage]);

  const placeholders = [
    "Опиши свою задачу...",
    "Расскажи подробнее...",
    "Укажи бюджет или выбери...",
    "Укажи сроки или выбери...",
    "Напишите сообщение...",
  ];

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

        <div style={{ minWidth: 0, flex: 1 }}>
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

        {items.length > 2 && (
          <button
            onClick={handleClearChat}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            Новый чат
          </button>
        )}
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
                <div key={i}>
                  <BriefCard
                    projectType={item.data.projectType}
                    budget={item.data.budget}
                    timeline={item.data.timeline}
                    onApprove={handleApproveBrief}
                  />
                  <button
                    onClick={() => handleDownloadBrief(item.data)}
                    className="flex items-center gap-2 ml-[42px] mt-2 px-4 py-2.5 rounded-xl bg-card border border-border text-[13px] font-medium text-foreground hover:bg-accent active:scale-[0.98] transition-all"
                  >
                    <Download size={14} />
                    Скачать бриф
                  </button>
                </div>
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
            placeholder={placeholders[Math.min(step, placeholders.length - 1)]}
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
