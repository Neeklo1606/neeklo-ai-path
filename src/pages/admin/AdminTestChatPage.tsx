import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import {
  Send, Trash2, Bot, User, AlertCircle, Sparkles,
  ChevronDown, Database, Clock, X, RotateCcw,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at?: string;
  chunks?: RagChunk[];
  ragContext?: string;
  error?: string;
}

interface RagChunk {
  text: string;
  score: number;
  collection: string;
  source?: string;
}

interface HistoryEntry {
  at: string;
  userMessage: string;
  reply: string | null;
  model: string;
  chunksCount: number;
}

const MODEL_OPTIONS = [
  { value: "auto", label: "Auto", color: "bg-violet-100 text-violet-700" },
  { value: "aura", label: "Aura", color: "bg-blue-100 text-blue-700" },
  { value: "neeklo", label: "Neeklo", color: "bg-emerald-100 text-emerald-700" },
];

const COLLECTION_COLORS: Record<string, string> = {
  neeklo_global: "bg-purple-50 text-purple-700 border-purple-200",
  neeklo_pricing: "bg-green-50 text-green-700 border-green-200",
  neeklo_avito_items: "bg-orange-50 text-orange-700 border-orange-200",
  neeklo_avito_ins: "bg-blue-50 text-blue-700 border-blue-200",
};

function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function AdminTestChatPage() {
  usePageTitle("Тест-чат — AI агент");
  const qc = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("auto");
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: history = [] } = useQuery<HistoryEntry[]>({
    queryKey: ["test-chat-history"],
    queryFn: () => adminApi.get("/admin/test-chat/history").then((r) => r.data),
    enabled: showHistory,
  });

  const sendMut = useMutation({
    mutationFn: (payload: { message: string; history: { role: string; content: string }[]; model: string }) =>
      adminApi.post("/admin/test-chat/message", payload).then((r) => r.data),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "",
          at: new Date().toISOString(),
          chunks: data.chunks || [],
          ragContext: data.ragContext || "",
          error: data.error,
        },
      ]);
      qc.invalidateQueries({ queryKey: ["test-chat-history"] });
    },
    onError: () => toast.error("Ошибка отправки"),
  });

  const clearHistoryMut = useMutation({
    mutationFn: () => adminApi.delete("/admin/test-chat/history"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-chat-history"] });
      toast.success("История очищена");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMut.isPending]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || sendMut.isPending) return;

    const userMsg: ChatMessage = { role: "user", content: text, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const historyForApi = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    sendMut.mutate({ message: text, history: historyForApi.slice(-20), model });
  }, [input, messages, model, sendMut]);

  function clearChat() {
    setMessages([]);
    setExpandedChunks(new Set());
  }

  function toggleChunks(idx: number) {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const selectedModel = MODEL_OPTIONS.find((m) => m.value === model) ?? MODEL_OPTIONS[0];

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#F2F0EB] overflow-hidden">
      {/* Main chat column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-[#E8E6E0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#0D0D0B] leading-tight">AI Агент — тест-чат</h1>
              <p className="text-[11px] text-[#8A867D]">RAG · база знаний · прайс · объявления</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="flex gap-1 p-1 bg-[#F5F3EE] rounded-xl border border-[#E8E6E0]">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setModel(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    model === opt.value
                      ? "bg-white shadow-sm text-[#0D0D0B]"
                      : "text-[#6A6860] hover:text-[#0D0D0B]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                showHistory
                  ? "bg-[#0D0D0B] text-white border-[#0D0D0B]"
                  : "bg-white text-[#6A6860] border-[#E8E6E0] hover:border-[#0D0D0B] hover:text-[#0D0D0B]"
              }`}
            >
              <Clock size={12} />
              История
            </button>

            <button
              onClick={clearChat}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E6E0] bg-white text-[#6A6860] hover:text-red-600 hover:border-red-200 disabled:opacity-40 transition-all"
            >
              <Trash2 size={12} />
              Очистить
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {messages.length === 0 && !sendMut.isPending && (
            <div className="flex flex-col items-center justify-center py-20 select-none">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400/20 to-blue-400/20 flex items-center justify-center mb-4 border border-violet-100">
                <Bot size={28} className="text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-[#3C3A34]">Чат готов к тестированию</p>
              <p className="text-xs text-[#8A867D] mt-1 text-center max-w-xs">
                Напишите любой запрос. Агент ответит с учётом базы знаний, прайса и объявлений Avito.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {["нужен мультик", "создание сайта под ключ", "цена на телеграм бот", "хочу AI агента"].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="px-3 py-1.5 rounded-full border border-[#DDD] bg-white text-xs text-[#3C3A34] hover:border-violet-300 hover:text-violet-700 transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot size={13} className="text-white" />
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[72%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#0D0D0B] text-white rounded-tr-sm"
                      : msg.error && !msg.content
                      ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-sm"
                      : "bg-white border border-[#E8E6E0] text-[#1C1B1A] rounded-tl-sm"
                  }`}
                >
                  {msg.error && !msg.content ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{msg.error}</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Time + RAG toggle */}
                <div className="flex items-center gap-2 px-1">
                  {msg.at && (
                    <span className="text-[10px] text-[#B5B0A7]">{formatTime(msg.at)}</span>
                  )}
                  {msg.role === "assistant" && msg.chunks && msg.chunks.length > 0 && (
                    <button
                      onClick={() => toggleChunks(idx)}
                      className="flex items-center gap-1 text-[10px] text-[#8A867D] hover:text-violet-600 transition-colors"
                    >
                      <Database size={9} />
                      {msg.chunks.length} чанк{msg.chunks.length === 1 ? "" : "а"}
                      <ChevronDown
                        size={9}
                        className={`transition-transform ${expandedChunks.has(idx) ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {/* RAG debug panel */}
                {expandedChunks.has(idx) && msg.chunks && msg.chunks.length > 0 && (
                  <div className="w-full max-w-sm bg-white border border-[#E8E6E0] rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-[#3C3A34]">RAG контекст</span>
                      <button onClick={() => toggleChunks(idx)} className="text-[#B5B0A7] hover:text-[#0D0D0B]">
                        <X size={11} />
                      </button>
                    </div>
                    {msg.chunks.map((chunk, ci) => {
                      const collClass = COLLECTION_COLORS[chunk.collection] || "bg-gray-50 text-gray-600 border-gray-200";
                      return (
                        <div key={ci} className="rounded-lg border bg-[#FAFAF8] p-2.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${collClass}`}>
                              {chunk.collection.replace("neeklo_", "")}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                              {(chunk.score * 100).toFixed(0)}%
                            </span>
                            {chunk.source && (
                              <span className="text-[10px] text-[#8A867D]">{chunk.source}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#3C3A34] leading-relaxed line-clamp-4">
                            {chunk.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-[#E8E6E0] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={13} className="text-[#6A6860]" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {sendMut.isPending && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-white" />
              </div>
              <div className="px-4 py-3 bg-white border border-[#E8E6E0] rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#B5B0A7] animate-bounce"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-[#E8E6E0]">
          <div className="flex items-end gap-2 bg-[#F5F3EE] rounded-2xl border border-[#E0DDD6] px-4 py-2.5 focus-within:border-[#0D0D0B] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              style={{ resize: "none", maxHeight: 120, minHeight: 24 }}
              className="flex-1 bg-transparent text-sm text-[#0D0D0B] placeholder:text-[#B5B0A7] outline-none leading-relaxed overflow-auto"
              placeholder="Напишите сообщение… (Enter — отправить)"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMut.isPending}
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !sendMut.isPending
                  ? "bg-[#0D0D0B] text-white hover:bg-[#222]"
                  : "bg-[#DDD] text-[#999] cursor-not-allowed"
              }`}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-[#C5C0B8] mt-1.5 text-center">
            Модель: <span className={`font-medium px-1 rounded ${selectedModel.color}`}>{selectedModel.label}</span>
            {" · "}Shift+Enter — новая строка
          </p>
        </div>
      </div>

      {/* History sidebar */}
      {showHistory && (
        <div className="w-72 flex-shrink-0 border-l border-[#E8E6E0] bg-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E6E0]">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[#6A6860]" />
              <span className="text-sm font-semibold text-[#0D0D0B]">История тестов</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (window.confirm("Очистить историю?")) clearHistoryMut.mutate(); }}
                className="text-[11px] text-[#8A867D] hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={10} />
                Сбросить
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[#B5B0A7] hover:text-[#0D0D0B] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Clock size={24} className="text-[#D5D0C8] mb-2" />
                <p className="text-xs text-[#8A867D]">История пуста</p>
                <p className="text-[11px] text-[#B5B0A7] mt-1">Тесты появятся здесь</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EDE8]">
                {[...history].reverse().map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(entry.userMessage)}
                    className="w-full text-left px-4 py-3 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#8A867D]">
                        {new Date(entry.at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${MODEL_OPTIONS.find(m => m.value === entry.model)?.color || "bg-gray-100 text-gray-600"}`}>
                        {entry.model}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#0D0D0B] truncate">{entry.userMessage}</p>
                    {entry.reply && (
                      <p className="text-[11px] text-[#6A6860] truncate mt-0.5">{entry.reply}</p>
                    )}
                    {entry.chunksCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Database size={9} className="text-violet-400" />
                        <span className="text-[10px] text-[#8A867D]">{entry.chunksCount} чанков</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
