import { useState, useRef, useEffect, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── types ─── */
interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface ProductCard {
  type: "product";
  title: string;
  price: string;
  days: string;
  desc: string;
}

type ScriptStep = string | ProductCard | null;

const scripts: Record<string, ScriptStep[]> = {
  Лендинг: [
    "Для какого бизнеса нужен лендинг? Опиши вкратце — чем занимаетесь?",
    "Понял! Какая главная цель — заявки, продажи или портфолио?",
    { type: "product", title: "Лендинг под ключ", price: "от 35 000 ₽", days: "7 дней", desc: "Продающий одностраничник с формой заявки и аналитикой" },
  ],
  "Мобильное приложение": [
    "Это для iOS/Android или Telegram Mini App? Telegram в 3-5 раз быстрее и дешевле.",
    "Отлично! Есть уже дизайн или начинаем с нуля?",
    { type: "product", title: "Telegram Mini App", price: "от 65 000 ₽", days: "14-21 день", desc: "Полноценное приложение внутри Telegram" },
  ],
  "Интернет-магазин": [
    "Сколько товаров планируется? Есть уже брендинг?",
    "Понял! Сделаем с AI-фото, каталогом и онлайн-оплатой.",
    { type: "product", title: "Интернет-магазин", price: "от 95 000 ₽", days: "21 день", desc: "Полный интернет-магазин с оплатой и аналитикой" },
  ],
  "AI-агент": [
    "Для чего нужен агент? Продажи, поддержка, запись или что-то другое?",
    "Хороший выбор. Подключим к вашей CRM и научим отвечать за менеджера.",
    { type: "product", title: "AI-агент продаж", price: "от 150 000 ₽", days: "14 дней", desc: "AI-ассистент который работает 24/7 и ведёт лидов в CRM" },
  ],
  Другое: [
    "Расскажи подробнее — что именно нужно сделать? Буду рад помочь.",
    null,
    null,
  ],
};

const CHIPS = ["Лендинг", "Мобильное приложение", "Интернет-магазин", "AI-агент", "Другое"];

let msgId = 2;
const nextId = () => ++msgId;

/* ─── sub-components ─── */
const AIAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    className="flex-shrink-0 rounded-full flex items-center justify-center"
    style={{ width: size, height: size, background: "#0D0D0B" }}
  >
    <span className="text-white font-body" style={{ fontSize: size * 0.43, lineHeight: 1 }}>✦</span>
  </div>
);

const TypingDots = () => (
  <div className="flex items-end gap-2.5">
    <AIAvatar />
    <div
      className="flex items-center gap-1"
      style={{ background: "white", border: "1px solid #F0F0F0", borderRadius: "4px 16px 16px 16px", padding: "14px 18px" }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 6, height: 6, background: "#D0D0D0" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  </div>
);

const ProductCardBubble = ({
  card,
  onOrder,
}: {
  card: ProductCard;
  onOrder: () => void;
}) => (
  <div className="flex items-start gap-2.5">
    <AIAvatar />
    <motion.div
      className="bg-white border border-[#E0E0E0] rounded-2xl p-4"
      style={{ maxWidth: 280 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="font-body" style={{ fontSize: 15, fontWeight: 700 }}>{card.title}</p>
      <p className="font-body mt-1" style={{ fontSize: 16, fontWeight: 700, color: "#0052FF" }}>{card.price}</p>
      <p className="font-body mt-1 flex items-center gap-1" style={{ fontSize: 12, color: "#6A6860" }}>⏱ {card.days}</p>
      <p className="font-body mt-2" style={{ fontSize: 13, color: "#6A6860" }}>{card.desc}</p>
      <button
        onClick={onOrder}
        className="w-full font-body text-white rounded-lg mt-3 cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.95] transition-all"
        style={{ background: "#0D0D0B", padding: "10px 0", fontSize: 13, fontWeight: 600 }}
      >
        Оформить заявку →
      </button>
    </motion.div>
  </div>
);

/* ─── Page ─── */
const ChatPage = () => {
  usePageTitle("Чат с AI — neeklo");
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "ai", text: "Привет! Расскажи, что хочешь создать — я соберу всё остальное", timestamp: new Date() },
  ]);
  const [showChips, setShowChips] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentChip, setCurrentChip] = useState<string | null>(null);
  const [scriptStep, setScriptStep] = useState(0);
  const [productCard, setProductCard] = useState<ProductCard | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [waitingContact, setWaitingContact] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);

  const hasText = inputValue.trim().length > 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, isTyping, productCard]);

  const addAIMessage = useCallback((text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: nextId(), role: "ai", text, timestamp: new Date() }]);
    }, 900);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text, timestamp: new Date() }]);
  }, []);

  /* Chip select */
  const selectChip = useCallback(
    (chip: string) => {
      setChipsVisible(false);
      setTimeout(() => {
        setShowChips(false);
        addUserMessage(chip);
        setCurrentChip(chip);
        setScriptStep(0);

        const script = scripts[chip];
        if (script && script[0] && typeof script[0] === "string") {
          addAIMessage(script[0]);
          setScriptStep(1);
        }
      }, 150);
    },
    [addUserMessage, addAIMessage]
  );

  /* Send message */
  const sendMessage = useCallback(() => {
    if (!hasText) return;
    const text = inputValue.trim();
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    addUserMessage(text);
    setShowChips(false);

    if (waitingContact) {
      setWaitingContact(false);
      setContactSent(true);
      addAIMessage("Заявка принята! ✅ Менеджер свяжется с вами в ближайший час. Telegram: @neeklo_studio");
      return;
    }

    if (!currentChip) {
      // Free text as first message — treat like "Другое"
      setCurrentChip("Другое");
      addAIMessage(scripts["Другое"][0] as string);
      setScriptStep(1);
      return;
    }

    const script = scripts[currentChip];
    if (!script) return;

    const step = scriptStep;
    const nextStep = script[step];

    if (nextStep === null) {
      addAIMessage("Спасибо! Записал. Менеджер скоро свяжется.");
      return;
    }

    if (typeof nextStep === "string") {
      addAIMessage(nextStep);
      setScriptStep(step + 1);
    } else if (nextStep && typeof nextStep === "object" && nextStep.type === "product") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setProductCard(nextStep);
        setScriptStep(step + 1);
      }, 900);
    } else {
      addAIMessage("Спасибо! Записал информацию.");
    }
  }, [hasText, inputValue, currentChip, scriptStep, addUserMessage, addAIMessage, waitingContact]);

  /* Order from product card */
  const handleOrder = useCallback(() => {
    setProductCard(null);
    addUserMessage("Хочу оформить заявку");
    setWaitingContact(true);
    addAIMessage("Отлично! Напишите ваш контакт (телефон или Telegram) и мы свяжемся в течение часа.");
  }, [addUserMessage, addAIMessage]);

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
      {/* ━━━ HEADER ━━━ */}
      <div
        style={{
          height: 64,
          flexShrink: 0,
          borderBottom: "1px solid #F0F0F0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          background: "white",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
        </button>

        <AIAvatar size={36} />

        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="font-body" style={{ fontSize: 15, fontWeight: 600, color: "#0D0D0B", lineHeight: 1, marginBottom: 3 }}>
            neeklo AI
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full inline-block"
              style={{
                width: 6, height: 6, background: "#00C853",
                boxShadow: "0 0 0 3px rgba(0,200,83,0.2)",
                animation: "pulse 2s infinite",
              }}
            />
            <span className="font-body" style={{ fontSize: 12, color: "#00B341", lineHeight: 1 }}>онлайн</span>
          </div>
        </div>
      </div>

      {/* ━━━ MESSAGES ━━━ */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          background: "#F9F9F9",
          padding: "20px 16px 8px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <motion.div
                key={msg.id}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AIAvatar />
                <div
                  className="font-body"
                  style={{
                    background: "white",
                    border: "1px solid #F0F0F0",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "12px 16px",
                    fontSize: 15,
                    maxWidth: "78%",
                    lineHeight: 1.55,
                    color: "#0D0D0B",
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={msg.id}
                className="flex justify-end"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="font-body"
                  style={{
                    background: "#0D0D0B",
                    color: "#fff",
                    borderRadius: "16px 4px 16px 16px",
                    padding: "12px 16px",
                    fontSize: 15,
                    maxWidth: "78%",
                    lineHeight: 1.55,
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            )
          )}

          {/* Quick chips */}
          <AnimatePresence>
            {showChips && chipsVisible && (
              <motion.div
                className="flex flex-wrap gap-2 pl-[38px] mt-1"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => selectChip(chip)}
                    className="font-body rounded-full cursor-pointer hover:bg-[#2a2a2a] active:scale-95 transition-all"
                    style={{ background: "#0D0D0B", color: "#fff", padding: "8px 16px", fontSize: 14, fontWeight: 500 }}
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product card */}
          {productCard && <ProductCardBubble card={productCard} onOrder={handleOrder} />}

          {/* Contact sent confirmation */}
          {contactSent && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span style={{ fontSize: 32 }}>✅</span>
            </motion.div>
          )}

          {/* Typing */}
          {isTyping && <TypingDots />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ━━━ INPUT ━━━ */}
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderTop: "1px solid #F0F0F0",
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, maxWidth: 720, margin: "0 auto" }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напишите сообщение..."
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
              lineHeight: 1.5,
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
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!hasText}
            className="flex items-center justify-center flex-shrink-0 transition-all duration-150"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: hasText ? "#0D0D0B" : "#F0F0F0",
              color: hasText ? "white" : "#B0B0B0",
              border: "none",
              cursor: hasText ? "pointer" : "default",
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
