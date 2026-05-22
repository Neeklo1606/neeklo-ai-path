import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import {
  fetchChatBootstrap,
  chatComplete,
  createCrmChatSession,
  fetchCurrentChatTranscript,
  getPrototypeJobStatus,
  type CrmTranscriptEntry,
} from "@/lib/cms-api";
import { useLanguage } from "@/hooks/useLanguage";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

function mapTranscriptToUiMessages(rows: CrmTranscriptEntry[]): { msgs: Message[]; maxId: number } {
  const msgs: Message[] = [];
  let nid = 0;
  for (const e of rows) {
    const content = String(e.content ?? "");
    const ts = e.at ? new Date(String(e.at)) : new Date();
    nid += 1;
    if (e.role === "user") {
      msgs.push({ id: nid, role: "user", text: content, timestamp: ts });
    } else if (e.role === "assistant") {
      msgs.push({ id: nid, role: "ai", text: content, timestamp: ts });
    } else if (e.role === "manager") {
      msgs.push({ id: nid, role: "ai", text: `Менеджер: ${content}`, timestamp: ts });
    }
  }
  return { msgs, maxId: nid };
}

function renderTextWithLinks(text: string) {
  const urlRe = /(https?:\/\/[^\s]+)/g;
  const parts = String(text || "").split(urlRe);
  return parts.map((part, idx) => {
    if (/^https?:\/\/\S+$/i.test(part)) {
      return (
        <a
          key={`${part}-${idx}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}
        >
          {part}
        </a>
      );
    }
    return <span key={`txt-${idx}`}>{part}</span>;
  });
}

const AIAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    className="flex-shrink-0 rounded-full"
    style={{ width: size, height: size, background: "var(--surface-3)" }}
    aria-hidden
  />
);

const TypingDots = () => (
  <div className="flex items-end gap-2.5">
    <AIAvatar />
    <div
      className="flex items-center gap-1"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--bd)",
        borderRadius: "4px 16px 16px 16px",
        padding: "14px 18px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 6, height: 6, background: "var(--bd-hover)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  </div>
);

const copy = {
  ru: {
    noAssistantBanner: "Нет активного ассистента: создайте и включите ассистента в админке.",
    noAssistantSend: "Создайте активного ассистента в админке, чтобы отправлять сообщения.",
    defaultWelcome: "Здравствуйте! Чем могу помочь?",
    defaultHeader: "neeklo AI",
    defaultStatus: "онлайн",
    defaultPlaceholder: "Напишите сообщение…",
  },
  en: {
    noAssistantBanner: "No active assistant: create and enable one in admin.",
    noAssistantSend: "Enable an active assistant in admin to send messages.",
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [crmChatId, setCrmChatId] = useState<string | null>(null);
  const [crmSessionReady, setCrmSessionReady] = useState(false);
  const prototypePollRef = useRef<number | null>(null);
  const transcriptPollRef = useRef<number | null>(null);
  const transcriptSigRef = useRef("");
  const pendingBriefRef = useRef<string | null>(null);
  const msgIdRef = useRef(0);
  const nextId = () => {
    msgIdRef.current += 1;
    return msgIdRef.current;
  };
  const hasAssistant = boot.data?.hasAssistant === true;

  const headerTitle = boot.data?.headerTitle?.trim() || c.defaultHeader;
  const statusLabel = boot.data?.statusLabel?.trim() || c.defaultStatus;
  const inputPlaceholder = boot.data?.inputPlaceholder?.trim() || c.defaultPlaceholder;
  const welcomeText =
    boot.data?.welcomeMessage?.trim() || c.defaultWelcome;

  useEffect(() => {
    msgIdRef.current = 0;
    setMessages([]);
    setCrmChatId(null);
    setCrmSessionReady(false);
  }, [locale]);

  // Read wizard brief from sessionStorage on first mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("neeklo_wizard_brief");
      if (raw) {
        const d = JSON.parse(raw) as { serviceId?: string; budget?: string; name?: string; contact?: string };
        sessionStorage.removeItem("neeklo_wizard_brief");
        const parts: string[] = [];
        if (d.name) parts.push(`Меня зовут ${d.name}.`);
        if (d.serviceId) parts.push(`Интересует: ${d.serviceId}.`);
        if (d.budget) parts.push(`Бюджет: ${d.budget}.`);
        if (d.contact) parts.push(`Контакт: ${d.contact}.`);
        if (parts.length) pendingBriefRef.current = parts.join(" ");
      }
    } catch { /* ignore storage parse errors */ }
  }, []);

  /** Сессия CRM хранится на сервере (cookie + БД), без localStorage */
  useEffect(() => {
    if (!boot.data) return;
    let cancelled = false;
    const w = welcomeText;
    (async () => {
      try {
        const r = await createCrmChatSession();
        if (cancelled) return;
        const current = await fetchCurrentChatTranscript();
        if (cancelled) return;
        setCrmChatId(current?.id || r.chatId);
        const rows = Array.isArray(current?.messages) ? current.messages : [];
        if (rows.length > 0) {
          const sig = rows.map((m) => `${m.role}|${m.at || ""}|${m.content || ""}`).join("||");
          transcriptSigRef.current = sig;
          const { msgs, maxId } = mapTranscriptToUiMessages(rows);
          msgIdRef.current = Math.max(msgIdRef.current, maxId);
          setMessages(msgs);
        } else if (w) {
          msgIdRef.current = 0;
          transcriptSigRef.current = "";
          setMessages([{ id: nextId(), role: "ai", text: w, timestamp: new Date() }]);
        }
      } catch {
        if (!cancelled && w) {
          msgIdRef.current = 0;
          transcriptSigRef.current = "";
          setMessages([{ id: nextId(), role: "ai", text: w, timestamp: new Date() }]);
        }
      } finally {
        if (!cancelled) setCrmSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boot.data, welcomeText, locale]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stopPrototypePolling = useCallback(() => {
    if (prototypePollRef.current != null) {
      window.clearInterval(prototypePollRef.current);
      prototypePollRef.current = null;
    }
  }, []);

  const stopTranscriptPolling = useCallback(() => {
    if (transcriptPollRef.current != null) {
      window.clearInterval(transcriptPollRef.current);
      transcriptPollRef.current = null;
    }
  }, []);

  const startPrototypePolling = useCallback((jobId: string) => {
    stopPrototypePolling();
    let lastStatus = "";
    prototypePollRef.current = window.setInterval(async () => {
      try {
        const s = await getPrototypeJobStatus(jobId);
        if (s.status !== lastStatus) {
          lastStatus = s.status;
          const stepText =
            s.status === "queued"
              ? "Заявка на прототип принята, ставлю в очередь..."
              : s.status === "analyzing"
                ? "Анализирую вашу задачу и структуру будущего лендинга..."
                : s.status === "generating_copy"
                  ? "Генерирую тексты и оффер для блоков лендинга..."
                  : s.status === "assembling_layout"
                    ? "Собираю структуру страницы и наполнение блоков..."
                    : s.status === "publishing"
                      ? "Публикую прототип, еще немного..."
                      : "";
          if (stepText) {
            setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: stepText, timestamp: new Date() }]);
          }
        }
        if (s.status === "done") {
          stopPrototypePolling();
          const url = s.result_url || "";
          const finalMsg = url
            ? `Готово! Прототип собран. Ссылка для просмотра: ${url}`
            : "Готово! Прототип собран, но ссылка пока не получена.";
          setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: finalMsg, timestamp: new Date() }]);
          return;
        }
        if (s.status === "failed") {
          stopPrototypePolling();
          const finalMsg = s.error
            ? `Не удалось собрать прототип: ${s.error}`
            : "Не удалось собрать прототип. Попробуйте уточнить задачу и повторить.";
          setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: finalMsg, timestamp: new Date() }]);
        }
      } catch {
        // silent polling retries; no UI spam
      }
    }, 2500);
  }, [stopPrototypePolling]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => () => stopPrototypePolling(), [stopPrototypePolling]);
  useEffect(() => () => stopTranscriptPolling(), [stopTranscriptPolling]);

  useEffect(() => {
    if (!crmSessionReady) return;
    stopTranscriptPolling();
    const syncTranscript = async () => {
      try {
        const tr = await fetchCurrentChatTranscript();
        const rows = Array.isArray(tr?.messages) ? tr.messages : [];
        if (!rows.length) return;
        if (tr?.id && tr.id !== crmChatId) setCrmChatId(tr.id);
        const sig = rows.map((m) => `${m.role}|${m.at || ""}|${m.content || ""}`).join("||");
        if (sig === transcriptSigRef.current) return;
        transcriptSigRef.current = sig;
        const { msgs, maxId } = mapTranscriptToUiMessages(rows);
        msgIdRef.current = Math.max(msgIdRef.current, maxId);
        setMessages(msgs);
        setIsTyping(false);
      } catch {
        // keep silent; next poll retry
      }
    };
    syncTranscript();
    transcriptPollRef.current = window.setInterval(syncTranscript, 2000);
    return () => stopTranscriptPolling();
  }, [crmSessionReady, crmChatId, stopTranscriptPolling]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, isTyping]);

  const hasText = inputValue.trim().length > 0;

  const sendMessage = useCallback(() => {
    if (!hasText || !crmSessionReady) return;
    if (!hasAssistant) {
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
      chatComplete({ messages: apiMsgs, chatId: crmChatId ?? undefined })
        .then((r) => {
          setIsTyping(false);
          if (r.chat_id && !crmChatId) {
            setCrmChatId(r.chat_id);
          }
          // Transcript polling is the single source of truth for AI/operator messages.
          if (!r.chat_id && !crmChatId) {
            setMessages((p) => [...p, { id: nextId(), role: "ai", text: r.reply, timestamp: new Date() }]);
          }
          if (r.prototype_job?.id) {
            startPrototypePolling(r.prototype_job.id);
          }
        })
        .catch((err: unknown) => {
          setIsTyping(false);
          const detail = err instanceof Error ? err.message : String(err);
          setMessages((p) => [...p, { id: nextId(), role: "ai", text: detail, timestamp: new Date() }]);
        });
      return combined;
    });
  }, [hasText, inputValue, hasAssistant, crmChatId, crmSessionReady, c.noAssistantSend, startPrototypePolling]);

  const sendDirectMessage = useCallback((text: string) => {
    if (!crmSessionReady || !hasAssistant || !text.trim()) return;
    setMessages((prev) => {
      const userMsg = { id: nextId(), role: "user" as const, text: text.trim(), timestamp: new Date() };
      const combined = [...prev, userMsg];
      const apiMsgs = combined.map((m) => ({
        role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));
      setIsTyping(true);
      chatComplete({ messages: apiMsgs, chatId: crmChatId ?? undefined })
        .then((r) => {
          setIsTyping(false);
          if (r.chat_id && !crmChatId) setCrmChatId(r.chat_id);
          if (!r.chat_id && !crmChatId) {
            setMessages((p) => [...p, { id: nextId(), role: "ai", text: r.reply, timestamp: new Date() }]);
          }
          if (r.prototype_job?.id) startPrototypePolling(r.prototype_job.id);
        })
        .catch((err: unknown) => {
          setIsTyping(false);
          const detail = err instanceof Error ? err.message : String(err);
          setMessages((p) => [...p, { id: nextId(), role: "ai", text: detail, timestamp: new Date() }]);
        });
      return combined;
    });
  }, [crmSessionReady, hasAssistant, crmChatId, startPrototypePolling]);

  // Auto-send wizard brief once chat session is ready
  useEffect(() => {
    if (crmSessionReady && pendingBriefRef.current) {
      const text = pendingBriefRef.current;
      pendingBriefRef.current = null;
      sendDirectMessage(text);
    }
  }, [crmSessionReady, sendDirectMessage]);

  if (boot.isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" style={{ background: "var(--bg)" }} aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "var(--bd)", borderTopColor: "var(--tx)" }} />
      </div>
    );
  }

  if (boot.isError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "var(--bg)" }}>
        <p className="font-body text-destructive break-words max-w-md">
          {(boot.error as Error).message}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl px-6 py-3 font-body text-sm font-semibold btn-primary"
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
        background: "var(--bg)",
        position: "fixed",
        inset: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: 64,
          flexShrink: 0,
          borderBottom: "1px solid var(--bd)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          background: "var(--surface)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "var(--surface-2)", border: "1px solid var(--bd)", cursor: "pointer", color: "var(--tx)" }}
        >
          <ArrowLeft size={18} />
        </button>
        <AIAvatar size={36} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="font-body" style={{ fontSize: 15, fontWeight: 600, color: "var(--tx)", lineHeight: 1, marginBottom: 3 }}>
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
              {hasAssistant ? statusLabel : locale === "en" ? "no assistant" : "нет ассистента"}
            </span>
          </div>
        </div>
      </div>

      {!hasAssistant ? (
        <div
          className="font-body shrink-0 px-4 py-2.5 text-center text-[13px]"
          style={{ background: "rgba(138,106,42,0.12)", color: "var(--warning)", borderBottom: "1px solid var(--bd)" }}
        >
          {c.noAssistantBanner}
        </div>
      ) : null}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          background: "var(--bg)",
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
                    background: "var(--surface)",
                    border: "1px solid var(--bd)",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "12px 16px",
                    fontSize: 15,
                    maxWidth: "78%",
                    lineHeight: 1.55,
                    color: "var(--tx)",
                  }}
                >
                  {renderTextWithLinks(msg.text)}
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
                    background: "var(--tx)",
                    color: "var(--bg)",
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
          background: "var(--surface)",
          borderTop: "1px solid var(--bd)",
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
              background: "var(--surface-2)",
              border: "1px solid var(--bd)",
              borderRadius: 14,
              fontSize: 15,
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
              color: "var(--tx)",
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
