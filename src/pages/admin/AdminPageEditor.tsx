import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsPage, CmsPageVersionSummary } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  VisualBlocksEditor,
  wrapBlocksFromJson,
  unwrapBlocks,
  type WrappedBlock,
} from "@/components/admin/page-builder/VisualBlocksEditor";
import { MetaVisualEditor } from "@/components/admin/page-builder/MetaVisualEditor";
import { validateNoExternalImageFieldsClient } from "@/lib/cms-page-strict";
import { collectPageSchemaIssues } from "@/lib/block-schemas";
import { PageContentDiffView } from "@/components/admin/JsonDiffView";

const AUTOSAVE_MS = 16000;

type EditorState = {
  blockRows: WrappedBlock[];
  meta: Record<string, unknown>;
  slug: string;
  title: string;
  locale: string;
  published: boolean;
  isDraft: boolean;
};

function snapshotFromState(s: EditorState): string {
  return JSON.stringify({
    slug: s.slug,
    title: s.title,
    locale: s.locale,
    published: s.published,
    isDraft: s.isDraft,
    blocks: unwrapBlocks(s.blockRows),
    meta: s.meta,
  });
}

type Snapshot = { blocks: unknown; meta: unknown };

export default function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  usePageTitle(isNew ? "Новая страница" : "Редактор страницы");

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [locale, setLocale] = useState("ru");
  const [published, setPublished] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [blockRows, setBlockRows] = useState<WrappedBlock[]>(() => wrapBlocksFromJson([]));
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(!isNew);
  const [versions, setVersions] = useState<CmsPageVersionSummary[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeftId, setCompareLeftId] = useState<string | "current">("current");
  const [compareRightId, setCompareRightId] = useState<string | "current">("current");
  const [comparePair, setComparePair] = useState<{ left: Snapshot; right: Snapshot } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [restorePreviewOpen, setRestorePreviewOpen] = useState(false);
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
  const [restorePair, setRestorePair] = useState<{ current: Snapshot; target: Snapshot } | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const [lastAutosaveAt, setLastAutosaveAt] = useState<number | null>(null);

  const lastSavedRef = useRef<string>("");
  const savingRef = useRef(false);
  const stateRef = useRef<EditorState>({
    blockRows,
    meta,
    slug,
    title,
    locale,
    published,
    isDraft,
  });

  useEffect(() => {
    stateRef.current = { blockRows, meta, slug, title, locale, published, isDraft };
  }, [blockRows, meta, slug, title, locale, published, isDraft]);

  const loadVersions = useCallback(async () => {
    if (!id || isNew) return;
    try {
      const { data } = await adminApi.get<CmsPageVersionSummary[]>(`/pages/${id}/versions`);
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      setVersions([]);
    }
  }, [id, isNew]);

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
        setIsDraft(!!p.is_draft);
        const rows = wrapBlocksFromJson(p.blocks ?? []);
        setBlockRows(rows);
        const m = p.meta;
        setMeta(typeof m === "object" && m !== null && !Array.isArray(m) ? (m as Record<string, unknown>) : {});
        lastSavedRef.current = snapshotFromState({
          slug: p.slug,
          title: p.title,
          locale: p.locale,
          published: p.published,
          isDraft: !!p.is_draft,
          blockRows: rows,
          meta:
            typeof m === "object" && m !== null && !Array.isArray(m) ? (m as Record<string, unknown>) : {},
        });
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

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const resolveSnapshot = useCallback(
    async (which: string | "current"): Promise<Snapshot> => {
      if (which === "current") {
        const s = stateRef.current;
        return { blocks: unwrapBlocks(s.blockRows), meta: s.meta };
      }
      if (!id) throw new Error("No page id");
      const { data } = await adminApi.get<{ blocks: unknown; meta: unknown }>(`/pages/${id}/versions/${which}`);
      return { blocks: data.blocks, meta: data.meta };
    },
    [id],
  );

  const refreshCompare = useCallback(async () => {
    if (!id || isNew) return;
    setCompareLoading(true);
    try {
      const [left, right] = await Promise.all([resolveSnapshot(compareLeftId), resolveSnapshot(compareRightId)]);
      setComparePair({ left, right });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setCompareLoading(false);
    }
  }, [id, isNew, compareLeftId, compareRightId, resolveSnapshot]);

  useEffect(() => {
    if (!compareOpen || !id || isNew) return;
    let cancelled = false;
    (async () => {
      setCompareLoading(true);
      try {
        const [left, right] = await Promise.all([resolveSnapshot(compareLeftId), resolveSnapshot(compareRightId)]);
        if (!cancelled) setComparePair({ left, right });
      } catch (e) {
        if (!cancelled) {
          const msg = axios.isAxiosError(e)
            ? (e.response?.data as { error?: string })?.error || e.message
            : (e as Error).message;
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setCompareLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [compareOpen, compareLeftId, compareRightId, id, isNew, resolveSnapshot]);

  useEffect(() => {
    if (!isNew && id && !loading) {
      const t = window.setInterval(() => {
        if (savingRef.current) return;
        const cur = snapshotFromState(stateRef.current);
        if (cur === lastSavedRef.current) return;
        const s = stateRef.current;
        const blocks = unwrapBlocks(s.blockRows);
        const strict = validateNoExternalImageFieldsClient(blocks, s.meta);
        if (!strict.ok) return;
        const schemaIssues = collectPageSchemaIssues(blocks);
        if (schemaIssues.length > 0) return;
        savingRef.current = true;
        (async () => {
          try {
            const { data: updated } = await adminApi.patch<CmsPage>(`/pages/${id}`, {
              autosave: true,
              slug: s.slug,
              title: s.title,
              locale: s.locale,
              published: s.published,
              isDraft: s.isDraft,
              blocks,
              meta: s.meta,
            });
            applyPagePayload(updated);
            lastSavedRef.current = snapshotFromState({
              slug: updated.slug,
              title: updated.title,
              locale: updated.locale,
              published: updated.published,
              isDraft: !!updated.is_draft,
              blockRows: wrapBlocksFromJson(updated.blocks ?? []),
              meta:
                typeof updated.meta === "object" && updated.meta !== null && !Array.isArray(updated.meta)
                  ? (updated.meta as Record<string, unknown>)
                  : {},
            });
            setLastAutosaveAt(Date.now());
            await loadVersions();
          } catch {
            /* silent — сеть / валидация на сервере */
          } finally {
            savingRef.current = false;
          }
        })();
      }, AUTOSAVE_MS);
      return () => window.clearInterval(t);
    }
    return undefined;
  }, [isNew, id, loading, loadVersions]);

  const applyPagePayload = (p: CmsPage) => {
    setSlug(p.slug);
    setTitle(p.title);
    setLocale(p.locale);
    setPublished(p.published);
    setIsDraft(!!p.is_draft);
    setBlockRows(wrapBlocksFromJson(p.blocks ?? []));
    const m = p.meta;
    setMeta(typeof m === "object" && m !== null && !Array.isArray(m) ? (m as Record<string, unknown>) : {});
  };

  const save = async () => {
    const blocks = unwrapBlocks(blockRows);
    const strict = validateNoExternalImageFieldsClient(blocks, meta);
    if (strict.ok === false) {
      toast.error(strict.error);
      return;
    }
    const schemaIssues = collectPageSchemaIssues(blocks);
    if (schemaIssues.length > 0) {
      toast.error(
        schemaIssues
          .slice(0, 6)
          .map((x) => `${x.path}: ${x.message}`)
          .join(" · "),
      );
      return;
    }
    savingRef.current = true;
    try {
      if (isNew) {
        const { data: created } = await adminApi.post<CmsPage>("/pages", {
          slug,
          title,
          locale,
          published,
          isDraft,
          blocks,
          meta,
        });
        toast.success("Создано");
        navigate(`/admin/pages/${created.id}`, { replace: true });
      } else {
        const { data: updated } = await adminApi.patch<CmsPage>(`/pages/${id}`, {
          slug,
          title,
          locale,
          published,
          isDraft,
          blocks,
          meta,
        });
        applyPagePayload(updated);
        lastSavedRef.current = snapshotFromState({
          slug: updated.slug,
          title: updated.title,
          locale: updated.locale,
          published: updated.published,
          isDraft: !!updated.is_draft,
          blockRows: wrapBlocksFromJson(updated.blocks ?? []),
          meta:
            typeof updated.meta === "object" && updated.meta !== null && !Array.isArray(updated.meta)
              ? (updated.meta as Record<string, unknown>)
              : {},
        });
        toast.success("Сохранено");
        await loadVersions();
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      savingRef.current = false;
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

  const openCompare = (versionId: string) => {
    setCompareLeftId(versionId);
    setCompareRightId("current");
    setComparePair(null);
    setCompareOpen(true);
  };

  const openRestorePreview = async (versionId: string) => {
    if (!id) return;
    setRestoreVersionId(versionId);
    setRestorePair(null);
    setRestorePreviewOpen(true);
    setRestoreLoading(true);
    try {
      const { data } = await adminApi.get<{ blocks: unknown; meta: unknown }>(`/pages/${id}/versions/${versionId}`);
      const current: Snapshot = {
        blocks: unwrapBlocks(stateRef.current.blockRows),
        meta: stateRef.current.meta,
      };
      setRestorePair({
        current,
        target: { blocks: data.blocks, meta: data.meta },
      });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
      setRestorePreviewOpen(false);
    } finally {
      setRestoreLoading(false);
    }
  };

  const confirmRestore = async () => {
    if (!id || !restoreVersionId) return;
    savingRef.current = true;
    try {
      const { data } = await adminApi.post<CmsPage>(`/pages/${id}/restore/${restoreVersionId}`);
      applyPagePayload(data);
      lastSavedRef.current = snapshotFromState({
        slug: data.slug,
        title: data.title,
        locale: data.locale,
        published: data.published,
        isDraft: !!data.is_draft,
        blockRows: wrapBlocksFromJson(data.blocks ?? []),
        meta:
          typeof data.meta === "object" && data.meta !== null && !Array.isArray(data.meta)
            ? (data.meta as Record<string, unknown>)
            : {},
      });
      toast.success("Версия восстановлена");
      setRestorePreviewOpen(false);
      setRestoreVersionId(null);
      setRestorePair(null);
      await loadVersions();
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      savingRef.current = false;
    }
  };

  const versionLabel = (v: CmsPageVersionSummary) => {
    const t = new Date(v.created_at).toLocaleString();
    const tag = v.is_auto ? "авто" : "вручную";
    return `${t} · ${tag}`;
  };

  if (loading) {
    return <p className="text-muted-foreground">Загрузка…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">{isNew ? "Новая страница" : "Редактор"}</h1>
          {!isNew && lastAutosaveAt != null && (
            <p className="text-xs text-muted-foreground mt-1">
              Последнее автосохранение: {new Date(lastAutosaveAt).toLocaleTimeString()}
            </p>
          )}
        </div>
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
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch id="draft" checked={isDraft} onCheckedChange={setIsDraft} />
            <Label htmlFor="draft">Черновик (скрыта с публичного сайта)</Label>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Блоки страницы</Label>
          <p className="text-xs text-muted-foreground">Редактирование без JSON: перетаскивание, дублирование, медиа через кнопку.</p>
          <VisualBlocksEditor rows={blockRows} onRowsChange={setBlockRows} />
        </div>

        <div className="space-y-3">
          <Label>Meta</Label>
          <MetaVisualEditor meta={meta} onChange={setMeta} />
        </div>
      </div>

      {!isNew && id ? (
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-3">
          <Label>История версий</Label>
          <p className="text-xs text-muted-foreground">
            Перед каждым сохранением текущие blocks/meta копируются в историю. Автосохранение (~16 с) помечается как «авто».
            Откат не удаляет записи — перед восстановлением текущее состояние тоже сохраняется.
          </p>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет снимков: первое сохранение создаёт первую запись в истории.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm bg-muted/30">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground truncate">{v.id.slice(0, 8)}…</span>
                    <span className="text-xs">
                      <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                      <span
                        className={
                          v.is_auto
                            ? " ml-2 rounded-md bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase"
                            : " ml-2 rounded-md bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] uppercase"
                        }
                      >
                        {v.is_auto ? "авто" : "вручную"}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => openCompare(v.id)}>
                      Сравнить
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-lg h-8 text-xs"
                      onClick={() => openRestorePreview(v.id)}
                    >
                      Откатить
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Сравнение версий (blocks + meta)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Выберите две точки: «текущий редактор» — несохранённые правки. Нажмите «Обновить», если меняли контент при открытом окне.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Было (A)</Label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={compareLeftId}
                onChange={(e) => {
                  const v = e.target.value;
                  setCompareLeftId(v === "current" ? "current" : v);
                }}
              >
                <option value="current">Текущий редактор</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {versionLabel(v)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Стало (B)</Label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={compareRightId}
                onChange={(e) => {
                  const v = e.target.value;
                  setCompareRightId(v === "current" ? "current" : v);
                }}
              >
                <option value="current">Текущий редактор</option>
                {versions.map((v) => (
                  <option key={`r-${v.id}`} value={v.id}>
                    {versionLabel(v)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" className="self-start rounded-lg" onClick={() => void refreshCompare()}>
            Обновить сравнение
          </Button>
          <div className="min-h-0 flex-1 overflow-auto">
            {compareLoading ? (
              <p className="text-sm text-muted-foreground py-6">Загрузка…</p>
            ) : comparePair ? (
              <PageContentDiffView
                before={comparePair.left}
                after={comparePair.right}
                beforeLabel="A"
                afterLabel="B"
              />
            ) : (
              <p className="text-sm text-muted-foreground py-6">Нет данных для сравнения.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={restorePreviewOpen} onOpenChange={setRestorePreviewOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Предпросмотр отката</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ниже — отличия между текущим содержимым редактора и выбранной версией (на момент открытия окна). После
                  подтверждения страница примет blocks/meta из истории; текущее состояние попадёт в историю отдельной записью.
                </p>
                {restoreLoading ? (
                  <p className="text-sm">Загрузка…</p>
                ) : restorePair ? (
                  <PageContentDiffView
                    before={restorePair.current}
                    after={restorePair.target}
                    beforeLabel="Сейчас в редакторе"
                    afterLabel="Будет из версии"
                  />
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
            <Button type="button" className="rounded-xl bg-[#0D0D0B]" onClick={() => void confirmRestore()} disabled={restoreLoading || !restorePair}>
              Подтвердить откат
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
