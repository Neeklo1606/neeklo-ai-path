import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

interface PageConfig { slug: string; label: string; fields: { key: string; label: string; type: "text"|"textarea"|"group"; items?: { key: string; label: string; type: "text"|"textarea" }[] }[] }

const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: "home",
    label: "Главная",
    fields: [
      { key: "h1", label: "Заголовок H1", type: "text" },
      { key: "subtitle", label: "Подзаголовок", type: "textarea" },
      { key: "ctaText", label: "Текст кнопки CTA", type: "text" },
    ],
  },
  {
    slug: "contacts",
    label: "Контакты",
    fields: [
      { key: "founderName", label: "Имя основателя", type: "text" },
      { key: "description", label: "Описание", type: "textarea" },
      { key: "email", label: "Email", type: "text" },
      { key: "telegramPersonal", label: "Telegram личный", type: "text" },
      { key: "telegramChannel", label: "Telegram канал", type: "text" },
      { key: "instagram", label: "Instagram", type: "text" },
      { key: "location", label: "Локация", type: "text" },
    ],
  },
  {
    slug: "services",
    label: "Услуги",
    fields: [
      {
        key: "cards",
        label: "Карточки услуг",
        type: "group",
        items: [
          { key: "name", label: "Название", type: "text" },
          { key: "description", label: "Описание", type: "textarea" },
          { key: "price", label: "Цена от", type: "text" },
          { key: "duration", label: "Срок от", type: "text" },
        ],
      },
    ],
  },
];

export default function AdminSitePagesPage() {
  const [active, setActive] = useState<PageConfig>(PAGE_CONFIGS[0]);
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.get(`/settings/public`).then(r => {
      const settings = r.data as Record<string, string>;
      const pageData: Record<string, any> = {};
      active.fields.forEach(f => {
        const key = `page.${active.slug}.${f.key}`;
        try { pageData[f.key] = JSON.parse(settings[key] ?? "null") ?? settings[key] ?? ""; }
        catch { pageData[f.key] = settings[key] ?? ""; }
      });
      setData(pageData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [active]);

  const save = async () => {
    setSaving(true);
    try {
      for (const [k, v] of Object.entries(data)) {
        const key = `page.${active.slug}.${k}`;
        await adminApi.patch(`/settings/${encodeURIComponent(key)}`, { value: typeof v === "string" ? v : JSON.stringify(v) });
      }
      toast.success("Страница сохранена");
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Страницы сайта</h1>
      <div className="flex gap-2 mb-6">
        {PAGE_CONFIGS.map(p => (
          <button key={p.slug} onClick={() => setActive(p)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active.slug === p.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : active.fields.map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
            {f.type === "text" && (
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20" value={data[f.key] ?? ""} onChange={e => setData(prev => ({ ...prev, [f.key]: e.target.value }))} />
            )}
            {f.type === "textarea" && (
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" rows={4} value={data[f.key] ?? ""} onChange={e => setData(prev => ({ ...prev, [f.key]: e.target.value }))} />
            )}
            {f.type === "group" && f.items && (
              <div className="space-y-3">
                {(Array.isArray(data[f.key]) ? data[f.key] : [{},{},{},{},{},{}]).map((item: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Карточка {idx+1}</p>
                    {f.items!.map(fi => (
                      <div key={fi.key}>
                        <label className="text-xs text-gray-500 mb-0.5 block">{fi.label}</label>
                        {fi.type === "text" ? (
                          <input className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item[fi.key] ?? ""} onChange={e => {
                            const arr = Array.isArray(data[f.key]) ? [...data[f.key]] : [{},{},{},{},{},{}];
                            arr[idx] = { ...arr[idx], [fi.key]: e.target.value };
                            setData(prev => ({ ...prev, [f.key]: arr }));
                          }} />
                        ) : (
                          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none resize-none" rows={2} value={item[fi.key] ?? ""} onChange={e => {
                            const arr = Array.isArray(data[f.key]) ? [...data[f.key]] : [{},{},{},{},{},{}];
                            arr[idx] = { ...arr[idx], [fi.key]: e.target.value };
                            setData(prev => ({ ...prev, [f.key]: arr }));
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
