import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, Globe, FileText } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["AI","Сайты","Telegram","Автоматизация","Видео","Маркетинг","Боты"];

type Filter = "all" | "published" | "draft";

interface Post {
  id: number; title: string; slug: string; category: string; excerpt?: string;
  content?: string; coverImage?: string; readTime: string; metaTitle?: string;
  metaDescription?: string; isPublished: boolean; publishedAt?: string;
  createdAt: string;
}

const emptyPost: Omit<Post,"id"|"createdAt"> = {
  title:"", slug:"", category:"AI", excerpt:"", content:"", coverImage:"",
  readTime:"5 мин", metaTitle:"", metaDescription:"", isPublished:false, publishedAt:undefined,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("ru-RU", { day:"numeric", month:"short", year:"numeric" });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [modal, setModal] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi.get("/admin/blog").then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = posts.filter(p =>
    filter === "all" ? true : filter === "published" ? p.isPublished : !p.isPublished
  );

  const openCreate = () => setModal({ ...emptyPost });
  const openEdit = (p: Post) => setModal({ ...p });
  const closeModal = () => setModal(null);
  const set = (k: keyof Post, v: any) => setModal(prev => prev ? { ...prev, [k]: v } : prev);

  const save = async (publish?: boolean) => {
    if (!modal?.title || !modal?.slug) { toast.error("Укажите название и slug"); return; }
    setSaving(true);
    try {
      const data = { ...modal, isPublished: publish ?? modal.isPublished };
      if (modal.id) {
        await adminApi.put(`/admin/blog/${modal.id}`, data);
        toast.success("Статья обновлена");
      } else {
        await adminApi.post("/admin/blog", data);
        toast.success("Статья создана");
      }
      load(); closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Ошибка");
    } finally { setSaving(false); }
  };

  const togglePublish = async (p: Post) => {
    await adminApi.post(`/admin/blog/${p.id}/publish`).catch(() => {});
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить статью?")) return;
    await adminApi.delete(`/admin/blog/${id}`).catch(() => {});
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success("Удалена");
  };

  const TABS: { key: Filter; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "published", label: "Опубликованные" },
    { key: "draft", label: "Черновики" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Блог</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filter === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Статей нет</div>}
          <div className="divide-y divide-gray-50">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{p.title}</div>
                  <div className="text-xs text-gray-400">{p.category} · {p.readTime}{p.isPublished ? ` · ${fmtDate(p.publishedAt)}` : " · Черновик"}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                  {p.isPublished ? "Опубликована" : "Черновик"}
                </span>
                <button onClick={() => togglePublish(p)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" title={p.isPublished ? "Снять" : "Опубликовать"}>
                  {p.isPublished ? <Globe size={15} className="text-emerald-500" /> : <FileText size={15} className="text-gray-400" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-50"><Pencil size={15} className="text-gray-400" /></button>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={15} className="text-red-400" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{modal.id ? "Редактировать статью" : "Новая статья"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Заголовок *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20" value={modal.title ?? ""} onChange={e => { set("title", e.target.value); if (!modal.id) set("slug", slugify(e.target.value)); }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none" value={modal.slug ?? ""} onChange={e => set("slug", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Категория</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={modal.category ?? "AI"} onChange={e => set("category", e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Превью-текст</label>
                <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" rows={2} placeholder="1–2 строки для списка статей" value={modal.excerpt ?? ""} onChange={e => set("excerpt", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Полный текст</label>
                <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none font-mono" rows={8} value={modal.content ?? ""} onChange={e => set("content", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Время чтения</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="5 мин" value={modal.readTime ?? "5 мин"} onChange={e => set("readTime", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">URL обложки</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="https://..." value={modal.coverImage ?? ""} onChange={e => set("coverImage", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">SEO заголовок</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={modal.metaTitle ?? ""} onChange={e => set("metaTitle", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">SEO описание</label>
                <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" rows={2} value={modal.metaDescription ?? ""} onChange={e => set("metaDescription", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600">Отмена</button>
              <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Сохранить черновик</button>
              <button onClick={() => save(true)} disabled={saving} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? "…" : modal.isPublished ? "Обновить" : "Опубликовать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
