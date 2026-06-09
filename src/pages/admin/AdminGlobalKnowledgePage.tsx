import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Plus, Database, ShoppingBag, MessageSquare, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface KbChunk {
  id: string;
  text: string;
  source: string;
  filename: string;
  extra?: {
    title?: string;
    price?: number;
    status?: string;
    url?: string;
  };
}

interface KbResponse {
  chunks: KbChunk[];
  total: number;
  collection: string;
  counts: Record<string, number>;
}

const TABS = [
  { key: "global", label: "Загруженные документы", icon: Database, color: "text-blue-600" },
  { key: "avito_items", label: "Объявления Авито", icon: ShoppingBag, color: "text-orange-600" },
  { key: "pricing", label: "Прайс услуг", icon: DollarSign, color: "text-green-600" },
  { key: "insights", label: "Инсайты общения", icon: MessageSquare, color: "text-purple-600" },
] as const;

export default function AdminGlobalKnowledgePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("global");
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textSource, setTextSource] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const { data, isLoading } = useQuery<KbResponse>({
    queryKey: ["global-kb-chunks", activeTab, offset],
    queryFn: () =>
      adminApi
        .get(`/admin/knowledge/chunks?limit=${LIMIT}&offset=${offset}&collection=${activeTab}`)
        .then((r) => r.data),
  });

  const chunks = data?.chunks || [];
  const counts = data?.counts || {};

  const syncMut = useMutation({
    mutationFn: () => adminApi.post("/admin/knowledge/sync-avito-items", {}).then((r) => r.data),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["global-kb-chunks"] });
      toast.success(`Синхронизировано: ${r.synced} объявлений`);
    },
    onError: () => toast.error("Ошибка синхронизации"),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return adminApi.post("/admin/knowledge/upload", fd).then((r) => r.data);
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["global-kb-chunks"] });
      toast.success(`Загружено: ${r.chunks} чанков из "${r.filename}"`);
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Ошибка загрузки";
      toast.error(msg);
    },
  });

  const addTextMut = useMutation({
    mutationFn: () =>
      adminApi.post("/admin/knowledge/text", { text: textInput, source: textSource || "manual" }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["global-kb-chunks"] });
      toast.success(`Добавлено: ${r.data?.data?.chunks || "?"} чанков`);
      setTextInput("");
      setTextSource("");
      setTextMode(false);
    },
    onError: () => toast.error("Ошибка добавления текста"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/knowledge/chunks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global-kb-chunks"] });
      toast.success("Чанк удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMut.mutate(file);
    e.target.value = "";
  }

  const filtered = search
    ? chunks.filter(
        (c) =>
          c.text.toLowerCase().includes(search.toLowerCase()) ||
          c.source.toLowerCase().includes(search.toLowerCase())
      )
    : chunks;

  const isGlobalTab = activeTab === "global";
  const isAvitoTab = activeTab === "avito_items";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">База знаний</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Документы, объявления и инсайты — всё что агент знает о бизнесе
          </p>
        </div>
        <div className="flex gap-2">
          {isGlobalTab && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button size="sm" variant="ghost" onClick={() => setTextMode(true)} disabled={textMode}>
                <Plus size={13} className="mr-1" />Добавить текст
              </Button>
              <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}>
                <Upload size={13} className="mr-1" />
                {uploadMut.isPending ? "Загружаем..." : "Загрузить файл"}
              </Button>
            </>
          )}
          {isAvitoTab && (
            <Button size="sm" onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
              <RefreshCw size={13} className={`mr-1 ${syncMut.isPending ? "animate-spin" : ""}`} />
              {syncMut.isPending ? "Синхронизация..." : "Синхронизировать"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100 rounded-lg w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setOffset(0);
                setSearch("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={13} className={activeTab === tab.key ? tab.color : ""} />
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.key ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Format hint for global tab */}
      {isGlobalTab && (
        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          Поддерживаемые форматы: <strong>PDF, DOCX, TXT, MD, CSV</strong>. Файл автоматически разбивается на чанки и загружается в Qdrant (коллекция <code>neeklo_global</code>).
        </div>
      )}

      {/* Avito hint */}
      {isAvitoTab && (
        <div className="mb-5 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
          Объявления автоматически синхронизируются из Авито. Агент использует эту информацию при ответах клиентам. Нажмите «Синхронизировать» для обновления.
        </div>
      )}

      {/* Add text form */}
      {textMode && isGlobalTab && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Добавить текст вручную</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Источник / название</label>
            <Input
              value={textSource}
              onChange={(e) => setTextSource(e.target.value)}
              placeholder="Например: Условия работы, FAQ, Описание услуг"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Текст *</label>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              placeholder="Вставьте текст, который агент должен знать..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => addTextMut.mutate()}
              disabled={!textInput.trim() || addTextMut.isPending}
            >
              {addTextMut.isPending ? "Добавляем..." : "Добавить в базу знаний"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTextMode(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {chunks.length > 0 && (
        <div className="mb-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            placeholder="Поиск по записям..."
            className="max-w-sm"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Загрузка...</div>
      ) : chunks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Database size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">
            {isGlobalTab ? "База знаний пуста" : isAvitoTab ? "Объявления не синхронизированы" : "Нет данных"}
          </p>
          <p className="text-sm mt-1">
            {isGlobalTab
              ? "Загрузите файл или добавьте текст чтобы начать"
              : isAvitoTab
              ? "Нажмите «Синхронизировать» чтобы загрузить объявления"
              : "Данные появятся автоматически по мере работы агента"}
          </p>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 mb-3">
            Показано {filtered.length} из {chunks.length} записей
          </div>
          <div className="space-y-2">
            {filtered.map((chunk) => (
              <div key={chunk.id} className="bg-white rounded-lg border border-gray-200 p-4 group">
                <div className="flex items-start gap-3">
                  <FileText size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {chunk.extra?.title && (
                        <span className="text-xs font-medium text-gray-800">{chunk.extra.title}</span>
                      )}
                      {chunk.extra?.price && (
                        <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          {chunk.extra.price.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      {chunk.extra?.status && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            chunk.extra.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {chunk.extra.status}
                        </span>
                      )}
                      {!chunk.extra?.title && (
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {chunk.source || "manual"}
                        </span>
                      )}
                      {chunk.filename && !chunk.extra?.title && (
                        <span className="text-[10px] text-gray-400">{chunk.filename}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-4 leading-relaxed">{chunk.text}</p>
                  </div>
                  {isGlobalTab && (
                    <button
                      onClick={() => {
                        if (confirm("Удалить чанк?")) deleteMut.mutate(String(chunk.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
            >
              ← Назад
            </Button>
            <span className="text-xs text-gray-400">Страница {Math.floor(offset / LIMIT) + 1}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOffset(offset + LIMIT)}
              disabled={chunks.length < LIMIT}
            >
              Вперёд →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
