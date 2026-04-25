import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import {
  askKnowledgeCoach,
  getKnowledgeGraph,
  getKnowledgeStats,
  ingestKnowledgeText,
  type KnowledgeGraphEdge,
  type KnowledgeGraphNode,
  type KnowledgeStats,
} from "@/services/ai.service";

type AssistantRow = CmsAssistant & { provider_api_key?: string | null };
type GraphFacets = { categories: string[]; sections: string[]; tags: string[] };

export default function AdminKnowledgeGraphPage() {
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [assistantId, setAssistantId] = useState("");
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [graphNodes, setGraphNodes] = useState<KnowledgeGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [facets, setFacets] = useState<GraphFacets>({ categories: [], sections: [], tags: [] });
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
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

  const layoutNodes = useMemo(() => {
    if (!graphNodes.length) return [];
    const incoming = new Map<string, number>();
    const outgoing = new Map<string, number>();
    for (const e of graphEdges) {
      outgoing.set(e.from, (outgoing.get(e.from) || 0) + 1);
      incoming.set(e.to, (incoming.get(e.to) || 0) + 1);
    }
    const roots = graphNodes
      .map((n) => ({ ...n, degree: (incoming.get(n.id) || 0) + (outgoing.get(n.id) || 0) }))
      .sort((a, b) => b.degree - a.degree);
    const rootId = roots[0]?.id || graphNodes[0].id;
    const others = graphNodes.filter((n) => n.id !== rootId);
    const out: Array<KnowledgeGraphNode & { x: number; y: number; size: number }> = [];
    out.push({ ...(graphNodes.find((n) => n.id === rootId) || graphNodes[0]), x: 0, y: 0, size: 4.8 });

    const byCategory = new Map<string, KnowledgeGraphNode[]>();
    for (const n of others) {
      const key = n.category?.trim() || "Общее";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(n);
    }
    const categories = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length);

    // If there are meaningful categories, place nodes in category clusters.
    if (categories.length > 1) {
      const clusterRadius = 52;
      categories.forEach(([_, nodes], clusterIdx) => {
        const cAngle = (Math.PI * 2 * clusterIdx) / categories.length;
        const cx = Math.cos(cAngle) * clusterRadius;
        const cy = Math.sin(cAngle) * clusterRadius;
        const total = Math.max(1, nodes.length);
        nodes.forEach((node, i) => {
          const a = (Math.PI * 2 * i) / total;
          const r = 9 + Math.min(18, Math.ceil(total / 4) * 2) + (i % 3);
          out.push({
            ...node,
            x: cx + Math.cos(a) * r,
            y: cy + Math.sin(a) * r,
            size: 2.2 + Math.min(2.2, ((incoming.get(node.id) || 0) + (outgoing.get(node.id) || 0)) * 0.22),
          });
        });
      });
      return out;
    }

    // Fallback ring layout when there are no categories.
    const total = Math.max(1, others.length);
    for (let i = 0; i < others.length; i += 1) {
      const angle = (Math.PI * 2 * i) / total;
      const radius = 54 + (i % 4) * 6;
      out.push({
        ...others[i],
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 2.2 + Math.min(2.2, ((incoming.get(others[i].id) || 0) + (outgoing.get(others[i].id) || 0)) * 0.22),
      });
    }
    return out;
  }, [graphNodes, graphEdges]);
  const byId = useMemo(() => Object.fromEntries(layoutNodes.map((n) => [n.id, n])), [layoutNodes]);
  const selectedNode = useMemo(() => graphNodes.find((n) => n.id === selectedNodeId) || null, [graphNodes, selectedNodeId]);
  const hoveredNode = useMemo(() => (hoveredNodeId ? graphNodes.find((n) => n.id === hoveredNodeId) || null : null), [hoveredNodeId, graphNodes]);
  const current = useMemo(() => assistants.find((a) => a.id === assistantId) || null, [assistants, assistantId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const step = ev.shiftKey ? 0.2 : 0.12;
      const dominantDelta = Math.abs(ev.deltaY) >= Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX;
      if (dominantDelta === 0) return;
      const next = dominantDelta < 0 ? zoom + step : zoom - step;
      setZoom(Math.max(0.6, Math.min(2.6, Number(next.toFixed(2)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const refreshAll = async (id: string) => {
    const [statsOut, graphOut] = await Promise.all([
      getKnowledgeStats(id).catch(() => null),
      getKnowledgeGraph(id, {
        category: categoryFilter || undefined,
        section: sectionFilter || undefined,
        tag: tagFilter || undefined,
      }).catch(() => ({ nodes: [], edges: [], facets: { categories: [], sections: [], tags: [] } })),
    ]);
    setStats(statsOut);
    const nodes = Array.isArray(graphOut?.nodes) ? graphOut.nodes : [];
    const edges = Array.isArray(graphOut?.edges) ? graphOut.edges : [];
    setGraphNodes(nodes);
    setGraphEdges(edges);
    setFacets(graphOut?.facets || { categories: [], sections: [], tags: [] });
    if (nodes.length) setSelectedNodeId((prev) => prev || nodes[0].id);
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
  }, [assistantId, categoryFilter, sectionFilter, tagFilter]);

  const runChunkAgent = async () => {
    if (!assistantId) return toast.error("Выберите ассистента");
    const sourceText = agentSource.trim();
    if (!sourceText) return toast.error("Добавьте исходные данные для агента");
    setAgentBusy(true);
    setAgentStatus("Агент анализирует данные...");
    try {
      const out = await askKnowledgeCoach({
        assistantId,
        goal: "Сформируй готовые чанки базы знаний для сайта. Верни связный markdown без лишней воды.",
        answers: { "Исходные данные": sourceText },
      });
      const draft = out.draft?.trim();
      if (draft) {
        setAgentStatus("Черновик сформирован, загружаю в индекс...");
        const ingest = await ingestKnowledgeText(assistantId, draft);
        setAgentStatus(`Готово. Добавлено чанков: ${ingest.upserted}`);
        await refreshAll(assistantId);
        setAgentSource("");
        return;
      }

      // Fallback: если LLM-коуч не вернул draft, индексируем исходный текст напрямую.
      setAgentStatus("Коуч не вернул готовый черновик, загружаю исходный текст напрямую...");
      const ingest = await ingestKnowledgeText(assistantId, sourceText);
      const note = out.next_question?.trim() ? ` Подсказка коуча: ${out.next_question.trim()}` : "";
      setAgentStatus(`Готово. Добавлено чанков: ${ingest.upserted}.${note}`);
      await refreshAll(assistantId);
      setAgentSource("");
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
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <select
              className="h-8 rounded-md border border-white/20 bg-[#141a24] px-2 text-xs text-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Все категории</option>
              {facets.categories.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select
              className="h-8 rounded-md border border-white/20 bg-[#141a24] px-2 text-xs text-white"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="">Все разделы</option>
              {facets.sections.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select
              className="h-8 rounded-md border border-white/20 bg-[#141a24] px-2 text-xs text-white"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="">Все теги</option>
              {facets.tags.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
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
                {graphEdges.map((e, idx) => {
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
                      strokeWidth={isHoveredEdge ? 1.25 : 0.75}
                      style={{ animation: `kb-fade 2.8s ease-in-out ${idx * 40}ms infinite` }}
                    />
                  );
                })}
                {layoutNodes.map((n, idx) => (
                  <g key={n.id}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={hoveredNodeId === n.id ? n.size + 1.2 : n.size}
                      fill={hoveredNodeId === n.id ? "#ffffff" : "rgba(224,230,255,0.92)"}
                      style={{ cursor: "pointer", animation: `kb-pulse 2.1s ease-in-out ${idx * 55}ms infinite` }}
                      onMouseEnter={() => setHoveredNodeId(n.id)}
                      onMouseLeave={() => setHoveredNodeId("")}
                      onClick={() => {
                        setSelectedNodeId(n.id);
                      }}
                    />
                    {hoveredNodeId === n.id && (
                      <text
                        x={n.x + 3}
                        y={n.y - 3}
                        fontSize="4.5"
                        fill="#d9deff"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {n.title}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/85">
              Колесо: zoom, Shift+колесо: быстрее, мышь: pan
            </div>
            {hoveredNode && (
              <div className="pointer-events-none absolute left-2 top-2 max-w-[340px] rounded-md border border-white/10 bg-black/70 px-3 py-2 text-xs text-white/90">
                <p className="font-medium text-white">{hoveredNode.title || "note"}</p>
                <p className="mt-1 line-clamp-3 text-white/80">
                  {hoveredNode.category || hoveredNode.section || hoveredNode.tags?.join(", ") || "Без метаданных"}
                </p>
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
            <p className="text-sm font-semibold">Выбранный узел</p>
            {selectedNode ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">Название: {selectedNode.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Slug: {selectedNode.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">Источник: {selectedNode.source}</p>
                <p className="mt-1 text-xs text-muted-foreground">Категория: {selectedNode.category || "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Раздел: {selectedNode.section || "—"}</p>
                <div className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-[#E8E6E0] bg-[#FAFAF8] p-2 text-sm">
                  Теги: {selectedNode.tags?.length ? selectedNode.tags.join(", ") : "—"}
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

