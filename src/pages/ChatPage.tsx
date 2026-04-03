import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { fetchChatBootstrap, chatComplete } from "@/lib/cms-api";
import { useLanguage } from "@/hooks/useLanguage";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

let msgId = 1;
const nextId = () => ++msgId;

const AIAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    className="flex-shrink-0 rounded-full flex items-center justify-center"
    style={{ width: size, height: size, background: "#0D0D0B" }}
  >
    <span className="text-white font-body" style={{ fontSize: size * 0.43, lineHeight: 1 }}>
      ✦
    </span>
  </div>
);

const TypingDots = () => (
  <div className="flex items-end gap-2.5">
    <AIAvatar />
    <div
      className="flex items-center gap-1"
      style={{
        background: "white",
        border: "1px solid #F0F0F0",
        borderRadius: "4px 16px 16px 16px",
        padding: "14px 18px",
      }}
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

const ChatPage = () => {
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";
  usePageTitle(locale === "en" ? "AI chat – neeklo" : "Чат с AI – neeklo");
  const navigate = useNavigate();

  const boot = useQuery({
    queryKey: ["chat", "bootstrap", locale],
    queryFn: () => fetchChatBootstrap(locale),
    staleTime: 60_000,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!boot.data || initialized.current) return;
    initialized.current = true;
    setMessages([{ id: nextId(), role: "ai", text: boot.data.welcomeMessage, timestamp: new Date() }]);
  }, [boot.data]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const siteKey = boot.data?.siteApiKey?.trim() || null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, isTyping]);

  const hasText = inputValue.trim().length > 0;

  const sendMessage = useCallback(() => {
    if (!hasText || !siteKey) return;
    const text = inputValue.trim();
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => {
      const userMsg = { id: nextId(), role: "user" as const, text, timestamp: new Date() };
      const combined = [...prev, userMsg];
      const apiMsgs = combined.map((m) => ({
        role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));
      setIsTyping(true);
      chatComplete({ apiKey: siteKey, messages: apiMsgs })
        .then((r) => {
          setIsTyping(false);
          setMessages((p) => [...p, { id: nextId(), role: "ai", text: r.reply, timestamp: new Date() }]);
        })
        .catch((err: unknown) => {
          setIsTyping(false);
          const detail = err instanceof Error ? err.message : "ошибка сети";
          setMessages((p) => [
            ...p,
            {
              id: nextId(),
              role: "ai",
              text:
                locale === "en"
                  ? `Could not load a reply (${detail}). Try again.`
                  : `Не удалось получить ответ (${detail}). Повторите попытку.`,
              timestamp: new Date(),
            },
          ]);
        });
      return combined;
    });
  }, [hasText, inputValue, siteKey, locale]);

  if (boot.isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <p className="font-body text-muted-foreground">Загрузка чата…</p>
      </div>
    );
  }

  if (boot.isError || !siteKey) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="font-body text-[#0D0D0B]">Чат не настроен.</p>
        <p className="font-body text-sm text-muted-foreground max-w-md">
          В админке создайте ассистента, затем в настройках CMS задайте публичный ключ{" "}
          <code className="rounded bg-muted px-1">public.chat.site_api_key</code> (значение — ключ сайта{" "}
          <code className="rounded bg-muted px-1">nk_…</code>).
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-[#0D0D0B] px-6 py-3 font-body text-sm font-semibold text-white"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div
      className="chat-page-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxHeight: "-webkit-fill-available",
        overflow: "hidden",
        background: "white",
        position: "fixed",
        inset: 0,
        zIndex: 50,
      }}
    >
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
          type="button"
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
                width: 6,
                height: 6,
                background: "#00C853",
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
          {isTyping && <TypingDots />}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
            type="button"
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
