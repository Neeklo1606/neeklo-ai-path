import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsPage } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  usePageTitle(isNew ? "Новая страница" : "Редактор страницы");

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [locale, setLocale] = useState("ru");
  const [published, setPublished] = useState(false);
  const [blocksText, setBlocksText] = useState("[]");
  const [metaText, setMetaText] = useState("{}");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: p } = await adminApi.get<CmsPage>(`/pages/${id}`);
        if (cancelled || !p) return;
        setSlug(p.slug);
        setTitle(p.title);
        setLocale(p.locale);
        setPublished(p.published);
        setBlocksText(JSON.stringify(p.blocks ?? [], null, 2));
        setMetaText(JSON.stringify(p.meta ?? {}, null, 2));
      } catch (e) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { error?: string })?.error || e.message
          : (e as Error).message;
        toast.error(msg);
        navigate("/admin/pages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, navigate]);

  const save = async () => {
    let blocks: unknown[];
    let meta: Record<string, unknown>;
    try {
      blocks = JSON.parse(blocksText);
      if (!Array.isArray(blocks)) throw new Error("blocks должен быть JSON-массивом");
      meta = JSON.parse(metaText);
      if (typeof meta !== "object" || meta === null) throw new Error("meta должен быть JSON-объектом");
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
    try {
      if (isNew) {
        const { data: created } = await adminApi.post<CmsPage>("/pages", {
          slug,
          title,
          locale,
          published,
          blocks,
          meta,
        });
        toast.success("Создано");
        navigate(`/admin/pages/${created.id}`, { replace: true });
      } else {
        await adminApi.patch(`/pages/${id}`, { slug, title, locale, published, blocks, meta });
        toast.success("Сохранено");
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  const remove = async () => {
    if (isNew || !id) return;
    if (!confirm("Удалить страницу?")) return;
    try {
      await adminApi.delete(`/pages/${id}`);
      toast.success("Удалено");
      navigate("/admin/pages");
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Загрузка…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold">{isNew ? "Новая страница" : "Редактор"}</h1>
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <Button variant="outline" className="rounded-xl border-red-200 text-red-700" onClick={remove}>
              Удалить
            </Button>
          )}
          <Button className="rounded-xl bg-[#0D0D0B]" onClick={save}>
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-[#E8E6E0] bg-white p-6">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl" placeholder="services" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Input id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch id="pub" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="pub">Опубликована</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blocks">Blocks (JSON)</Label>
          <textarea
            id="blocks"
            className="font-mono min-h-[280px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={blocksText}
            onChange={(e) => setBlocksText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta">Meta (JSON)</Label>
          <textarea
            id="meta"
            className="font-mono min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={metaText}
            onChange={(e) => setMetaText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
