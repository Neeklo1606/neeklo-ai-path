import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminApi } from "@/lib/admin-api";
import { Plus, X, Calendar, CircleDot, Loader2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { key: "new",         label: "Новые",        color: "#3B82F6", bg: "#EFF6FF" },
  { key: "qualified",   label: "Квалификация",  color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "proposal",    label: "Предложение",   color: "#F59E0B", bg: "#FFFBEB" },
  { key: "negotiation", label: "Переговоры",    color: "#F97316", bg: "#FFF7ED" },
  { key: "won",         label: "Выиграно",      color: "#22C55E", bg: "#F0FDF4" },
  { key: "lost",        label: "Проиграно",     color: "#6B7280", bg: "#F9FAFB" },
];

const PRIORITY_COLORS: Record<string, string> = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };

type Deal = {
  id: string; title: string; stage: string; amount: number | null; service: string | null;
  priority: string; dueDate: string | null; assignee: string | null; color: string | null;
  sortOrder: number; notes: string | null;
  contact?: { id: string; name: string; phone: string | null } | null;
  _count?: { activities: number };
  createdAt: string;
};

function formatRub(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
  return `${n.toLocaleString("ru")} ₽`;
}

function isOverdue(d: string | null) {
  return d && new Date(d) < new Date();
}

// ─── Sortable Card ─────────────────────────────────────────────────────────────
function DealCard({ deal, onClick, isDragging }: { deal: Deal; onClick: () => void; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        onClick={onClick}
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: "12px 13px",
          cursor: "pointer",
          transition: "box-shadow 0.15s",
          position: "relative",
          ...(deal.color ? { borderLeft: `3px solid ${deal.color}` } : {}),
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
      >
        {/* Drag handle */}
        <div {...listeners} style={{ position: "absolute", top: 8, right: 8, color: "#D1D5DB", cursor: "grab" }}
          onClick={e => e.stopPropagation()}>
          <GripVertical size={14} />
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4, paddingRight: 20, lineHeight: 1.3 }}>
          {deal.title}
        </div>
        {deal.contact && (
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>{deal.contact.name}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
          {deal.service && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 9999, background: "#F3F4F6", color: "#374151", fontWeight: 500 }}>
              {deal.service}
            </span>
          )}
          {deal.amount && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 9999, background: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
              {formatRub(deal.amount)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CircleDot size={10} color={PRIORITY_COLORS[deal.priority] || "#9CA3AF"} fill={PRIORITY_COLORS[deal.priority] || "#9CA3AF"} />
            {deal.dueDate && (
              <span style={{ fontSize: 10, color: isOverdue(deal.dueDate) ? "#EF4444" : "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                <Calendar size={9} />
                {new Date(deal.dueDate).toLocaleDateString("ru", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Column ────────────────────────────────────────────────────────────────────
function Column({ stage, deals, onCardClick, onAddDeal }: {
  stage: typeof STAGES[0];
  deals: Deal[];
  onCardClick: (d: Deal) => void;
  onAddDeal: (stage: string) => void;
}) {
  const totalAmount = deals.reduce((a, d) => a + (d.amount || 0), 0);
  return (
    <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 130px)" }}>
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: stage.bg, borderRadius: "10px 10px 0 0", border: `1px solid ${stage.color}30`, borderBottom: "none" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: stage.color, flex: 1 }}>{stage.label}</span>
        <span style={{ fontSize: 11, color: stage.color, opacity: 0.7 }}>{deals.length}</span>
        {totalAmount > 0 && (
          <span style={{ fontSize: 10, color: stage.color, opacity: 0.6 }}>
            {totalAmount >= 1000 ? `${Math.round(totalAmount / 1000)}k` : totalAmount}₽
          </span>
        )}
      </div>

      {/* Cards */}
      <div style={{
        flex: 1, overflowY: "auto", padding: 8, background: "#F9FAFB",
        border: `1px solid ${stage.color}20`, display: "flex", flexDirection: "column", gap: 6,
        minHeight: 80,
      }}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(d => (
            <DealCard key={d.id} deal={d} onClick={() => onCardClick(d)} />
          ))}
        </SortableContext>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddDeal(stage.key)}
        style={{ padding: "8px 12px", background: "#F9FAFB", border: `1px solid ${stage.color}20`, borderTop: "none", borderRadius: "0 0 10px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280", cursor: "pointer", width: "100%" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
      >
        <Plus size={12} /> Добавить
      </button>
    </div>
  );
}

// ─── Main Kanban Page ──────────────────────────────────────────────────────────
export default function AdminCrmKanbanPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStage, setAddStage] = useState("new");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    adminApi.get<Deal[]>("/admin/crm/deals").then(r => { setDeals(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const dealsByStage = (stage: string) => deals.filter(d => d.stage === stage).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragStart = (e: DragStartEvent) => {
    const deal = deals.find(d => d.id === e.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const draggedDeal = deals.find(d => d.id === active.id);
    if (!draggedDeal) return;

    // Determine target stage from over.id (could be a deal id or column id)
    let targetStage = draggedDeal.stage;
    const overDeal = deals.find(d => d.id === over.id);
    if (overDeal) targetStage = overDeal.stage;
    else if (STAGES.find(s => s.key === over.id)) targetStage = over.id as string;

    if (draggedDeal.stage !== targetStage) {
      // Optimistic update
      setDeals(prev => prev.map(d => d.id === draggedDeal.id ? { ...d, stage: targetStage } : d));
      try {
        await adminApi.put(`/admin/crm/deals/${draggedDeal.id}/stage`, { stage: targetStage });
      } catch {
        // Revert on error
        setDeals(prev => prev.map(d => d.id === draggedDeal.id ? { ...d, stage: draggedDeal.stage } : d));
      }
    }
  };

  const openAddModal = (stage: string) => { setAddStage(stage); setShowAddModal(true); };

  const onDealCreated = (deal: Deal) => {
    setDeals(prev => [...prev, deal]);
    setShowAddModal(false);
  };

  const onDealUpdated = (updated: Deal) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
    setSelectedDeal(updated);
  };

  const onDealDeleted = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    setSelectedDeal(null);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 10, color: "#6B7280" }}>
      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Загрузка...
    </div>
  );

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Проекты / Сделки</h1>
          <p style={{ fontSize: 13, color: "#6B7280" }}>{deals.length} сделок</p>
        </div>
        <button
          onClick={() => openAddModal("new")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none" }}
        >
          <Plus size={15} /> Новая сделка
        </button>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: "max-content", paddingBottom: 16 }}>
            {STAGES.map(stage => (
              <Column
                key={stage.key}
                stage={stage}
                deals={dealsByStage(stage.key)}
                onCardClick={setSelectedDeal}
                onAddDeal={openAddModal}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal && (
              <div style={{
                background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
                padding: "12px 13px", width: 228, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                fontSize: 13, fontWeight: 600, color: "#111",
              }}>
                {activeDeal.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Deal detail panel */}
      <AnimatePresence>
        {selectedDeal && (
          <DealPanel deal={selectedDeal} onClose={() => setSelectedDeal(null)} onUpdated={onDealUpdated} onDeleted={onDealDeleted} />
        )}
      </AnimatePresence>

      {/* Add deal modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddDealModal defaultStage={addStage} onClose={() => setShowAddModal(false)} onCreated={onDealCreated} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Deal Panel ────────────────────────────────────────────────────────────────
function DealPanel({ deal, onClose, onUpdated, onDeleted }: {
  deal: Deal;
  onClose: () => void;
  onUpdated: (d: Deal) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState({ title: deal.title, stage: deal.stage, amount: deal.amount || "", service: deal.service || "", priority: deal.priority, notes: deal.notes || "" });
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      const r = await adminApi.put<Deal>(`/admin/crm/deals/${deal.id}`, form);
      onUpdated(r.data);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Удалить сделку?")) return;
    await adminApi.delete(`/admin/crm/deals/${deal.id}`);
    onDeleted(deal.id);
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await adminApi.post(`/admin/crm/deals/${deal.id}/activity`, { text: noteText });
    setNoteText("");
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "#fff", zIndex: 50, borderLeft: "1px solid #E5E7EB", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Сделка</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Название</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, fontWeight: 600, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Стадия</label>
              <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
                style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none" }}>
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Приоритет</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none" }}>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Сумма ₽</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Услуга</label>
              <input value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          {deal.contact && (
            <div style={{ padding: "8px 12px", background: "#EFF6FF", borderRadius: 8, fontSize: 13, color: "#1E40AF" }}>
              👤 {deal.contact.name} {deal.contact.phone && `· ${deal.contact.phone}`}
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Заметки</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3} style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={save} disabled={saving}
            style={{ padding: "9px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Сохраняю..." : "Сохранить изменения"}
          </button>

          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
            <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Добавить заметку</label>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
              style={{ display: "block", width: "100%", padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginTop: 4, outline: "none", resize: "none", boxSizing: "border-box" }} />
            <button onClick={addNote} disabled={!noteText.trim()}
              style={{ marginTop: 6, padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#F9FAFB" }}>
              Добавить
            </button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={del} style={{ color: "#EF4444", background: "none", border: "1px solid #FCA5A5", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            Удалить сделку
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Add Deal Modal ────────────────────────────────────────────────────────────
function AddDealModal({ defaultStage, onClose, onCreated }: { defaultStage: string; onClose: () => void; onCreated: (d: Deal) => void }) {
  const [form, setForm] = useState({ title: "", stage: defaultStage, amount: "", service: "", priority: "medium" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const r = await adminApi.post<Deal>("/admin/crm/deals", form);
      onCreated(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, background: "#fff", borderRadius: 16, padding: 24, zIndex: 50, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Новая сделка</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Название проекта *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            style={{ padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
              style={{ padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }}>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              style={{ padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }}>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>
          <input placeholder="Сумма (₽)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            style={{ padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <input placeholder="Услуга / тип проекта" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
            style={{ padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <button onClick={submit} disabled={loading || !form.title.trim()}
            style={{ padding: "9px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: form.title.trim() ? 1 : 0.4 }}>
            {loading ? "Создаю..." : "Создать сделку"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
