import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import { buildKnowledgeGraph } from "@/lib/knowledge-graph";
import {
  askKnowledgeCoach,
  getKnowledgeStats,
  ingestKnowledgeText,
  listKnowledgeChunks,
  type KnowledgeStats,
} from "@/services/ai.service";

type AssistantRow = CmsAssistant & { provider_api_key?: string | null };
type ChunkItem = { id: string; text: string; source: string };

export default function AdminKnowledgeGraphPage() {
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [assistantId, setAssistantId] = useState("");
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [selectedChunkId, setSelectedChunkId] = useState("");
  const [loading, setLoading] = useState(true);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState("");
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [agentSource, setAgentSource] = useState("");
  const [agentStatus, setAgentStatus] = useState("");
  const [agentBusy, setAgentBusy] = useState(false);

  const graph = useMemo(() => buildKnowledgeGraph(stats?.points ?? 0, assistantId || "kb"), [stats?.points, assistantId]);
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);
  const nodeToChunk = useMemo(() => {
    const map: Record<string, ChunkItem> = {};
    if (!chunks.length) return map;
    for (const n of graph.nodes) {
      if (n.id === "core") continue;
      const idx = Number(n.id.replace("n", "")) || 0;
      const ch = chunks[idx % chunks.length];
      if (ch) map[n.id] = ch;
    }
    return map;
  }, [graph.nodes, chunks]);
  const selectedChunk = useMemo(() => chunks.find((c) => c.id === selectedChunkId) || null, [chunks, selectedChunkId]);
  const hoveredChunk = useMemo(
    () => (hoveredNodeId ? nodeToChunk[hoveredNodeId] || null : null),
    [hoveredNodeId, nodeToChunk],
  );
  const current = useMemo(() => assistants.find((a) => a.id === assistantId) || null, [assistants, assistantId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const step = ev.shiftKey ? 0.2 : 0.12;
      const next = ev.deltaY < 0 ? zoom + step : zoom - step;
      setZoom(Math.max(0.6, Math.min(2.6, Number(next.toFixed(2)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const refreshAll = async (id: string) => {
    const [statsOut, chunksOut] = await Promise.all([
      getKnowledgeStats(id).catch(() => null),
      listKnowledgeChunks(id, 60).catch(() => ({ chunks: [] })),
    ]);
    setStats(statsOut);
    const list = Array.isArray(chunksOut?.chunks) ? chunksOut.chunks : [];
    setChunks(list);
    if (list.length) setSelectedChunkId((prev) => prev || list[0].id);
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
    refreshAll(assistantId).catch(() => undefined);
  }, [assistantId]);

  const runChunkAgent = async () => {
    if (!assistantId) return toast.error("Выберите ассистента");
    if (!agentSource.trim()) return toast.error("Добавьте исходные данные для агента");
    setAgentBusy(true);
    setAgentStatus("Агент анализирует данные...");
    try {
      const out = await askKnowledgeCoach({
        assistantId,
        goal: "Сформируй готовые чанки базы знаний для сайта. Верни связный markdown без лишней воды.",
        answers: { "Исходные данные": agentSource.trim() },
      });
      if (!out.draft?.trim()) {
        setAgentStatus(out.next_question || "Недостаточно данных. Уточните ввод.");
        return;
      }
      setAgentStatus("Черновик сформирован, загружаю в индекс...");
      const ingest = await ingestKnowledgeText(assistantId, out.draft);
      setAgentStatus(`Готово. Добавлено чанков: ${ingest.upserted}`);
      await refreshAll(assistantId);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      setAgentStatus(`Ошибка: ${msg}`);
      toast.error(msg);
    } finally {
      setAgentBusy(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Граф базы знаний — отдельная страница</h1>
        <Link to="/admin/knowledge" className="text-sm underline underline-offset-4">← Назад к мастеру</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#E8E6E0] bg-[#0E1016] p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-white">Ассистент</Label>
              <select
                className="h-8 rounded-md border border-white/20 bg-[#141a24] px-2 text-xs text-white"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
              >
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/70">Точек: {stats?.points ?? 0}</p>
          </div>

          <div
            ref={wrapRef}
            className="relative h-[78vh] overflow-hidden rounded-xl border border-white/10 bg-[#0A0C12]"
            onMouseDown={(e) => {
              setDragging(true);
              dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
            }}
            onMouseMove={(e) => {
              if (!dragging || !dragStart.current) return;
              const dx = e.clientX - dragStart.current.x;
              const dy = e.clientY - dragStart.current.y;
              setPan({ x: dragStart.current.panX + dx / 2.3, y: dragStart.current.panY + dy / 2.3 });
            }}
            onMouseUp={() => {
              setDragging(false);
              dragStart.current = null;
            }}
            onMouseLeave={() => {
              setDragging(false);
              dragStart.current = null;
              setHoveredNodeId("");
            }}
          >
            <svg viewBox="-100 -100 200 200" className="h-full w-full cursor-grab active:cursor-grabbing">
              <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                {graph.edges.map((e, idx) => {
                  const a = byId[e.from];
                  const b = byId[e.to];
                  if (!a || !b) return null;
                  const isHoveredEdge = hoveredNodeId && (e.from === hoveredNodeId || e.to === hoveredNodeId);
                  return (
                    <line
                      key={e.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={isHoveredEdge ? "rgba(160,170,255,0.95)" : "rgba(106,120,255,0.45)"}
                      strokeWidth={isHoveredEdge ? 1.25 : e.from === "core" ? 0.9 : 0.45}
                      style={{ animation: `kb-fade 2.8s ease-in-out ${idx * 40}ms infinite` }}
                    />
                  );
                })}
                {graph.nodes.map((n, idx) => (
                  <g key={n.id}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.id === "core" ? 4.4 : hoveredNodeId === n.id ? n.size + 1.2 : n.size}
                      fill={n.id === "core" ? "#f8f9ff" : hoveredNodeId === n.id ? "#ffffff" : "rgba(224,230,255,0.92)"}
                      style={{ cursor: n.id === "core" ? "default" : "pointer", animation: `kb-pulse 2.1s ease-in-out ${idx * 55}ms infinite` }}
                      onMouseEnter={() => n.id !== "core" && setHoveredNodeId(n.id)}
                      onMouseLeave={() => n.id !== "core" && setHoveredNodeId("")}
                      onClick={() => {
                        if (n.id === "core" || !chunks.length) return;
                        const ch = nodeToChunk[n.id];
                        if (ch) setSelectedChunkId(ch.id);
                      }}
                    />
                    {hoveredNodeId === n.id && n.id !== "core" && (
                      <text
                        x={n.x + 3}
                        y={n.y - 3}
                        fontSize="4.5"
                        fill="#d9deff"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {nodeToChunk[n.id]?.source || n.label}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/85">
              Колесо: zoom, Shift+колесо: быстрее, мышь: pan
            </div>
            {hoveredChunk && (
              <div className="pointer-events-none absolute left-2 top-2 max-w-[340px] rounded-md border border-white/10 bg-black/70 px-3 py-2 text-xs text-white/90">
                <p className="font-medium text-white">{hoveredChunk.source || "chunk"}</p>
                <p className="mt-1 line-clamp-3 text-white/80">{hoveredChunk.text || "(пусто)"}</p>
              </div>
            )}
          </div>
          <style>{`
            @keyframes kb-pulse { 0%,100% { opacity: .65; } 50% { opacity: 1; } }
            @keyframes kb-fade { 0%,100% { opacity: .2; } 50% { opacity: .8; } }
          `}</style>
        </section>

        <aside className="space-y-3 rounded-2xl border border-[#E8E6E0] bg-white p-4">
          <div className="rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3 text-sm">
            <p><span className="text-muted-foreground">Ассистент:</span> {current?.name || "—"}</p>
            <p><span className="text-muted-foreground">Коллекция:</span> {stats?.collection || "—"}</p>
            <p><span className="text-muted-foreground">Эмбеддинги:</span> {current?.embed_model || "—"}</p>
            <p><span className="text-muted-foreground">Zoom:</span> {zoom.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-[#E8E6E0] p-3">
            <p className="text-sm font-semibold">Управление графом</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setZoom((z) => Math.min(2.6, Number((z + 0.1).toFixed(2))))}>+</Button>
              <Button type="button" variant="outline" onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}>-</Button>
              <Button type="button" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E8E6E0] p-3">
            <p className="text-sm font-semibold">Выбранный chunk</p>
            {selectedChunk ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">Источник: {selectedChunk.source}</p>
                <p className="mt-1 text-xs text-muted-foreground">ID: {selectedChunk.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">Длина: {selectedChunk.text.length} символов</p>
                <div className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-[#E8E6E0] bg-[#FAFAF8] p-2 text-sm">
                  {selectedChunk.text}
                </div>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Кликните на узел графа.</p>
            )}
          </div>

          <div className="rounded-xl border border-[#E8E6E0] p-3">
            <p className="text-sm font-semibold">Агент добавления чанков</p>
            <p className="mt-1 text-xs text-muted-foreground">Вставьте материалы, агент разобьет и добавит в базу знаний.</p>
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={agentSource}
              onChange={(e) => setAgentSource(e.target.value)}
              placeholder="Описание услуг, FAQ, скрипты продаж..."
            />
            <Button type="button" className="mt-2 w-full" onClick={runChunkAgent} disabled={agentBusy}>
              {agentBusy ? "Агент работает..." : "Запустить агента чанков"}
            </Button>
            {agentStatus && <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{agentStatus}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

