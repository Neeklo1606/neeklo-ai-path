import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, Play, X, Settings, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";

interface Category { id: number; name: string; slug: string; }
interface Video {
  id: number; title: string; description?: string; client?: string;
  videoUrl: string; thumbnailUrl?: string; duration?: number; fileSize?: number;
  categoryId?: number; caseId?: number; sortOrder: number; isPublished: boolean;
  category?: Category;
}

const empty: Omit<Video,"id"|"sortOrder"|"isPublished"> = {
  title:"", description:"", client:"", videoUrl:"", thumbnailUrl:"",
};

function fmtDuration(s?: number) {
  if (!s) return "";
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Video>|null>(null);
  const [catModal, setCatModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAll = () => {
    Promise.all([
      adminApi.get("/admin/videos").then(r => setVideos(r.data)),
      adminApi.get("/admin/video-categories").then(r => setCats(r.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { loadAll(); }, []);

  const filtered = filterCat ? videos.filter(v => v.categoryId === filterCat) : videos;

  const openAdd = () => setModal({ ...empty, isPublished: true });
  const openEdit = (v: Video) => setModal({ ...v });
  const close = () => { setModal(null); setPreview(null); };

  const set = (k: keyof Video, v: any) => setModal(p => p ? { ...p, [k]: v } : p);

  const uploadVideoFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await adminApi.post("/admin/upload-video", fd, {
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded / (e.total||1)) * 100)),
        timeout: 300000,
      });
      const { videoUrl, thumbnailUrl, duration, fileSize } = r.data;
      setModal(p => p ? { ...p, videoUrl: videoUrl || "", thumbnailUrl: thumbnailUrl || "", duration, fileSize } : p);
      setPreview(thumbnailUrl || null);
      toast.success("Видео загружено и сжато");
    } catch {
      toast.error("Ошибка загрузки видео");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const save = async () => {
    if (!modal?.title || !modal?.videoUrl) { toast.error("Укажите название и загрузите видео"); return; }
    setSaving(true);
    try {
      if (modal.id) {
        await adminApi.put(`/admin/videos/${modal.id}`, modal);
        toast.success("Обновлено");
      } else {
        await adminApi.post("/admin/videos", modal);
        toast.success("Видео добавлено");
      }
      loadAll(); close();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Ошибка");
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить видео?")) return;
    await adminApi.delete(`/admin/videos/${id}`).catch(() => {});
    setVideos(p => p.filter(v => v.id !== id));
    toast.success("Удалено");
  };

  const toggle = async (v: Video) => {
    await adminApi.put(`/admin/videos/${v.id}`, { ...v, isPublished: !v.isPublished }).catch(() => {});
    setVideos(p => p.map(x => x.id === v.id ? { ...x, isPublished: !x.isPublished } : x));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Видео-портфолио</h1>
        <div className="flex gap-2">
          <button onClick={() => setCatModal(true)} className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Settings size={15} /> Категории
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Plus size={16} /> Загрузить видео
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterCat(null)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filterCat ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
          Все ({videos.length})
        </button>
        {cats.map(c => (
          <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterCat === c.id ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {c.name} ({videos.filter(v => v.categoryId === c.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-400">
          <Play size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Видео пока нет. Загрузите первое!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
              <div className="aspect-video relative">
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Play size={24} className="text-gray-400" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openEdit(v)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <Pencil size={16} className="text-white" />
                  </button>
                  <button onClick={() => remove(v.id)} className="p-2 bg-red-500/80 rounded-lg hover:bg-red-600/80 transition-colors">
                    <Trash2 size={16} className="text-white" />
                  </button>
                </div>
                {/* Duration badge */}
                {v.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                    {fmtDuration(v.duration)}
                  </span>
                )}
                {/* Published toggle */}
                <button onClick={() => toggle(v)} className="absolute top-2 left-2 p-1 bg-black/50 rounded-md">
                  {v.isPublished ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} className="text-gray-400" />}
                </button>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 truncate">{v.title}</div>
                {v.category && <div className="text-xs text-gray-400 mt-0.5">{v.category.name}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video upload/edit modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{modal.id ? "Редактировать видео" : "Загрузить видео"}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-5 py-4 space-y-4">

              {/* Upload zone */}
              {!modal.videoUrl && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                  onClick={() => fileRef.current?.click()}>
                  {uploading ? (
                    <div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-gray-900 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-sm text-gray-500">Загрузка и обработка… {uploadProgress}%</p>
                      <p className="text-xs text-gray-400 mt-1">FFmpeg сжимает видео, подождите</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Перетащите видео или нажмите</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI — до 500 МБ</p>
                    </>
                  )}
                </div>
              )}
              <input type="file" ref={fileRef} className="hidden" accept="video/*"
                onChange={e => e.target.files?.[0] && uploadVideoFile(e.target.files[0])} />

              {/* Video uploaded - show preview */}
              {modal.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  {modal.thumbnailUrl ? (
                    <img src={modal.thumbnailUrl} alt="thumbnail" className="w-full h-36 object-cover" />
                  ) : (
                    <video src={modal.videoUrl} className="w-full h-36 object-cover" muted />
                  )}
                  <div className="px-3 py-2 text-xs text-gray-400 flex items-center justify-between">
                    <span>{modal.videoUrl.split('/').pop()}</span>
                    <button onClick={() => setModal(p => p ? { ...p, videoUrl: "", thumbnailUrl: "" } : p)} className="text-red-400 hover:underline">Заменить</button>
                  </div>
                </div>
              )}

              {/* URL fallback */}
              {!modal.videoUrl && !uploading && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Или вставьте URL видео</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="https://..." value={modal.videoUrl ?? ""} onChange={e => set("videoUrl", e.target.value)} />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Название *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20" value={modal.title ?? ""} onChange={e => set("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Клиент</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={modal.client ?? ""} onChange={e => set("client", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Категория</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={modal.categoryId ?? ""} onChange={e => set("categoryId", e.target.value ? Number(e.target.value) : null)}>
                    <option value="">— без категории —</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Описание</label>
                <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" rows={3} value={modal.description ?? ""} onChange={e => set("description", e.target.value)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={modal.isPublished ?? true} onChange={e => set("isPublished", e.target.checked)} />
                Опубликовано
              </label>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t">
              <button onClick={close} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Отмена</button>
              <button onClick={save} disabled={saving || uploading} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories management modal */}
      {catModal && <CatModal cats={cats} onClose={() => { setCatModal(false); loadAll(); }} />}
    </div>
  );
}

function CatModal({ cats, onClose }: { cats: Category[]; onClose: () => void }) {
  const [list, setList] = useState(cats);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const create = async () => {
    if (!name || !slug) return;
    try {
      const r = await adminApi.post("/admin/video-categories", { name, slug, sortOrder: list.length });
      setList(p => [...p, r.data]);
      setName(""); setSlug("");
    } catch { toast.error("Ошибка"); }
  };

  const remove = async (id: number) => {
    await adminApi.delete(`/admin/video-categories/${id}`).catch(() => {});
    setList(p => p.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Категории видео</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="px-5 py-4 space-y-2 max-h-60 overflow-y-auto">
          {list.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-800">{c.name}</span>
              <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
            <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none" placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} />
          </div>
          <button onClick={create} className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
            + Добавить категорию
          </button>
        </div>
      </div>
    </div>
  );
}
