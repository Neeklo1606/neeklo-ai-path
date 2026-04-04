import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsMedia } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function AdminMediaPage() {
  usePageTitle("CMS — медиа");
  const qc = useQueryClient();
  const [dragOver, setDragOver] = useState(false);

  const q = useQuery({
    queryKey: ["cms", "media", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsMedia[]>("/media");
      return data;
    },
  });

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("alt", file.name);
        await adminApi.post<CmsMedia>("/media/upload", fd);
        toast.success(`Загружено: ${file.name}`);
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { error?: string })?.error || err.message
          : (err as Error).message;
        toast.error(msg);
      }
    }
    qc.invalidateQueries({ queryKey: ["cms", "media"] });
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await uploadFiles(files);
    e.target.value = "";
  };

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files?.length) await uploadFiles(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- qc stable
    [qc]
  );

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL скопирован");
  };

  const del = async (id: string) => {
    if (!confirm("Удалить файл?")) return;
    try {
      await adminApi.delete(`/media/${id}`);
      toast.success("Удалено");
      qc.invalidateQueries({ queryKey: ["cms", "media"] });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error || err.message
        : (err as Error).message;
      toast.error(msg);
    }
  };

  if (q.isLoading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (q.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{(q.error as Error).message}</div>
    );
  }

  const items = q.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Медиа</h1>
        <div>
          <Input type="file" multiple className="hidden" id="up" onChange={onPick} />
          <Button asChild className="rounded-xl bg-[#0D0D0B]">
            <label htmlFor="up" className="cursor-pointer">
              Выбрать файлы
            </label>
          </Button>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver ? "border-[#0052FF] bg-[#EEF3FF]" : "border-[#E0E0E0] bg-[#FAFAF8]"
        }`}
      >
        <Upload className="h-8 w-8 text-[#6A6860]" />
        <p className="text-center text-sm font-semibold text-[#0D0D0B]">Перетащите файлы сюда</p>
        <p className="text-center text-xs text-muted-foreground">или нажмите «Выбрать файлы» (до 15 МБ на файл)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <div key={m.id} className="space-y-3 rounded-2xl border border-[#E8E6E0] bg-white p-4">
            <div className="aspect-video overflow-hidden rounded-xl bg-[#F5F5F5]">
              {m.mime?.startsWith("image/") ? (
                <img src={m.public_url} alt={m.alt || ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{m.mime || "file"}</div>
              )}
            </div>
            <p className="truncate font-mono text-xs text-muted-foreground">{m.public_url}</p>
            <p className="text-xs text-muted-foreground">
              Используется на страницах: <span className="font-semibold text-foreground">{m.usage_count ?? 0}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => copy(m.public_url)}>
                Копировать URL
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg border-red-200 text-red-700" onClick={() => del(m.id)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-muted-foreground">Пока нет файлов.</p>}
    </div>
  );
}
