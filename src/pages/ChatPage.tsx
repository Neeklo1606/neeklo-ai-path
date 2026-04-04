import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { fetchChatBootstrap, chatComplete, createCrmChatSession } from "@/lib/cms-api";
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
    className="flex-shrink-0 rounded-full bg-[#0D0D0B]"
    style={{ width: size, height: size }}
    aria-hidden
  />
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

const copy = {
  ru: {
    noAssistantBanner: "Нет ассистента: в админке не задан публичный ключ API (public.chat.site_api_key).",
    noAssistantSend: "Настройте ключ API в CMS, чтобы отправлять сообщения.",
    defaultWelcome: "Здравствуйте! Чем могу помочь?",
    defaultHeader: "neeklo AI",
    defaultStatus: "онлайн",
    defaultPlaceholder: "Напишите сообщение…",
  },
  en: {
    noAssistantBanner: "No assistant: set the public site API key (public.chat.site_api_key) in admin.",
    noAssistantSend: "Configure the API key in CMS to send messages.",
    defaultWelcome: "Hi! How can I help?",
    defaultHeader: "neeklo AI",
    defaultStatus: "online",
    defaultPlaceholder: "Type a message…",
  },
} as const;

const ChatPage = () => {
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en" : "ru";
  const navigate = useNavigate();
  const c = copy[locale];

  const boot = useQuery({
    queryKey: ["chat", "bootstrap", locale],
    queryFn: () => fetchChatBootstrap(locale),
    staleTime: 60_000,
  });

  usePageTitle(boot.data?.pageTitle ?? "");

  useEffect(() => {
    if (boot.data !== undefined) {
      console.log("CHAT DATA:", boot.data);
    }
  }, [boot.data]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [crmChatId, setCrmChatId] = useState<string | null>(null);
  const [crmSessionReady, setCrmSessionReady] = useState(false);
  const initialized = useRef(false);
  const siteKey = boot.data?.siteApiKey?.trim() || null;
  const hasAssistant = !!siteKey;

  const headerTitle = boot.data?.headerTitle?.trim() || c.defaultHeader;
  const statusLabel = boot.data?.statusLabel?.trim() || c.defaultStatus;
  const inputPlaceholder = boot.data?.inputPlaceholder?.trim() || c.defaultPlaceholder;
  const welcomeText =
    boot.data?.welcomeMessage?.trim() || c.defaultWelcome;

  useEffect(() => {
    initialized.current = false;
    setMessages([]);
    setCrmChatId(null);
    setCrmSessionReady(false);
  }, [locale]);

  useEffect(() => {
    if (!boot.data) return;
    if (!siteKey) {
      setCrmSessionReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const existing = localStorage.getItem("neeklo_crm_chat_id");
        const r = await createCrmChatSession(existing);
        if (!cancelled) {
          localStorage.setItem("neeklo_crm_chat_id", r.chatId);
          setCrmChatId(r.chatId);
        }
      } catch {
        /* CRM session optional; chat still works */
      } finally {
        if (!cancelled) setCrmSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boot.data, siteKey]);

  useEffect(() => {
    if (!boot.data || initialized.current) return;
    const w = welcomeText;
    if (!w) return;
    initialized.current = true;
    setMessages([{ id: nextId(), role: "ai", text: w, timestamp: new Date() }]);
  }, [boot.data, welcomeText]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!hasText || !crmSessionReady) return;
    if (!siteKey) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: inputValue.trim(), timestamp: new Date() },
        { id: nextId(), role: "ai", text: c.noAssistantSend, timestamp: new Date() },
      ]);
      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      return;
    }
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
      chatComplete({ apiKey: siteKey, messages: apiMsgs, chatId: crmChatId ?? undefined })
        .then((r) => {
          setIsTyping(false);
          setMessages((p) => [...p, { id: nextId(), role: "ai", text: r.reply, timestamp: new Date() }]);
        })
        .catch((err: unknown) => {
          setIsTyping(false);
          const detail = err instanceof Error ? err.message : String(err);
          setMessages((p) => [...p, { id: nextId(), role: "ai", text: detail, timestamp: new Date() }]);
        });
      return combined;
    });
  }, [hasText, inputValue, siteKey, crmChatId, crmSessionReady, c.noAssistantSend]);

  if (boot.isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (boot.isError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="font-body text-destructive break-words max-w-md">
          {(boot.error as Error).message}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-[#0D0D0B] px-6 py-3 font-body text-sm font-semibold text-white"
        >
          ←
        </button>
      </div>
    );
  }

  if (!boot.data) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="font-body text-muted-foreground max-w-md">{c.noAssistantBanner}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-[#0D0D0B] px-6 py-3 font-body text-sm font-semibold text-white"
        >
          ←
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
            {headerTitle}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full inline-block"
              style={{
                width: 6,
                height: 6,
                background: hasAssistant ? "#00C853" : "#B0B0B0",
                boxShadow: hasAssistant ? "0 0 0 3px rgba(0,200,83,0.2)" : "none",
                animation: hasAssistant ? "pulse 2s infinite" : undefined,
              }}
            />
            <span className="font-body" style={{ fontSize: 12, color: hasAssistant ? "#00B341" : "#8A8880", lineHeight: 1 }}>
              {hasAssistant ? statusLabel : locale === "en" ? "offline" : "нет ключа"}
            </span>
          </div>
        </div>
      </div>

      {!hasAssistant ? (
        <div
          className="font-body shrink-0 px-4 py-2.5 text-center text-[13px]"
          style={{ background: "#FFF8E6", color: "#5C4A00", borderBottom: "1px solid #F5E6C0" }}
        >
          {c.noAssistantBanner}
        </div>
      ) : null}

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
            placeholder={inputPlaceholder}
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
            disabled={!hasText || !crmSessionReady}
            className="flex items-center justify-center flex-shrink-0 transition-all duration-150"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: hasText && crmSessionReady ? "#0D0D0B" : "#F0F0F0",
              color: hasText && crmSessionReady ? "white" : "#B0B0B0",
              border: "none",
              cursor: hasText && crmSessionReady ? "pointer" : "default",
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
