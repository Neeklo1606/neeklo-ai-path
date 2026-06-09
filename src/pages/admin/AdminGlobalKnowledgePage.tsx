import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface KbChunk {
  id: string;
  text: string;
  source: string;
  filename: string;
}

export default function AdminGlobalKnowledgePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textSource, setTextSource] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const { data, isLoading } = useQuery<{ chunks: KbChunk[]; total: number }>({
    queryKey: ["global-kb-chunks", offset],
    queryFn: () => adminApi.get(`/admin/knowledge/chunks?limit=${LIMIT}&offset=${offset}`).then((r) => r.data),
  });
  const chunks = data?.chunks || [];

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
    mutationFn: () => adminApi.post("/admin/knowledge/text", { text: textInput, source: textSource || "manual" }),
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
    ? chunks.filter((c) => c.text.toLowerCase().includes(search.toLowerCase()) || c.source.toLowerCase().includes(search.toLowerCase()))
    : chunks;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Глобальная база знаний</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Документы и тексты, которые агент использует при ответах клиентам Avito
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setTextMode(true); }}
            disabled={textMode}
          >
            <Plus size={13} className="mr-1" />Добавить текст
          </Button>
          <Button
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMut.isPending}
          >
            <Upload size={13} className="mr-1" />
            {uploadMut.isPending ? "Загружаем..." : "Загрузить файл"}
          </Button>
        </div>
      </div>

      {/* Supported formats note */}
      <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        Поддерживаемые форматы: <strong>PDF, DOCX, TXT, MD, CSV</strong>. Файл автоматически разбивается на чанки и загружается в Qdrant (коллекция <code>neeklo_global</code>).
      </div>

      {/* Add text form */}
      {textMode && (
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
            <Button size="sm" onClick={() => addTextMut.mutate()} disabled={!textInput.trim() || addTextMut.isPending}>
              {addTextMut.isPending ? "Добавляем..." : "Добавить в базу знаний"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTextMode(false)}>Отмена</Button>
          </div>
        </div>
      )}

      {/* Search */}
      {chunks.length > 0 && (
        <div className="mb-4">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            placeholder="Поиск по чанкам..."
            className="max-w-sm"
          />
        </div>
      )}

      {/* Chunks list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Загрузка...</div>
      ) : chunks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Database size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">База знаний пуста</p>
          <p className="text-sm mt-1">Загрузите файл или добавьте текст чтобы начать</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 mb-3">
            Показано {filtered.length} из {chunks.length} чанков
          </div>
          <div className="space-y-2">
            {filtered.map((chunk) => (
              <div key={chunk.id} className="bg-white rounded-lg border border-gray-200 p-4 group">
                <div className="flex items-start gap-3">
                  <FileText size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {chunk.source || "manual"}
                      </span>
                      {chunk.filename && (
                        <span className="text-[10px] text-gray-400">{chunk.filename}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-4 leading-relaxed">{chunk.text}</p>
                  </div>
                  <button
                    onClick={() => { if (confirm("Удалить чанк?")) deleteMut.mutate(String(chunk.id)); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button size="sm" variant="ghost" onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>
              ← Назад
            </Button>
            <span className="text-xs text-gray-400">Страница {Math.floor(offset / LIMIT) + 1}</span>
            <Button size="sm" variant="ghost" onClick={() => setOffset(offset + LIMIT)} disabled={chunks.length < LIMIT}>
              Вперёд →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
