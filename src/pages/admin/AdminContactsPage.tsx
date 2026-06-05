import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";
import { Search, Plus, X, Phone, Mail, Send, Copy, Check, ChevronDown, Loader2, Trash2, MessageCircle } from "lucide-react";
import { StatusBadge } from "./AdminCrmDashboard";
import { motion, AnimatePresence } from "framer-motion";

const SOURCES = ["website", "telegram", "ads", "referral", "other"];
const SOURCE_LABELS: Record<string, string> = {
  website: "Сайт", telegram: "Telegram", ads: "Реклама", referral: "Рекомендация", other: "Другое",
};
const STATUS_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "contacted", label: "В работе" },
  { value: "qualified", label: "Горячий" },
  { value: "client", label: "Клиент" },
  { value: "lost", label: "Отказ" },
];

type Contact = {
  id: string; name: string; phone: string | null; telegram: string | null; email: string | null;
  company: string | null; source: string | null; score: number; status: string;
  notes: string | null; assignee: string | null; tags: string | null;
  createdAt: string; updatedAt: string;
  deals?: Deal[];
  activities?: Activity[];
  _count?: { deals: number; activities: number };
};
type Deal = { id: string; title: string; stage: string; amount: number | null };
type Activity = { id: string; type: string; text: string; author: string | null; createdAt: string };

const DEAL_STAGE_LABELS: Record<string, string> = {
  new: "Новые", qualified: "Квалификация", proposal: "Предложение",
  negotiation: "Переговоры", won: "Выиграно", lost: "Проиграно",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} дн`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#D1D5DB";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 4, background: "#F3F4F6", borderRadius: 9999 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 9999 }} />
      </div>
      <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{score}</span>
    </div>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const hue = name.charCodeAt(0) * 137 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue}, 65%, 88%)`, color: `hsl(${hue}, 55%, 35%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const r = await adminApi.get<{ contacts: Contact[]; total: number }>(`/admin/crm/contacts?${params}`);
      setContacts(r.data.contacts);
      setTotal(r.data.total);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openContact = async (c: Contact) => {
    const r = await adminApi.get<Contact>(`/admin/crm/contacts/${c.id}`);
    setSelected(r.data);
  };

  const updateStatus = async (id: string, status: string) => {
    await adminApi.put(`/admin/crm/contacts/${id}`, { status });
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const addNote = async () => {
    if (!noteText.trim() || !selected) return;
    setAddingNote(true);
    try {
      const r = await adminApi.post<Activity>(`/admin/crm/contacts/${selected.id}/activity`, { text: noteText });
      setSelected(prev => prev ? { ...prev, activities: [r.data, ...(prev.activities || [])] } : null);
      setNoteText("");
    } finally {
      setAddingNote(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Удалить контакт?")) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/crm/contacts/${id}`);
      setSelected(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Main list */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Контакты</h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{total} записей</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none" }}
          >
            <Plus size={15} /> Добавить
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, телефону, компании..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}
          >
            <option value="all">Все статусы</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Контакт", "Телефон / Email", "Компания", "Источник", "Статус", "Оценка", "Сделки", "Добавлен"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite", display: "inline" }} /> Загрузка...
                </td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                  Контактов нет. Добавьте первый!
                </td></tr>
              ) : contacts.map(c => (
                <tr
                  key={c.id}
                  onClick={() => openContact(c)}
                  style={{ borderBottom: "1px solid #F3F4F6", cursor: "pointer", background: selected?.id === c.id ? "#EFF6FF" : "transparent", transition: "background 0.1s" }}
                  onMouseEnter={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                  onMouseLeave={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name} size={30} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, color: "#374151" }}>{c.phone || "—"}</div>
                    {c.email && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{c.email}</div>}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#4B5563" }}>{c.company || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{SOURCE_LABELS[c.source || ""] || c.source || "—"}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: "12px 14px" }}><ScoreBar score={c.score} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{c._count?.deals || 0}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#9CA3AF" }}>
                    {new Date(c.createdAt).toLocaleDateString("ru", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: 400, borderLeft: "1px solid #E5E7EB", background: "#fff", overflow: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}
          >
            {/* Panel header */}
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={selected.name} size={40} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{selected.name}</h3>
                  <select
                    value={selected.status}
                    onChange={e => updateStatus(selected.id, e.target.value)}
                    style={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 6px", background: "#F9FAFB", cursor: "pointer", outline: "none" }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
              {/* Score */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#6B7280" }}>
                  <span>Оценка лида</span><span style={{ fontWeight: 600, color: "#111" }}>{selected.score}/100</span>
                </div>
                <div style={{ height: 6, background: "#F3F4F6", borderRadius: 9999 }}>
                  <div style={{ width: `${selected.score}%`, height: "100%", background: selected.score >= 70 ? "#22C55E" : selected.score >= 40 ? "#F59E0B" : "#D1D5DB", borderRadius: 9999 }} />
                </div>
              </div>

              {/* Contact info */}
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {selected.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8 }}>
                    <Phone size={13} color="#3B82F6" />
                    <span style={{ flex: 1, fontSize: 13, color: "#111" }}>{selected.phone}</span>
                    <button onClick={() => copy(selected.phone!, "phone")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                      {copied === "phone" ? <Check size={13} color="#22C55E" /> : <Copy size={13} />}
                    </button>
                  </div>
                )}
                {selected.telegram && (
                  <a href={`https://t.me/${selected.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, textDecoration: "none" }}>
                    <Send size={13} color="#3B82F6" />
                    <span style={{ flex: 1, fontSize: 13, color: "#3B82F6" }}>{selected.telegram}</span>
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, textDecoration: "none" }}>
                    <Mail size={13} color="#3B82F6" />
                    <span style={{ flex: 1, fontSize: 13, color: "#3B82F6" }}>{selected.email}</span>
                  </a>
                )}
                {selected.company && (
                  <div style={{ fontSize: 12, color: "#6B7280", padding: "4px 0" }}>🏢 {selected.company}</div>
                )}
              </div>

              {/* Deals */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Сделки</h4>
                </div>
                {selected.deals?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.deals.map(d => (
                      <div key={d.id} style={{ padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: "#6B7280" }}>{DEAL_STAGE_LABELS[d.stage] || d.stage}</div>
                        </div>
                        {d.amount && <div style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>{d.amount.toLocaleString("ru")} ₽</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#9CA3AF" }}>Сделок нет</p>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div style={{ marginBottom: 16, padding: "10px 12px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#92400E", marginBottom: 4 }}>ЗАМЕТКА</p>
                  <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.5 }}>{selected.notes}</p>
                </div>
              )}

              {/* Activity feed */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>История</h4>
                {selected.activities?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {selected.activities.map(a => (
                      <div key={a.id} style={{ display: "flex", gap: 8, fontSize: 12 }}>
                        <div style={{ fontSize: 14, flexShrink: 0 }}>
                          {a.type === "note" ? "💬" : a.type === "status_change" ? "🔄" : a.type === "created" ? "🆕" : "📋"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: "#374151" }}>{a.text}</span>
                          <span style={{ color: "#9CA3AF", marginLeft: 6 }}>· {timeAgo(a.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Активностей нет</p>
                )}

                {/* Add note */}
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Добавить заметку..."
                  rows={2}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addNote(); }}
                />
                <button
                  onClick={addNote}
                  disabled={!noteText.trim() || addingNote}
                  style={{ width: "100%", padding: "7px", marginTop: 6, background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: noteText.trim() ? 1 : 0.4 }}
                >
                  {addingNote ? "Сохраняю..." : "Добавить заметку"}
                </button>
              </div>
            </div>

            {/* Panel footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8 }}>
              <button
                onClick={() => deleteContact(selected.id)}
                disabled={deleting}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 12, color: "#EF4444", background: "#FFF5F5", cursor: "pointer" }}
              >
                <Trash2 size={13} /> {deleting ? "..." : "Удалить"}
              </button>
              {selected.telegram && (
                <a
                  href={`https://t.me/${selected.telegram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, color: "#3B82F6", background: "#EFF6FF", textDecoration: "none" }}
                >
                  <MessageCircle size={13} /> Telegram
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showModal && (
          <AddContactModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddContactModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", telegram: "", email: "", company: "", source: "website", score: 0, status: "new", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Укажите имя"); return; }
    setLoading(true);
    try {
      await adminApi.post("/admin/crm/contacts", form);
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Ошибка");
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
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 480, background: "#fff", borderRadius: 16, padding: 28, zIndex: 50, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Новый контакт</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "name", label: "Имя *", placeholder: "Алексей Иванов" },
            { key: "phone", label: "Телефон", placeholder: "+7 999 000 00 00" },
            { key: "telegram", label: "Telegram", placeholder: "@username" },
            { key: "email", label: "Email", placeholder: "email@example.com" },
            { key: "company", label: "Компания", placeholder: "ООО Название" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>{f.label}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>Источник</label>
            <select value={form.source} onChange={e => set("source", e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }}>
              {SOURCES.map(s => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
              Оценка лида: {form.score}
            </label>
            <input type="range" min={0} max={100} value={form.score} onChange={e => set("score", parseInt(e.target.value))}
              style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>Заметка</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={3} placeholder="Первоначальная информация, запрос..."
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
          {error && <p style={{ fontSize: 12, color: "#EF4444" }}>{error}</p>}
          <button onClick={submit} disabled={loading}
            style={{ padding: "10px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Создаю..." : "Создать контакт"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
