import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Send, Trash2, ChevronDown, ChevronRight, Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

export default function AdminTestChatPage() {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("auto");
  const [showDebug, setShowDebug] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
  }, [messages]);

  function handleSend() {
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
  }

  function clearChat() {
    setMessages([]);
    setShowDebug(null);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] bg-[#F5F5F3]">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Тест-чат агента</h1>
          <p className="text-xs text-gray-500">Проверка AI-агента с RAG контекстом из базы знаний</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Модель:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-8 px-2 border border-gray-200 rounded text-sm bg-white"
            >
              <option value="auto">auto</option>
              <option value="aura">aura</option>
              <option value="neeklo">neeklo</option>
            </select>
          </div>
          <Button size="sm" variant="ghost" onClick={clearChat} disabled={messages.length === 0}>
            <Trash2 size={13} className="mr-1" />Очистить чат
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? "Скрыть историю" : "История тестов"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && !sendMut.isPending && (
              <div className="text-center py-16">
                <Bot size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400 font-medium">Чат готов к тестированию</p>
                <p className="text-xs text-gray-400 mt-1">Агент использует глобальную базу знаний, прайс и объявления Avito</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gray-900 text-white rounded-br-sm"
                          : msg.error
                          ? "bg-red-50 border border-red-200 text-red-700 rounded-bl-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.error && !msg.content && (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={13} />
                          <span>{msg.error}</span>
                        </div>
                      )}
                      {msg.content || (msg.error && msg.content ? msg.content : "")}
                    </div>

                    {/* Debug toggle for assistant messages */}
                    {msg.role === "assistant" && msg.chunks && msg.chunks.length > 0 && (
                      <button
                        onClick={() => setShowDebug(showDebug === idx ? null : idx)}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showDebug === idx ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        {msg.chunks.length} RAG чанк{msg.chunks.length === 1 ? "" : "а"}
                      </button>
                    )}

                    {/* Debug panel */}
                    {showDebug === idx && msg.chunks && (
                      <div className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] space-y-2">
                        <p className="font-semibold text-gray-600 mb-2">RAG контекст (использован в запросе)</p>
                        {msg.chunks.map((chunk, ci) => (
                          <div key={ci} className="p-2 bg-white rounded border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-gray-400">{chunk.collection}</span>
                              <span className="text-gray-300">·</span>
                              <span className="font-medium text-green-600">score: {chunk.score?.toFixed(3)}</span>
                              {chunk.source && <span className="text-gray-400">· {chunk.source}</span>}
                            </div>
                            <p className="text-gray-600 line-clamp-3">{chunk.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} className="text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sendMut.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="resize-none flex-1"
                placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — перенос строки)"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMut.isPending}
                className="h-[52px] px-4"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* History panel */}
        {showHistory && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">История тестов</span>
              <button
                onClick={() => { if (confirm("Очистить историю?")) clearHistoryMut.mutate(); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Очистить
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">История пуста</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {[...history].reverse().map((entry, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="text-[10px] text-gray-400 mb-1 flex justify-between">
                        <span>{new Date(entry.at).toLocaleString("ru-RU")}</span>
                        <span className="font-mono">{entry.model}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium truncate">{entry.userMessage}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{entry.reply || "—"}</p>
                      <span className="text-[10px] text-gray-300">{entry.chunksCount} чанков</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
