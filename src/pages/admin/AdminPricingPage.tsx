import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ServicePrice {
  id: string;
  title: string;
  description: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["general", "Сайты", "AI-агенты", "Видео", "SMM", "SEO", "Дизайн", "Другое"];

const emptyForm = (): Omit<ServicePrice, "id" | "createdAt" | "updatedAt"> => ({
  title: "",
  description: "",
  priceFrom: null,
  priceTo: null,
  currency: "RUB",
  category: "general",
  isActive: true,
  sortOrder: 0,
});

function formatPrice(from: number | null, to: number | null, currency: string) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  if (from && to) return `${fmt(from)} – ${fmt(to)} ${currency}`;
  if (from) return `от ${fmt(from)} ${currency}`;
  if (to) return `до ${fmt(to)} ${currency}`;
  return "по запросу";
}

export default function AdminPricingPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const { data: prices = [], isLoading } = useQuery<ServicePrice[]>({
    queryKey: ["admin-prices"],
    queryFn: () => adminApi.get("/admin/prices").then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: typeof form) => adminApi.post("/admin/prices", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-prices"] });
      toast.success("Услуга добавлена и добавлена в базу знаний агента");
      setCreating(false);
      setForm(emptyForm());
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Ошибка";
      toast.error(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      adminApi.put(`/admin/prices/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-prices"] });
      toast.success("Услуга обновлена");
      setEditing(null);
    },
    onError: () => toast.error("Ошибка обновления"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/prices/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-prices"] });
      toast.success("Удалено");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  function startEdit(p: ServicePrice) {
    setEditing(p.id);
    setCreating(false);
    setForm({
      title: p.title,
      description: p.description || "",
      priceFrom: p.priceFrom,
      priceTo: p.priceTo,
      currency: p.currency,
      category: p.category,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm());
  }

  function PriceForm({ onSubmit, loading }: { onSubmit: () => void; loading: boolean }) {
    return (
      <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Название *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Создание сайта под ключ"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Цена от (₽)</label>
            <Input
              type="number"
              value={form.priceFrom ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, priceFrom: e.target.value ? Number(e.target.value) : null }))}
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Цена до (₽)</label>
            <Input
              type="number"
              value={form.priceTo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, priceTo: e.target.value ? Number(e.target.value) : null }))}
              placeholder="150000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Категория</label>
            <select
              className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm bg-white"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Порядок</label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Описание</label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Разработка корпоративного сайта с AI-чатом, CRM-интеграцией..."
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-600">Активна (видна публично)</label>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={onSubmit} disabled={loading || !form.title}>
            <Check size={14} className="mr-1" />
            {loading ? "Сохраняем..." : "Сохранить"}
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEdit}>
            <X size={14} className="mr-1" />Отмена
          </Button>
        </div>
      </div>
    );
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = prices.filter((p) => p.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, ServicePrice[]>);

  // Prices with unknown categories
  const knownCats = new Set(CATEGORIES);
  const otherCat = prices.filter((p) => !knownCats.has(p.category));
  if (otherCat.length) grouped["Прочее"] = otherCat;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Прайс услуг</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Услуги автоматически добавляются в базу знаний AI-агента
          </p>
        </div>
        {!creating && (
          <Button onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm()); }}>
            <Plus size={15} className="mr-1" />Добавить услугу
          </Button>
        )}
      </div>

      {creating && (
        <div className="mb-6">
          <PriceForm
            onSubmit={() => createMut.mutate(form)}
            loading={createMut.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Загрузка...</div>
      ) : prices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">Прайс пуст</p>
          <p className="text-sm mt-1">Добавьте первую услугу</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{cat}</h2>
              <div className="space-y-2">
                {items.map((price) => (
                  <div key={price.id}>
                    {editing === price.id ? (
                      <PriceForm
                        onSubmit={() => updateMut.mutate({ id: price.id, data: form })}
                        loading={updateMut.isPending}
                      />
                    ) : (
                      <div className={`flex items-start gap-4 p-4 rounded-lg border ${price.isActive ? "bg-white border-gray-200" : "bg-gray-50 border-dashed border-gray-200 opacity-60"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">{price.title}</span>
                            {!price.isActive && (
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">неактивна</span>
                            )}
                          </div>
                          {price.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{price.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(price.priceFrom, price.priceTo, price.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(price)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Удалить услугу?")) deleteMut.mutate(price.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
