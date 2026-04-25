import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  clearKnowledge,
  fetchOpenAiModels,
  getKnowledgeStats,
  ingestKnowledgeFile,
  ingestKnowledgeText,
} from "@/services/ai.service";

type AssistantRow = CmsAssistant & { provider_api_key?: string | null };

const MODEL_PRESETS = ["qwen2.5:7b", "mistral:7b", "llama3.2:3b", "phi3:mini"];
const OPENAI_MODEL_PRESETS = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "o4-mini"];

export default function AdminAssistantEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === "new";
  usePageTitle(isNew ? "Новый ассистент" : "Ассистент");

  const [name, setName] = useState("Site chat");
  const [provider, setProvider] = useState("ollama");
  /** OpenAI-compatible endpoint only; Ollama uses OLLAMA_URL on the server. */
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState("");
  const [model, setModel] = useState("qwen2.5:7b");
  const [embedModel, setEmbedModel] = useState("nomic-embed-text");
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [openAiModels, setOpenAiModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showAdvancedOpenAi, setShowAdvancedOpenAi] = useState(false);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [shownKey, setShownKey] = useState<string | null>(null);
  const [kbText, setKbText] = useState("");

  const statsQ = useQuery({
    queryKey: ["assistant", "kb-stats", id],
    queryFn: () => getKnowledgeStats(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    const rk = (location.state as { revealedKey?: string } | null)?.revealedKey;
    if (rk) setShownKey(rk);
  }, [location.state]);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: row } = await adminApi.get<AssistantRow>(`/assistants/${id}`);
        if (cancelled || !row) return;
        setName(row.name);
        setProvider(row.provider || "ollama");
        setOpenaiBaseUrl(row.provider === "openai" ? row.base_url || "" : "");
        setModel(row.model || "qwen2.5:7b");
        setEmbedModel(row.embed_model || "nomic-embed-text");
        setTemperature(typeof row.temperature === "number" ? row.temperature : 0.7);
        setSystemPrompt(row.system_prompt || "");
        setProviderApiKey(row.provider_api_key || "");
        setActive(row.active);
      } catch (e) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { error?: string })?.error || e.message
          : (e as Error).message;
        toast.error(msg);
        navigate("/admin/assistants");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, navigate]);

  useEffect(() => {
    if (provider !== "openai") return;
    if (!model || model === "qwen2.5:7b") {
      setModel("gpt-4o-mini");
    }
    if (!embedModel || embedModel === "nomic-embed-text") {
      setEmbedModel("text-embedding-3-small");
    }
  }, [provider, model, embedModel]);

  const save = async () => {
    try {
      if (isNew) {
        const { data: created } = await adminApi.post<AssistantRow & { api_key?: string }>("/assistants", {
          name,
          provider,
          base_url: provider === "openai" ? openaiBaseUrl || null : null,
          model,
          embed_model: embedModel,
          temperature,
          system_prompt: systemPrompt || null,
          provider_api_key: providerApiKey || null,
          active,
        });
        toast.success("Создано. Сохраните ключ сайта — он показывается один раз.");
        navigate(`/admin/assistants/${created.id}`, {
          replace: true,
          state: created.api_key ? { revealedKey: created.api_key } : undefined,
        });
      } else {
        await adminApi.patch(`/assistants/${id}`, {
          name,
          provider,
          base_url: provider === "openai" ? openaiBaseUrl || null : null,
          model,
          embed_model: embedModel,
          temperature,
          system_prompt: systemPrompt || null,
          provider_api_key: providerApiKey || null,
          active,
        });
        toast.success("Сохранено");
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  const regen = async () => {
    if (isNew || !id) return;
    try {
      const { data: out } = await adminApi.patch<{ api_key: string }>(`/assistants/${id}/regenerate-key`, {});
      setShownKey(out.api_key);
      toast.success("Новый ключ сайта сгенерирован");
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  const pushKbText = async () => {
    if (isNew || !id || !kbText.trim()) return;
    try {
      const r = await ingestKnowledgeText(id, kbText);
      toast.success(`В базу добавлено фрагментов: ${r.upserted}`);
      setKbText("");
      statsQ.refetch();
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  const onKbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (isNew || !id || !f) return;
    try {
      const r = await ingestKnowledgeFile(id, f);
      toast.success(`Файл: ${r.filename ?? f.name}, фрагментов: ${r.upserted}`);
      statsQ.refetch();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error || err.message
        : (err as Error).message;
      toast.error(msg);
    }
  };

  const onObsidianFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (isNew || !id || !files.length) return;
    const mdFiles = files.filter((f) => f.name.toLowerCase().endsWith(".md"));
    if (!mdFiles.length) {
      toast.error("В папке нет .md файлов");
      return;
    }
    let ok = 0;
    let failed = 0;
    for (const f of mdFiles) {
      try {
        await ingestKnowledgeFile(id, f);
        ok += 1;
      } catch {
        failed += 1;
      }
    }
    statsQ.refetch();
    if (failed === 0) toast.success(`Obsidian импорт: ${ok} файлов`);
    else toast.warning(`Obsidian импорт: ${ok} успешно, ${failed} с ошибкой`);
  };

  const wipeKb = async () => {
    if (isNew || !id) return;
    if (!confirm("Удалить всю базу знаний (Qdrant) для этого ассистента?")) return;
    try {
      await clearKnowledge(id);
      toast.success("База очищена");
      statsQ.refetch();
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

  const loadOpenAiModels = async () => {
    if (ollamaMode) return;
    if (!providerApiKey.trim()) {
      toast.error("Введите ключ провайдера");
      return;
    }
    setLoadingModels(true);
    try {
      const out = await fetchOpenAiModels({
        apiKey: providerApiKey.trim(),
        baseUrl: openaiBaseUrl.trim() || undefined,
      });
      setOpenAiModels(out.models || []);
      if (!out.models?.length) {
        toast.warning("Провайдер не вернул список моделей");
      } else {
        if (!model && out.models[0]) setModel(out.models[0]);
        toast.success(`Загружено моделей: ${out.models.length}`);
      }
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    } finally {
      setLoadingModels(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;

  const ollamaMode = provider === "ollama" || provider === "local";

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold">{isNew ? "Новый ассистент" : name}</h1>

      <div className="rounded-2xl border border-[#E8E6E0] bg-[#FAFAF8] p-4 text-sm space-y-2">
        <p className="font-heading font-bold text-[#0D0D0B]">Как работает ассистент</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
          <li>Введите system prompt.</li>
          <li>Подключите модель.</li>
          <li>Добавьте знания (ниже — текст и файлы в индекс).</li>
        </ol>
      </div>

      {shownKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">Ключ API сайта (nk_…)</p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-xs">{shownKey}</code>
          <p className="mt-2 text-amber-800">
            Публичный чат на сайте использует активного ассистента (включите «Активен»); отдельный ключ в настройках CMS не нужен.
          </p>
        </div>
      )}

      <div className="grid gap-6 rounded-2xl border border-[#E8E6E0] bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="nm">Имя</Label>
          <Input id="nm" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pr">Провайдер</Label>
            <select
              id="pr"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="ollama">Ollama (локально, RAG)</option>
              <option value="openai">OpenAI API (рекомендуется)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="md">Модель чата</Label>
            <Input id="md" value={model} onChange={(e) => setModel(e.target.value)} className="rounded-xl" list="chat-models" />
            {!ollamaMode && (
              <p className="text-xs text-muted-foreground">
                Нажмите «Загрузить доступные модели», чтобы выбрать модель из вашего аккаунта автоматически.
              </p>
            )}
            <datalist id="chat-models">
              {(ollamaMode ? MODEL_PRESETS : [...OPENAI_MODEL_PRESETS, ...openAiModels]).map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        </div>
        {ollamaMode && (
          <div className="space-y-2">
            <Label htmlFor="em">Модель эмбеддингов (Nomic)</Label>
            <Input
              id="em"
              value={embedModel}
              onChange={(e) => setEmbedModel(e.target.value)}
              className="rounded-xl"
              placeholder="nomic-embed-text"
            />
          </div>
        )}
        {ollamaMode && (
          <div className="space-y-3">
            <div className="flex justify-between gap-2">
              <Label htmlFor="temp">Temperature (Ollama)</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{temperature.toFixed(2)}</span>
            </div>
            <Slider
              id="temp"
              min={0}
              max={1.5}
              step={0.05}
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0] ?? 0.7)}
              className="py-1"
            />
          </div>
        )}
        {!ollamaMode && (
          <div className="space-y-2">
            <Label htmlFor="pk">Ключ провайдера</Label>
            <Input
              id="pk"
              type="password"
              autoComplete="new-password"
              value={providerApiKey}
              onChange={(e) => setProviderApiKey(e.target.value)}
              className="rounded-xl"
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              Для OpenAI просто укажите ключ. Адрес API менять не нужно в большинстве случаев.
            </p>
          </div>
        )}
        {!ollamaMode && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={loadOpenAiModels} disabled={loadingModels}>
              {loadingModels ? "Загружаю модели..." : "Загрузить доступные модели"}
            </Button>
            {openAiModels.length > 0 && (
              <p className="text-sm text-muted-foreground self-center">Доступно: {openAiModels.length}</p>
            )}
          </div>
        )}
        {!ollamaMode && (
          <div className="space-y-2 rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] p-3">
            <button
              type="button"
              className="text-sm font-medium underline underline-offset-4"
              onClick={() => setShowAdvancedOpenAi((v) => !v)}
            >
              {showAdvancedOpenAi ? "Скрыть расширенные настройки API" : "Показать расширенные настройки API"}
            </button>
            {showAdvancedOpenAi && (
              <div className="space-y-2">
                <Label htmlFor="base">Адрес API (опционально)</Label>
                <Input
                  id="base"
                  value={openaiBaseUrl}
                  onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                  className="rounded-xl"
                  placeholder="https://api.openai.com/v1"
                />
                <p className="text-xs text-muted-foreground">
                  Нужен только для сторонних OpenAI-совместимых сервисов (OpenRouter, Together, Groq и т.д.).
                </p>
              </div>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="sp">System prompt</Label>
          <textarea
            id="sp"
            className="min-h-[140px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="act" checked={active} onCheckedChange={setActive} />
          <Label htmlFor="act">Активен</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl bg-[#0D0D0B]" onClick={save}>
            Сохранить
          </Button>
          {!isNew && (
            <Button variant="outline" className="rounded-xl" onClick={regen}>
              Новый ключ сайта
            </Button>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="grid gap-6 rounded-2xl border border-[#E8E6E0] bg-white p-6">
          <h2 className="font-heading text-lg font-extrabold">База знаний (Obsidian / файлы / RAG)</h2>
          <p className="text-sm text-muted-foreground">
            Добавляйте заметки из Obsidian или файлы: текст режется на чанки, индексируется и используется в ответах.
            Эмбеддинги: <code className="text-xs">{embedModel}</code>. Коллекция: <code className="text-xs">{statsQ.data?.collection ?? "…"}</code>.
            Точек: <strong>{statsQ.isLoading ? "…" : statsQ.data?.points ?? 0}</strong>
          </p>
          <div className="space-y-2">
            <Label htmlFor="kb">Добавить текст</Label>
            <textarea
              id="kb"
              className="min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={kbText}
              onChange={(e) => setKbText(e.target.value)}
              placeholder="Вставьте статью, FAQ, описание продуктов…"
            />
            <Button type="button" variant="secondary" className="rounded-xl" onClick={pushKbText} disabled={!kbText.trim()}>
              Отправить в индекс
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kbfile">Загрузить файл (PDF, TXT, DOCX)</Label>
            <Input id="kbfile" type="file" accept=".pdf,.txt,.md,.docx" className="cursor-pointer" onChange={onKbFile} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obsidianFolder">Импорт Obsidian vault (папка с .md)</Label>
            <Input
              id="obsidianFolder"
              type="file"
              className="cursor-pointer"
              // @ts-expect-error non-standard attribute supported in Chromium browsers
              webkitdirectory=""
              // @ts-expect-error non-standard attribute supported in Chromium browsers
              directory=""
              multiple
              onChange={onObsidianFolder}
            />
          </div>
          <Button type="button" variant="outline" className="rounded-xl border-red-200 text-red-800" onClick={wipeKb}>
            Очистить базу знаний
          </Button>
        </div>
      )}
    </div>
  );
}
