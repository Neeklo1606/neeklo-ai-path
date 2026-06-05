import { useState, useEffect } from "react";
import { adminApi } from "@/lib/admin-api";
import { Plus, Save, Trash2, FileText, Tag, CheckCircle2, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { key: "general", label: "Общие", emoji: "📋" },
  { key: "sales", label: "Продажи", emoji: "💼" },
  { key: "dev", label: "Разработка", emoji: "💻" },
  { key: "support", label: "Клиентский сервис", emoji: "🤝" },
  { key: "hr", label: "HR", emoji: "👥" },
];

type Reg = {
  id: string; title: string; content: string; category: string;
  version: string; isActive: boolean; createdAt: string; updatedAt: string;
};

function bumpVersion(v: string) {
  const parts = v.split(".");
  parts[parts.length - 1] = String(parseInt(parts[parts.length - 1]) + 1);
  return parts.join(".");
}

export default function AdminRegulationsPage() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reg | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", version: "1.0" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = catFilter ? `?category=${catFilter}` : "";
      const r = await adminApi.get<Reg[]>(`/admin/regulations${params}`);
      setRegs(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [catFilter]);

  const open = (r: Reg) => {
    setSelected(r);
    setIsNew(false);
    setForm({ title: r.title, content: r.content, category: r.category, version: r.version });
  };

  const createNew = () => {
    setSelected(null);
    setIsNew(true);
    setForm({ title: "", content: "", category: catFilter || "general", version: "1.0" });
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const r = await adminApi.post<Reg>("/admin/regulations", form);
        setRegs(prev => [r.data, ...prev]);
        setSelected(r.data);
        setIsNew(false);
      } else if (selected) {
        const r = await adminApi.put<Reg>(`/admin/regulations/${selected.id}`, form);
        setRegs(prev => prev.map(x => x.id === r.data.id ? r.data : x));
        setSelected(r.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const publishNewVersion = async () => {
    if (!selected) return;
    const newVersion = bumpVersion(form.version);
    setForm(p => ({ ...p, version: newVersion }));
    setSaving(true);
    try {
      const r = await adminApi.put<Reg>(`/admin/regulations/${selected.id}`, { ...form, version: newVersion });
      setRegs(prev => prev.map(x => x.id === r.data.id ? r.data : x));
      setSelected(r.data);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Удалить регламент?")) return;
    await adminApi.delete(`/admin/regulations/${id}`);
    setRegs(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
  };

  const toggleActive = async (r: Reg) => {
    const updated = await adminApi.put<Reg>(`/admin/regulations/${r.id}`, { isActive: !r.isActive });
    setRegs(prev => prev.map(x => x.id === updated.data.id ? updated.data : x));
    if (selected?.id === r.id) setSelected(updated.data);
  };

  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = regs.filter(r => r.category === c.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: "1px solid #E5E7EB", background: "#FAFAFA", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 12px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 12 }}>Регламенты</h2>
        </div>
        <nav style={{ flex: 1, padding: "0 8px" }}>
          <button onClick={() => setCatFilter(null)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, textAlign: "left", background: catFilter === null ? "#E5E7EB" : "transparent", color: "#111" }}>
            📚 Все <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B7280" }}>{regs.length}</span>
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, textAlign: "left", background: catFilter === c.key ? "#E5E7EB" : "transparent", color: "#111" }}>
              <span>{c.emoji}</span> {c.label} <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B7280" }}>{catCounts[c.key] || 0}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "10px 8px", borderTop: "1px solid #E5E7EB" }}>
          <button onClick={createNew}
            style={{ width: "100%", padding: "8px 12px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Plus size={14} /> Новый
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ width: 280, borderRight: "1px solid #E5E7EB", overflow: "auto", flexShrink: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Загрузка...</div>
        ) : regs.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <FileText size={32} style={{ color: "#D1D5DB", display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "#6B7280" }}>Регламентов нет</p>
          </div>
        ) : regs.map(r => (
          <div key={r.id}
            onClick={() => open(r)}
            style={{ padding: "12px 14px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", background: selected?.id === r.id ? "#EFF6FF" : "transparent" }}
            onMouseEnter={e => { if (selected?.id !== r.id) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
            onMouseLeave={e => { if (selected?.id !== r.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{r.title}</span>
              {r.isActive ? (
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 9999, background: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>v{r.version}</span>
              ) : (
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 9999, background: "#F9FAFB", color: "#6B7280", fontWeight: 600 }}>Устар.</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, fontSize: 11, color: "#9CA3AF" }}>
              <span>{CATEGORIES.find(c => c.key === r.category)?.label}</span>
              <span>·</span>
              <span>{new Date(r.updatedAt).toLocaleDateString("ru", { day: "2-digit", month: "short", year: "2-digit" })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {(selected || isNew) ? (
          <>
            {/* Toolbar */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#fff" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {selected && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280" }}>
                      <Tag size={12} /> v{selected.version}
                    </div>
                    <button onClick={() => toggleActive(selected)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, cursor: "pointer", background: selected.isActive ? "#F0FDF4" : "#F9FAFB", color: selected.isActive ? "#16A34A" : "#6B7280" }}>
                      {selected.isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {selected.isActive ? "Актуальный" : "Устаревший"}
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected && (
                  <>
                    <button onClick={publishNewVersion}
                      style={{ padding: "6px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#F9FAFB", color: "#374151" }}>
                      Новая версия ({bumpVersion(form.version)})
                    </button>
                    <button onClick={() => del(selected.id)}
                      style={{ padding: "5px 10px", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "#EF4444", background: "#FFF5F5" }}>
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
                <button onClick={save} disabled={saving || !form.title.trim()}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: form.title.trim() ? 1 : 0.4 }}>
                  <Save size={13} /> {saving ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Название регламента..."
                style={{ display: "block", width: "100%", fontSize: 22, fontWeight: 700, color: "#111", border: "none", outline: "none", marginBottom: 14, padding: "4px 0", borderBottom: "2px solid #F3F4F6", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none", background: "#F9FAFB" }}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                </select>
                <input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                  placeholder="Версия" style={{ width: 80, padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none" }} />
              </div>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Опишите процесс, правила, инструкции..."
                style={{ width: "100%", minHeight: "calc(100vh - 300px)", padding: "12px 0", border: "none", outline: "none", fontSize: 14, lineHeight: 1.8, color: "#374151", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#9CA3AF" }}>
            <FileText size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>Выберите регламент или создайте новый</p>
            <button onClick={createNew} style={{ padding: "8px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Создать
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
