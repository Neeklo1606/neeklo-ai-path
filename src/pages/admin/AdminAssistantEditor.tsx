import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type AssistantRow = CmsAssistant & { provider_api_key?: string | null };

export default function AdminAssistantEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === "new";
  usePageTitle(isNew ? "Новый ассистент" : "Ассистент");

  const [name, setName] = useState("Site chat");
  const [provider, setProvider] = useState("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [shownKey, setShownKey] = useState<string | null>(null);

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
        setProvider(row.provider);
        setBaseUrl(row.base_url || "");
        setModel(row.model);
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

  const save = async () => {
    try {
      if (isNew) {
        const { data: created } = await adminApi.post<AssistantRow & { api_key?: string }>("/assistants", {
          name,
          provider,
          base_url: baseUrl || null,
          model,
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
          base_url: baseUrl || null,
          model,
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

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold">{isNew ? "Новый ассистент" : name}</h1>

      {shownKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">Ключ API сайта (nk_…)</p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-xs">{shownKey}</code>
          <p className="mt-2 text-amber-800">Добавьте в настройки CMS ключ public.chat.site_api_key (публичная настройка) для чата на сайте.</p>
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
            <Input id="pr" value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="md">Модель</Label>
            <Input id="md" value={model} onChange={(e) => setModel(e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bu">Base URL (пусто = OpenAI)</Label>
          <Input id="bu" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="rounded-xl" placeholder="https://api.openai.com/v1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pk">Ключ провайдера (OpenAI и т.д.)</Label>
          <Input
            id="pk"
            type="password"
            autoComplete="new-password"
            value={providerApiKey}
            onChange={(e) => setProviderApiKey(e.target.value)}
            className="rounded-xl"
            placeholder="sk-..."
          />
        </div>
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
    </div>
  );
}
