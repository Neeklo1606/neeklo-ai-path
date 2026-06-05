import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Сайты","AI","Telegram","E-commerce","Видео","Платформы","Автоматизация"];

interface Case {
  id: number; title: string; slug: string; category: string; badge?: string;
  description?: string; metric?: string; url?: string; color: string;
  coverImage?: string; sortOrder: number; isActive: boolean; isFeatured: boolean;
}

const empty: Omit<Case,"id"|"sortOrder"> = {
  title:"", slug:"", category:"Сайты", badge:"", description:"", metric:"",
  url:"", color:"from-slate-100 to-zinc-200", coverImage:"", isActive:true, isFeatured:false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "");
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Case> | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    adminApi.get("/admin/cases").then(r => setCases(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => setModal({ ...empty });
  const openEdit = (c: Case) => setModal({ ...c });
  const closeModal = () => setModal(null);

  const save = async () => {
    if (!modal?.title || !modal?.slug) { toast.error("Укажите название и slug"); return; }
    setSaving(true);
    try {
      if (modal.id) {
        await adminApi.put(`/admin/cases/${modal.id}`, modal);
        toast.success("Кейс обновлён");
      } else {
        await adminApi.post("/admin/cases", modal);
        toast.success("Кейс создан");
      }
      load(); closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Ошибка");
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить кейс?")) return;
    await adminApi.delete(`/admin/cases/${id}`).catch(() => {});
    setCases(prev => prev.filter(c => c.id !== id));
    toast.success("Удалён");
  };

  const toggle = async (c: Case) => {
    await adminApi.put(`/admin/cases/${c.id}`, { ...c, isActive: !c.isActive }).catch(() => {});
    setCases(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("folder", "cases");
    try {
      const r = await adminApi.post("/media/upload", fd);
      const url = r.data?.public_url ?? r.data?.publicUrl ?? r.data?.url ?? "";
      setModal(prev => prev ? { ...prev, coverImage: url } : prev);
    } catch { toast.error("Ошибка загрузки"); }
    finally { setUploading(false); }
  };

  const set = (k: keyof Case, v: any) => setModal(prev => prev ? { ...prev, [k]: v } : prev);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Кейсы / Работы</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {cases.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Кейсов пока нет</div>}
          <div className="divide-y divide-gray-50">
            {cases.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />
                {c.coverImage ? (
                  <img src={c.coverImage} alt="" className="w-12 h-8 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className={`w-12 h-8 rounded-lg bg-gradient-to-br ${c.color} shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{c.title}</div>
                  <div className="text-xs text-gray-400">{c.category}{c.metric ? ` · ${c.metric}` : ""}</div>
                </div>
                {c.isFeatured && <Star size={14} className="text-amber-400 shrink-0" fill="currentColor" />}
                <button onClick={() => toggle(c)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  {c.isActive ? <Eye size={15} className="text-emerald-500" /> : <EyeOff size={15} className="text-gray-300" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <Pencil size={15} className="text-gray-400" />
                </button>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{modal.id ? "Редактировать кейс" : "Новый кейс"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Название *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20" value={modal.title ?? ""} onChange={e => { set("title", e.target.value); if (!modal.id) set("slug", slugify(e.target.value)); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20" value={modal.slug ?? ""} onChange={e => set("slug", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Категория</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={modal.category ?? "Сайты"} onChange={e => set("category", e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Бейдж</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="ПЛАТФОРМА" value={modal.badge ?? ""} onChange={e => set("badge", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Метрика результата</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="+40% конверсия" value={modal.metric ?? ""} onChange={e => set("metric", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Описание</label>
                <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" rows={3} value={modal.description ?? ""} onChange={e => set("description", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Внешняя ссылка</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="https://" value={modal.url ?? ""} onChange={e => set("url", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Обложка</label>
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                <div className="flex items-center gap-3">
                  {modal.coverImage && <img src={modal.coverImage} alt="" className="w-20 h-12 object-cover rounded-lg border" />}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-sm px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    {uploading ? "Загрузка…" : "Выбрать файл"}
                  </button>
                  {modal.coverImage && <button onClick={() => set("coverImage", "")} className="text-xs text-red-400 hover:underline">Удалить</button>}
                </div>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" className="rounded" checked={modal.isActive ?? true} onChange={e => set("isActive", e.target.checked)} />
                  Активен
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" className="rounded" checked={modal.isFeatured ?? false} onChange={e => set("isFeatured", e.target.checked)} />
                  На главной
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Отмена</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
