import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import { buildKnowledgeGraph } from "@/lib/knowledge-graph";
import {
  askKnowledgeHelper,
  askKnowledgeCoach,
  clearKnowledge,
  fetchOpenAiModels,
  getKnowledgeStats,
  ingestKnowledgeFile,
  ingestKnowledgeText,
  listKnowledgeChunks,
  type KnowledgeStats,
} from "@/services/ai.service";

type AssistantRow = CmsAssistant & { provider_api_key?: string | null };
const OPENAI_MODEL_PRESETS = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "o4-mini"];

type ChunkItem = { id: string; text: string; source: string };

function GraphPreview({
  points,
  seed,
  chunks,
  selectedChunkId,
  onSelectChunk,
  assistantName,
  collectionName,
  embedModelName,
}: {
  points: number;
  seed: string;
  chunks: ChunkItem[];
  selectedChunkId: string;
  onSelectChunk: (id: string) => void;
  assistantName: string;
  collectionName: string;
  embedModelName: string;
}) {
  const graph = useMemo(() => buildKnowledgeGraph(points, seed), [points, seed]);
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const selectedChunk = useMemo(() => chunks.find((c) => c.id === selectedChunkId) || null, [chunks, selectedChunkId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const next = ev.deltaY < 0 ? zoom + 0.1 : zoom - 0.1;
      setZoom(Math.max(0.6, Math.min(2.4, Number(next.toFixed(2)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [zoom]);

  const GraphCanvas = (
    <div className="rounded-2xl border border-[#E8E6E0] bg-[#0E1016] p-4 text-white">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Граф знаний (как в Obsidian)</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-white/70">Узлы: {graph.nodes.length - 1}</p>
          <Button
            type="button"
            variant="outline"
            className="h-7 rounded-md border-white/25 bg-transparent px-2 text-xs text-white hover:bg-white/10"
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? "Свернуть" : "На весь экран"}
          </Button>
        </div>
      </div>
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0C12]"
        onMouseDown={(e) => {
          setDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        }}
        onMouseMove={(e) => {
          if (!dragging || !dragStart.current) return;
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
          setPan({
            x: dragStart.current.panX + dx / 2.5,
            y: dragStart.current.panY + dy / 2.5,
          });
        }}
        onMouseUp={() => {
          setDragging(false);
          dragStart.current = null;
        }}
        onMouseLeave={() => {
          setDragging(false);
          dragStart.current = null;
        }}
      >
        <svg viewBox="-100 -100 200 200" className="h-[280px] w-full cursor-grab active:cursor-grabbing">
          <g
            style={{
              transformOrigin: "50% 50%",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 120ms ease-out",
            }}
          >
            {graph.edges.map((e, idx) => {
              const a = byId[e.from];
              const b = byId[e.to];
              if (!a || !b) return null;
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(106, 120, 255, 0.45)"
                  strokeWidth={e.from === "core" ? 0.9 : 0.45}
                  style={{ animation: `kb-fade 2.8s ease-in-out ${idx * 40}ms infinite` }}
                />
              );
            })}
            {graph.nodes.map((n, idx) => (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={n.id === "core" ? 4.2 : n.size}
                fill={n.id === "core" ? "#f8f9ff" : "rgba(224,230,255,0.92)"}
                style={{
                  filter: n.id === "core" ? "drop-shadow(0 0 8px rgba(122,142,255,0.8))" : undefined,
                  animation: `kb-pulse 2.1s ease-in-out ${idx * 55}ms infinite`,
                  cursor: "pointer",
                  opacity: hoveredNode && hoveredNode !== n.id ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode("")}
                onClick={() => {
                  if (n.id === "core" || !chunks.length) return;
                  const idx = Number(n.id.replace("n", "")) || 0;
                  const ch = chunks[idx % chunks.length];
                  if (ch) onSelectChunk(ch.id);
                }}
                stroke={selectedChunkId && n.id !== "core" ? "rgba(148,163,255,0.45)" : "none"}
                strokeWidth={selectedChunkId ? 0.6 : 0}
              />
            ))}
          </g>
        </svg>
        {hoveredNode && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
            {graph.nodes.find((n) => n.id === hoveredNode)?.label || hoveredNode}
          </div>
        )}
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/85">
          Колесо: зум, мышь: перетаскивание
        </div>
      </div>
      <style>{`
        @keyframes kb-pulse { 0%,100% { opacity: .65; } 50% { opacity: 1; } }
        @keyframes kb-fade { 0%,100% { opacity: .2; } 50% { opacity: .8; } }
      `}</style>
    </div>
  );

  return (
    <>
      {GraphCanvas}
      {fullscreen && (
        <div className="fixed inset-0 z-[120] bg-black/70 p-4 md:p-6">
          <div className="mx-auto grid h-full max-w-[1480px] gap-4 rounded-2xl border border-[#2B2F3A] bg-[#0B0F16] p-4 md:grid-cols-[1fr_360px]">
            <div className="min-h-0">{GraphCanvas}</div>
            <aside className="min-h-0 overflow-auto rounded-2xl border border-[#2B2F3A] bg-[#111827] p-4 text-white">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Управление и информация</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 rounded-md border-white/25 bg-transparent px-2 text-xs text-white hover:bg-white/10"
                  onClick={() => setFullscreen(false)}
                >
                  Закрыть
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <p><span className="text-white/60">Ассистент:</span> {assistantName || "—"}</p>
                <p><span className="text-white/60">Коллекция:</span> {collectionName || "—"}</p>
                <p><span className="text-white/60">Точек:</span> {points}</p>
                <p><span className="text-white/60">Эмбеддинги:</span> {embedModelName || "—"}</p>
              </div>

              <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm font-medium">Масштаб и позиция</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="h-8 border-white/25 bg-transparent px-2 text-white hover:bg-white/10" onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.1).toFixed(2))))}>+</Button>
                  <Button type="button" variant="outline" className="h-8 border-white/25 bg-transparent px-2 text-white hover:bg-white/10" onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}>-</Button>
                  <Button type="button" variant="outline" className="h-8 border-white/25 bg-transparent px-2 text-white hover:bg-white/10" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</Button>
                </div>
                <p className="text-xs text-white/70">Zoom: {zoom.toFixed(2)}</p>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm font-medium">Выбранный chunk</p>
                {selectedChunk ? (
                  <>
                    <p className="mt-1 text-xs text-white/70">Источник: {selectedChunk.source}</p>
                    <div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-2 text-sm">
                      {selectedChunk.text || "(пустой)"}
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-white/70">Кликните по узлу графа.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminKnowledgePage() {
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [assistantId, setAssistantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);

  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [embedModel, setEmbedModel] = useState("text-embedding-3-small");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState("");
  const [openAiModels, setOpenAiModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [kbText, setKbText] = useState("");
  const [busy, setBusy] = useState(false);
  const [helperQuestion, setHelperQuestion] = useState("");
  const [helperAnswer, setHelperAnswer] = useState("");
  const [helperLoading, setHelperLoading] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [selectedChunkId, setSelectedChunkId] = useState("");
  const [coachAnswers, setCoachAnswers] = useState<Record<string, string>>({});
  const [coachQuestion, setCoachQuestion] = useState("Какая у вас ниша, основная услуга и целевая аудитория?");
  const [coachInput, setCoachInput] = useState("");
  const [coachDraft, setCoachDraft] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);
  const [wizardInput, setWizardInput] = useState("");
  const [wizardMessages, setWizardMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([]);

  const current = useMemo(() => assistants.find((a) => a.id === assistantId) || null, [assistants, assistantId]);
  const step1Done = Boolean(model && embedModel && (provider !== "openai" || providerApiKey.trim()));
  const step2Done = (stats?.points ?? 0) > 0;
  const completedSteps = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step2Done ? 1 : 0);

  const refreshStats = async (id: string) => {
    try {
      const data = await getKnowledgeStats(id);
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const refreshChunks = async (id: string) => {
    try {
      const out = await listKnowledgeChunks(id, 24);
      const list = Array.isArray(out?.chunks) ? out.chunks : [];
      setChunks(list);
      if (list.length && !selectedChunkId) setSelectedChunkId(list[0].id);
      if (!list.length) setSelectedChunkId("");
    } catch {
      setChunks([]);
      setSelectedChunkId("");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.get<AssistantRow[]>("/assistants");
        const list = Array.isArray(data) ? data : [];
        setAssistants(list);
        if (list.length) setAssistantId(list[0].id);
      } catch (e) {
        toast.error(axios.isAxiosError(e) ? e.message : "Не удалось загрузить ассистентов");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!assistantId) return;
    (async () => {
      try {
        const { data } = await adminApi.get<AssistantRow>(`/assistants/${assistantId}`);
        setProvider(data.provider || "openai");
        setModel(data.model || "gpt-4o-mini");
        setEmbedModel(data.embed_model || "text-embedding-3-small");
        setProviderApiKey(data.provider_api_key || "");
        setOpenaiBaseUrl(data.base_url || "");
        await refreshStats(assistantId);
        await refreshChunks(assistantId);
        const firstQuestion = "Опишите вашу нишу, продукт и целевую аудиторию одним сообщением.";
        setCoachAnswers({});
        setCoachDraft("");
        setCoachQuestion(firstQuestion);
        setWizardMessages([
          {
            role: "assistant",
            text: "Привет! Я мастер базы знаний. Отвечайте на мои вопросы, и я сам соберу готовый текст для базы.",
          },
          { role: "assistant", text: firstQuestion },
        ]);
      } catch (e) {
        toast.error(axios.isAxiosError(e) ? e.message : "Не удалось загрузить ассистента");
      }
    })();
  }, [assistantId]);

  const saveProviderConfig = async () => {
    if (!assistantId) return;
    setBusy(true);
    try {
      await adminApi.patch(`/assistants/${assistantId}`, {
        provider,
        model,
        embed_model: embedModel,
        provider_api_key: providerApiKey || null,
        base_url: provider === "openai" ? openaiBaseUrl || null : null,
      });
      toast.success("Настройки модели сохранены");
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const loadModels = async () => {
    if (!providerApiKey.trim()) return toast.error("Введите ключ провайдера");
    setLoadingModels(true);
    try {
      const out = await fetchOpenAiModels({
        apiKey: providerApiKey.trim(),
        baseUrl: openaiBaseUrl.trim() || undefined,
      });
      setOpenAiModels(out.models || []);
      if (out.models?.length) {
        setModel(out.models[0]);
        toast.success(`Найдено моделей: ${out.models.length}`);
      } else {
        toast.warning("Провайдер не вернул модели");
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setLoadingModels(false);
    }
  };

  const pushText = async () => {
    if (!assistantId || !kbText.trim()) return;
    setBusy(true);
    try {
      const out = await ingestKnowledgeText(assistantId, kbText);
      toast.success(`Добавлено фрагментов: ${out.upserted}`);
      setKbText("");
      await refreshStats(assistantId);
      await refreshChunks(assistantId);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!assistantId || !f) return;
    setBusy(true);
    try {
      const out = await ingestKnowledgeFile(assistantId, f);
      toast.success(`Файл: ${out.filename ?? f.name}, фрагментов: ${out.upserted}`);
      await refreshStats(assistantId);
      await refreshChunks(assistantId);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error || err.message
        : (err as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const importObsidianFiles = async (files: File[]) => {
    if (!assistantId || !files.length) return;
    const mdFiles = files.filter((f) => f.name.toLowerCase().endsWith(".md"));
    if (!mdFiles.length) {
      toast.error("Не найдено .md файлов. Выберите папку Obsidian vault или несколько .md файлов.");
      return;
    }
    setBusy(true);
    setImportProgress(`Старт импорта: ${mdFiles.length} файлов`);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < mdFiles.length; i += 1) {
      const file = mdFiles[i];
      setImportProgress(`Импорт ${i + 1}/${mdFiles.length}: ${file.name}`);
      try {
        await ingestKnowledgeFile(assistantId, file);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    await refreshStats(assistantId);
    await refreshChunks(assistantId);
    setBusy(false);
    setImportProgress(`Готово: успешно ${ok}, ошибок ${fail}`);
    if (!fail) toast.success(`Импортировано Obsidian файлов: ${ok}`);
    else toast.warning(`Импортировано: ${ok}, ошибок: ${fail}`);
  };

  const onObsidianFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    await importObsidianFiles(files);
  };

  const wipe = async () => {
    if (!assistantId) return;
    if (!confirm("Очистить всю базу знаний для выбранного ассистента?")) return;
    setBusy(true);
    try {
      await clearKnowledge(assistantId);
      toast.success("База знаний очищена");
      await refreshStats(assistantId);
      await refreshChunks(assistantId);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const askHelper = async (questionText?: string) => {
    const q = (questionText ?? helperQuestion).trim();
    if (!assistantId) return toast.error("Сначала выберите ассистента");
    if (!q) return toast.error("Введите вопрос для помощника");
    setHelperLoading(true);
    try {
      const out = await askKnowledgeHelper({
        assistantId,
        question: q,
        points: stats?.points ?? 0,
      });
      setHelperAnswer(out.answer || "Помощник не дал ответ.");
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setHelperLoading(false);
    }
  };

  const runCoach = async () => {
    if (!assistantId) return toast.error("Сначала выберите ассистента");
    setCoachLoading(true);
    try {
      const payload = { ...coachAnswers };
      if (coachQuestion.trim() && coachInput.trim()) payload[coachQuestion.trim()] = coachInput.trim();
      const out = await askKnowledgeCoach({
        assistantId,
        answers: payload,
      });
      setCoachAnswers(payload);
      setCoachQuestion(out.next_question || "");
      setCoachInput("");
      setCoachDraft(out.draft || "");
      if (out.is_ready && out.draft) {
        toast.success("Черновик базы знаний готов");
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setCoachLoading(false);
    }
  };

  const saveCoachDraftToKb = async () => {
    if (!assistantId || !coachDraft.trim()) return;
    setBusy(true);
    try {
      const out = await ingestKnowledgeText(assistantId, coachDraft);
      toast.success(`Черновик добавлен в KB, фрагментов: ${out.upserted}`);
      await refreshStats(assistantId);
      await refreshChunks(assistantId);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const submitWizardAnswer = async () => {
    const answer = wizardInput.trim();
    if (!assistantId) return toast.error("Сначала выберите ассистента");
    if (!answer) return;
    const questionKey = coachQuestion || `question_${Object.keys(coachAnswers).length + 1}`;
    const nextAnswers = { ...coachAnswers, [questionKey]: answer };
    setWizardMessages((prev) => [...prev, { role: "user", text: answer }]);
    setWizardInput("");
    setCoachLoading(true);
    try {
      const out = await askKnowledgeCoach({
        assistantId,
        answers: nextAnswers,
      });
      setCoachAnswers(nextAnswers);
      setCoachQuestion(out.next_question || "");
      setCoachDraft(out.draft || "");
      if (out.draft) {
        setWizardMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Черновик базы знаний готов. Проверьте и нажмите «Сформировать и загрузить базу знаний»." },
        ]);
      } else if (out.next_question) {
        setWizardMessages((prev) => [...prev, { role: "assistant", text: out.next_question }]);
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
      setWizardMessages((prev) => [...prev, { role: "assistant", text: `Ошибка: ${msg}` }]);
    } finally {
      setCoachLoading(false);
    }
  };

  const selectedChunk = useMemo(
    () => chunks.find((c) => c.id === selectedChunkId) || null,
    [chunks, selectedChunkId],
  );

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold">База знаний: мастер настройки</h1>

      <div className="rounded-2xl border border-[#E8E6E0] bg-[#FAFAF8] p-4 text-sm">
        <p className="font-bold">Пошагово</p>
        <p className="mt-1 text-xs text-muted-foreground">Прогресс: {completedSteps}/3 шага</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>Выберите ассистента и подключите модель OpenAI/Ollama. {step1Done ? "✅" : "⏳"}</li>
          <li>Загрузите заметки Obsidian или файлы. {step2Done ? "✅" : "⏳"}</li>
          <li>Проверьте граф связей и количество точек в базе. {step2Done ? "✅" : "⏳"}</li>
        </ol>
      </div>

      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-extrabold">Мастер-диалог: создание базы знаний</h2>
          <Button type="button" variant="outline" onClick={() => setShowManualFields((v) => !v)}>
            {showManualFields ? "Скрыть тех. поля" : "Показать тех. поля"}
          </Button>
        </div>
        <div className="max-h-[280px] space-y-2 overflow-auto rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3">
          {wizardMessages.map((m, idx) => (
            <div key={`${m.role}-${idx}`} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "assistant" ? "bg-white border border-[#E8E6E0] text-[#0D0D0B]" : "bg-[#0D0D0B] text-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <Label>Ваш ответ</Label>
          <textarea
            className="min-h-[86px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={wizardInput}
            onChange={(e) => setWizardInput(e.target.value)}
            placeholder="Ответьте на вопрос мастера..."
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitWizardAnswer} disabled={coachLoading}>
              {coachLoading ? "Обрабатываю..." : "Отправить ответ"}
            </Button>
            <Button type="button" variant="secondary" onClick={saveCoachDraftToKb} disabled={!coachDraft.trim() || busy}>
              Сформировать и загрузить базу знаний
            </Button>
          </div>
          {coachDraft && (
            <div className="rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3">
              <p className="text-xs font-semibold text-muted-foreground">Черновик для загрузки</p>
              <div className="mt-1 max-h-[120px] overflow-auto whitespace-pre-wrap text-sm">{coachDraft}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {showManualFields && <div className="grid gap-4 rounded-2xl border border-[#E8E6E0] bg-white p-6">
            <h2 className="font-heading text-lg font-extrabold">Шаг 1. Модель и доступ</h2>
            <div className="space-y-2">
              <Label>Ассистент</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
              >
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Провайдер</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI API (рекомендуется)</option>
                <option value="ollama">Ollama (локально)</option>
              </select>
            </div>
            {provider === "openai" && (
              <>
                <div className="space-y-2">
                  <Label>Ключ OpenAI / OpenAI-compatible</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={providerApiKey}
                    onChange={(e) => setProviderApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={loadModels} disabled={loadingModels}>
                    {loadingModels ? "Загружаю..." : "Загрузить доступные модели"}
                  </Button>
                  {openAiModels.length > 0 && <span className="self-center text-sm text-muted-foreground">Моделей: {openAiModels.length}</span>}
                </div>
                <div className="space-y-2 rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3">
                  <button type="button" className="text-sm font-medium underline underline-offset-4" onClick={() => setShowAdvanced((v) => !v)}>
                    {showAdvanced ? "Скрыть расширенные настройки" : "Показать расширенные настройки"}
                  </button>
                  {showAdvanced && (
                    <div className="space-y-2">
                      <Label>Base URL (опционально)</Label>
                      <Input
                        value={openaiBaseUrl}
                        onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                        placeholder="https://api.openai.com/v1"
                      />
                      <p className="text-xs text-muted-foreground">Нужно только для OpenAI-compatible провайдеров (не для стандартного OpenAI).</p>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Модель чата</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                list="wizard-chat-models"
                placeholder={provider === "openai" ? "gpt-4o-mini" : "qwen2.5:7b"}
              />
              <datalist id="wizard-chat-models">
                {(provider === "openai" ? [...OPENAI_MODEL_PRESETS, ...openAiModels] : ["qwen2.5:7b", "mistral:7b", "llama3.2:3b"]).map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Модель эмбеддингов (для базы знаний)</Label>
              <Input
                value={embedModel}
                onChange={(e) => setEmbedModel(e.target.value)}
                placeholder={provider === "openai" ? "text-embedding-3-small" : "nomic-embed-text"}
              />
            </div>
            <Button type="button" className="rounded-xl bg-[#0D0D0B]" onClick={saveProviderConfig} disabled={busy || !assistantId}>
              Сохранить шаг 1
            </Button>
          </div>}

          {showManualFields && <div className="grid gap-4 rounded-2xl border border-[#E8E6E0] bg-white p-6">
            <h2 className="font-heading text-lg font-extrabold">Шаг 2. Контент базы знаний</h2>
            <div className="space-y-2">
              <Label>Добавить текст</Label>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={kbText}
                onChange={(e) => setKbText(e.target.value)}
                placeholder="Вставьте статью, FAQ, описание услуг..."
              />
              <Button type="button" variant="secondary" onClick={pushText} disabled={busy || !kbText.trim()}>
                Отправить в индекс
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Загрузить файл (PDF, TXT, DOCX, MD)</Label>
              <Input type="file" accept=".pdf,.txt,.md,.docx" onChange={onFile} />
            </div>
            <div className="space-y-2">
              <Label>Импорт Obsidian vault (.md)</Label>
              <div
                className={`rounded-xl border p-3 text-sm transition-colors ${dragOver ? "border-[#3B82F6] bg-blue-50" : "border-[#E8E6E0] bg-[#FAFAF8]"}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = Array.from(e.dataTransfer.files || []);
                  await importObsidianFiles(files);
                }}
              >
                <p className="text-muted-foreground">Перетащите папку/файлы .md сюда или выберите вручную.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    ref={folderInputRef}
                    type="file"
                    style={{ display: "none" }}
                    // @ts-expect-error chromium-only attribute
                    webkitdirectory=""
                    // @ts-expect-error chromium-only attribute
                    directory=""
                    multiple
                    onChange={onObsidianFolder}
                  />
                  <Button type="button" variant="outline" onClick={() => folderInputRef.current?.click()}>
                    Выбрать папку Obsidian
                  </Button>
                  <Input type="file" accept=".md" multiple onChange={onObsidianFolder} />
                </div>
                {importProgress && <p className="mt-2 text-xs text-muted-foreground">{importProgress}</p>}
              </div>
            </div>
            <Button type="button" variant="outline" className="rounded-xl border-red-200 text-red-800" onClick={wipe} disabled={busy}>
              Очистить базу знаний
            </Button>
          </div>}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
            <h2 className="font-heading text-lg font-extrabold">Шаг 3. Проверка</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ассистент: <strong>{current?.name || "—"}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Коллекция: <code className="text-xs">{stats?.collection ?? "—"}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Точек в базе: <strong>{stats?.points ?? 0}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Эмбеддинги: <code className="text-xs">{embedModel}</code>
            </p>
          </div>

          <GraphPreview
            points={stats?.points ?? 0}
            seed={assistantId || "kb"}
            chunks={chunks}
            selectedChunkId={selectedChunkId}
            onSelectChunk={setSelectedChunkId}
            assistantName={current?.name || ""}
            collectionName={stats?.collection || ""}
            embedModelName={embedModel}
          />
          <div className="rounded-2xl border border-[#E8E6E0] bg-white p-4">
            <p className="text-sm font-semibold">Выбранный chunk</p>
            {selectedChunk ? (
              <>
                <p className="mt-2 text-xs text-muted-foreground">Источник: {selectedChunk.source}</p>
                <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-[#E8E6E0] bg-[#FAFAF8] p-3 text-sm whitespace-pre-wrap">
                  {selectedChunk.text || "(пустой текст)"}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Кликните по узлу графа, чтобы увидеть chunk.</p>
            )}
          </div>

          {showManualFields && <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
            <h2 className="font-heading text-lg font-extrabold">LLM-конструктор базы знаний</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Помощник задаёт вопросы по шагам и сам формирует черновик базы знаний.
            </p>
            <div className="mt-3 rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3 text-sm">
              <p className="font-medium">Следующий вопрос</p>
              <p className="mt-1">{coachQuestion || "Нажмите «Продолжить», чтобы получить следующий вопрос"}</p>
            </div>
            <div className="mt-3 space-y-2">
              <Label>Ваш ответ</Label>
              <textarea
                className="min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Опишите данные для базы знаний..."
              />
              <Button type="button" onClick={runCoach} disabled={coachLoading}>
                {coachLoading ? "LLM формирует..." : "Продолжить с LLM-коучем"}
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              <Label>Черновик базы знаний</Label>
              <textarea
                className="min-h-[160px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={coachDraft}
                onChange={(e) => setCoachDraft(e.target.value)}
                placeholder="Здесь появится LLM-черновик для индексации..."
              />
              <Button type="button" variant="secondary" onClick={saveCoachDraftToKb} disabled={!coachDraft.trim() || busy}>
                Добавить черновик в базу знаний (создать chunk)
              </Button>
            </div>
          </div>}

          {showManualFields && <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
            <h2 className="font-heading text-lg font-extrabold">LLM-помощник по настройке</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Задайте вопрос простыми словами. Помощник подскажет следующий шаг именно для текущего ассистента.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => askHelper("Почему у меня нет ответа в чате?")}>
                Почему нет ответа?
              </Button>
              <Button type="button" variant="outline" onClick={() => askHelper("Как быстро загрузить Obsidian и проверить результат?")}>
                Как загрузить Obsidian?
              </Button>
              <Button type="button" variant="outline" onClick={() => askHelper("Какую модель лучше выбрать для сайта продаж?")}>
                Как выбрать модель?
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              <Label>Ваш вопрос</Label>
              <Input
                value={helperQuestion}
                onChange={(e) => setHelperQuestion(e.target.value)}
                placeholder="Например: почему модель не отвечает?"
              />
              <Button type="button" onClick={() => askHelper()} disabled={helperLoading}>
                {helperLoading ? "Думаю..." : "Спросить LLM-помощника"}
              </Button>
            </div>
            <div className="mt-3 rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3 text-sm whitespace-pre-wrap min-h-[88px]">
              {helperAnswer || "Здесь появится ответ помощника."}
            </div>
            <a
              href="/docs/knowledge-base-user-guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm underline underline-offset-4"
            >
              Открыть документацию для пользователя
            </a>
          </div>}
        </div>
      </div>
    </div>
  );
}
