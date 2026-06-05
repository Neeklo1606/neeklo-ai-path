import { useState, useEffect } from "react";
import { adminApi } from "@/lib/admin-api";
import { Plus, Search, Pin, Trash2, Save, Eye, EyeOff, X, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { key: "general",    label: "Общее",             emoji: "📋" },
  { key: "processes",  label: "Процессы работы",   emoji: "⚙️" },
  { key: "templates",  label: "Шаблоны",           emoji: "📄" },
  { key: "clients",    label: "Клиентам",          emoji: "👥" },
];

type Article = {
  id: string; title: string; slug: string; content: string; category: string;
  tags: string | null; isPinned: boolean; isPublished: boolean; createdAt: string; updatedAt: string;
};

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", tags: "", isPinned: false });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (search) params.set("search", search);
      const r = await adminApi.get<Article[]>(`/admin/knowledge-articles?${params}`);
      setArticles(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeCategory, search]);

  const openArticle = (a: Article) => {
    setSelected(a);
    setIsNew(false);
    setForm({ title: a.title, content: a.content, category: a.category, tags: a.tags || "", isPinned: a.isPinned });
    setPreview(false);
  };

  const createNew = () => {
    setSelected(null);
    setIsNew(true);
    setForm({ title: "", content: "", category: activeCategory || "general", tags: "", isPinned: false });
    setPreview(false);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const r = await adminApi.post<Article>("/admin/knowledge-articles", form);
        setArticles(prev => [r.data, ...prev]);
        setSelected(r.data);
        setIsNew(false);
      } else if (selected) {
        const r = await adminApi.put<Article>(`/admin/knowledge-articles/${selected.id}`, form);
        setArticles(prev => prev.map(a => a.id === r.data.id ? r.data : a));
        setSelected(r.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    await adminApi.delete(`/admin/knowledge-articles/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
  };

  const togglePin = async (a: Article) => {
    const r = await adminApi.put<Article>(`/admin/knowledge-articles/${a.id}`, { isPinned: !a.isPinned });
    setArticles(prev => prev.map(x => x.id === r.data.id ? r.data : x));
    if (selected?.id === a.id) setSelected(r.data);
  };

  const filtered = articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = articles.filter(a => a.category === c.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div style={{ width: 260, borderRight: "1px solid #E5E7EB", background: "#FAFAFA", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 12px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 12 }}>База знаний</h2>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..." style={{ width: "100%", padding: "7px 10px 7px 28px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, outline: "none", background: "#fff", boxSizing: "border-box" }} />
          </div>
        </div>

        <nav style={{ flex: 1, overflow: "auto", padding: "0 8px" }}>
          <button onClick={() => setActiveCategory(null)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, textAlign: "left", background: activeCategory === null ? "#E5E7EB" : "transparent", color: "#111" }}>
            <span>📚</span> Все статьи <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B7280" }}>{articles.length}</span>
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, textAlign: "left", background: activeCategory === c.key ? "#E5E7EB" : "transparent", color: "#111" }}>
              <span>{c.emoji}</span> {c.label} <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B7280" }}>{catCounts[c.key] || 0}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: "10px 8px", borderTop: "1px solid #E5E7EB" }}>
          <button onClick={createNew}
            style={{ width: "100%", padding: "8px 12px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Plus size={14} /> Новая статья
          </button>
        </div>
      </div>

      {/* Article list */}
      <div style={{ width: 280, borderRight: "1px solid #E5E7EB", overflow: "auto", flexShrink: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <BookOpen size={32} style={{ color: "#D1D5DB", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "#6B7280" }}>Статей нет</p>
            <button onClick={createNew} style={{ marginTop: 8, fontSize: 12, color: "#3B82F6", background: "none", border: "none", cursor: "pointer" }}>Создать первую →</button>
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id}
              onClick={() => openArticle(a)}
              style={{ padding: "12px 14px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", background: selected?.id === a.id ? "#EFF6FF" : "transparent", transition: "background 0.1s" }}
              onMouseEnter={e => { if (selected?.id !== a.id) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
              onMouseLeave={e => { if (selected?.id !== a.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                {a.isPinned && <Pin size={11} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.3, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {a.content.substring(0, 100)}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: "#9CA3AF" }}>
                    {CATEGORIES.find(c => c.key === a.category)?.label} · {new Date(a.updatedAt).toLocaleDateString("ru", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {(selected || isNew) ? (
          <>
            {/* Editor toolbar */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#fff" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setPreview(!preview)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, cursor: "pointer", background: preview ? "#EFF6FF" : "#F9FAFB", color: preview ? "#3B82F6" : "#374151" }}>
                  {preview ? <EyeOff size={13} /> : <Eye size={13} />} {preview ? "Редактор" : "Предпросмотр"}
                </button>
                {selected && (
                  <button onClick={() => togglePin(selected)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, cursor: "pointer", background: selected.isPinned ? "#FFFBEB" : "#F9FAFB", color: selected.isPinned ? "#D97706" : "#374151" }}>
                    <Pin size={13} /> {selected.isPinned ? "Откреплён" : "Закрепить"}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected && (
                  <button onClick={() => del(selected.id)}
                    style={{ padding: "5px 10px", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "#EF4444", background: "#FFF5F5" }}>
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={save} disabled={saving || !form.title.trim()}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: form.title.trim() ? 1 : 0.4 }}>
                  <Save size={13} /> {saving ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
              {preview ? (
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 16 }}>{form.title || "Без названия"}</h1>
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}>{form.content}</div>
                </div>
              ) : (
                <>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Название статьи..."
                    style={{ display: "block", width: "100%", fontSize: 22, fontWeight: 700, color: "#111", border: "none", outline: "none", marginBottom: 14, padding: "4px 0", borderBottom: "2px solid #F3F4F6", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      style={{ padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none", background: "#F9FAFB" }}>
                      {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                    </select>
                    <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="Теги через запятую..."
                      style={{ flex: 1, padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none" }} />
                  </div>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Начните писать статью..."
                    style={{ width: "100%", minHeight: "calc(100vh - 320px)", padding: "12px 0", border: "none", outline: "none", fontSize: 14, lineHeight: 1.8, color: "#374151", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#9CA3AF" }}>
            <BookOpen size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>Выберите статью или создайте новую</p>
            <button onClick={createNew} style={{ padding: "8px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Новая статья
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
