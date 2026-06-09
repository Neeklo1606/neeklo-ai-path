import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Bot, BotOff, RefreshCw, ExternalLink, ChevronRight } from "lucide-react";

type AvitoAccount = {
  id: string;
  name: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  webhookSecret: string;
  isActive: boolean;
};

type AgentBinding = {
  agentId: string;
  avitoAccountId: string;
};

type AvitoConfig = {
  webhookBaseUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  accounts: AvitoAccount[];
  agentBindings: AgentBinding[];
};

type AvitoEvent = {
  id: string;
  at: string;
  eventType: string;
  payload?: unknown;
  reason?: string;
};

type LooseObject = Record<string, unknown>;

const emptyAccount = (): AvitoAccount => ({
  id: crypto.randomUUID(),
  name: "",
  accountId: "",
  clientId: "",
  clientSecret: "",
  accessToken: "",
  refreshToken: "",
  tokenExpiresAt: "",
  webhookSecret: "",
  isActive: false,
});

const emptyConfig = (): AvitoConfig => ({
  webhookBaseUrl: "",
  telegramBotToken: "",
  telegramChatId: "",
  telegramEnabled: false,
  accounts: [],
  agentBindings: [],
});

function shortJson(v: unknown) {
  try {
    const s = JSON.stringify(v, null, 2);
    return s.length > 700 ? `${s.slice(0, 700)}…` : s;
  } catch {
    return String(v ?? "");
  }
}

function avitoList(data: LooseObject | undefined, keys: string[]) {
  if (!data) return [] as LooseObject[];
  for (const key of keys) {
    const val = data[key];
    if (Array.isArray(val)) return val as LooseObject[];
  }
  const result = data.result as LooseObject | undefined;
  if (result) {
    for (const key of keys) {
      const val = result[key];
      if (Array.isArray(val)) return val as LooseObject[];
    }
  }
  return [] as LooseObject[];
}

function avitoChatTitle(chat: LooseObject, idx: number) {
  const users = Array.isArray(chat.users) ? (chat.users as LooseObject[]) : [];
  const peer = users.find((u) => u.name) || users[0];
  const ctx = chat.context as LooseObject | undefined;
  const ctxVal = ctx?.value as LooseObject | undefined;
  return String(
    chat.title ??
      chat.user_name ??
      peer?.name ??
      ctxVal?.title ??
      ctx?.title ??
      `Чат ${idx + 1}`,
  );
}

function avitoMessageText(message: LooseObject) {
  const content = message.content;
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    const obj = content as LooseObject;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.value === "string") return obj.value;
  }
  return String(message.text ?? message.message ?? "");
}

function AvitoItemDetail({ item }: { item: LooseObject }) {
  const images: string[] = (() => {
    const imgs = item.images ?? item.image ?? [];
    if (Array.isArray(imgs)) {
      return imgs.flatMap((img: LooseObject) => {
        const urls = img?.sizes ?? img?.urls ?? [];
        if (Array.isArray(urls) && urls.length > 0) {
          const best = urls[urls.length - 1];
          return typeof best === "string" ? [best] : typeof best?.url === "string" ? [best.url] : [];
        }
        if (typeof img === "string") return [img];
        if (typeof img?.url === "string") return [img.url];
        return [];
      });
    }
    return [];
  })();

  const fields: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: "ID", value: String(item.id ?? item.item_id ?? "—") },
    { label: "Категория", value: item.category?.name ?? item.category_id ?? null },
    { label: "Статус", value: item.status ?? item.state ?? null },
    { label: "Цена", value: item.price_string ? String(item.price_string) : item.price != null ? `${item.price} ₽` : null },
    { label: "Адрес", value: item.address ?? item.location?.address ?? null },
    { label: "Регион", value: item.region?.name ?? null },
    { label: "Просмотры", value: item.stats?.views ?? item.views ?? null },
    { label: "Контакты", value: item.stats?.calls ?? null },
    { label: "Избранное", value: item.stats?.favorites ?? null },
    { label: "Дата размещения", value: item.time_created ? new Date(item.time_created * 1000).toLocaleString("ru-RU") : null },
    { label: "Обновлено", value: item.time_changed ? new Date(item.time_changed * 1000).toLocaleString("ru-RU") : null },
    { label: "Дата окончания", value: item.expired_at ?? item.time_expired ? new Date((item.expired_at ?? item.time_expired) * 1000).toLocaleString("ru-RU") : null },
    { label: "URL", value: null },
  ].filter(f => f.label !== "URL");

  const params: Array<{ name: string; value: string }> = Array.isArray(item.params)
    ? item.params.map((p: LooseObject) => ({ name: String(p.name ?? p.title ?? ""), value: String(p.value ?? "") }))
    : [];

  return (
    <div className="p-5 space-y-5">
      {/* Images */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, 8).map((src, i) => (
            <img key={i} src={src} alt={`фото ${i + 1}`} className="h-28 w-28 rounded-lg object-cover flex-shrink-0 border border-[#EEE]" />
          ))}
        </div>
      )}

      {/* Title */}
      <div>
        <h3 className="font-semibold text-base text-[#0D0D0B] leading-snug">
          {String(item.title ?? item.name ?? "Без заголовка")}
        </h3>
        {item.url && (
          <a href={String(item.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
            <ExternalLink size={10} /> Открыть на Avito
          </a>
        )}
      </div>

      {/* Description */}
      {(item.description ?? item.body) && (
        <div>
          <p className="text-xs font-semibold text-[#6A6860] uppercase tracking-wide mb-1">Описание</p>
          <p className="text-sm text-[#3C3A34] whitespace-pre-line leading-relaxed">
            {String(item.description ?? item.body ?? "")}
          </p>
        </div>
      )}

      {/* Main fields */}
      <div className="grid grid-cols-2 gap-2">
        {fields.filter(f => f.value != null).map(f => (
          <div key={f.label} className="rounded-lg bg-[#FAFAF8] border border-[#EEE] px-3 py-2">
            <p className="text-xs text-[#6A6860]">{f.label}</p>
            <p className="text-sm font-medium text-[#0D0D0B] mt-0.5 truncate">{String(f.value)}</p>
          </div>
        ))}
      </div>

      {/* Extra params */}
      {params.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6A6860] uppercase tracking-wide mb-2">Параметры</p>
          <div className="grid grid-cols-2 gap-1.5">
            {params.map((p, i) => (
              <div key={i} className="flex gap-1 text-xs">
                <span className="text-[#6A6860] shrink-0">{p.name}:</span>
                <span className="font-medium text-[#0D0D0B]">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON fallback for any other fields */}
      {Object.keys(item).some(k => !["id","item_id","title","name","description","body","url","images","image","price","price_string","status","state","category","category_id","address","location","region","stats","views","time_created","time_changed","expired_at","time_expired","params"].includes(k)) && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[#6A6860] hover:text-[#0D0D0B]">Показать все поля</summary>
          <pre className="mt-2 rounded-lg bg-[#F5F3EE] p-3 overflow-auto text-[11px] text-[#3C3A34]">
            {JSON.stringify(item, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function AdminAvitoPage() {
  usePageTitle("Avito — интеграция");
  const { section } = useParams<{ section?: string }>();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<AvitoConfig>(emptyConfig());
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [agentIdForWebhook, setAgentIdForWebhook] = useState("");
  const [webhookBaseUrlOverride, setWebhookBaseUrlOverride] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [configStatus, setConfigStatus] = useState<{ kind: "idle" | "saving" | "success" | "error"; message: string }>({
    kind: "idle",
    message: "",
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [agentEnabled, setAgentEnabled] = useState<boolean>(false);
  const [agentSaving, setAgentSaving] = useState(false);

  const configQ = useQuery({
    queryKey: ["avito", "config"],
    queryFn: async () => {
      const { data } = await adminApi.get<AvitoConfig>("/avito/config");
      return data;
    },
    refetchOnWindowFocus: false,
  });

  const eventsQ = useQuery({
    queryKey: ["avito", "events"],
    queryFn: async () => {
      const { data } = await adminApi.get<AvitoEvent[]>("/avito/events");
      return data;
    },
    refetchInterval: 5000,
  });

  const tokenCheckQ = useQuery({
    queryKey: ["avito", "token-check", activeAccountId],
    enabled: false,
    queryFn: async () => {
      const { data } = await adminApi.get("/avito/token-check", { params: { accountId: activeAccountId } });
      return data;
    },
  });

  const webhookStatusQ = useQuery({
    queryKey: ["avito", "webhook-status", activeAccountId],
    enabled: false,
    queryFn: async () => {
      const { data } = await adminApi.get("/avito/webhook-status", { params: { accountId: activeAccountId } });
      return data;
    },
  });

  const itemsQ = useQuery({
    queryKey: ["avito", "items", activeAccountId],
    queryFn: async () => {
      const { data } = await adminApi.get("/avito/items", { params: { accountId: activeAccountId, per_page: 30, page: 1 } });
      return data;
    },
    enabled: !!activeAccountId,
    refetchInterval: 15000,
  });

  const chatsQ = useQuery({
    queryKey: ["avito", "chats", activeAccountId],
    queryFn: async () => {
      const { data } = await adminApi.get("/avito/messenger/chats", { params: { accountId: activeAccountId, per_page: 30, page: 1 } });
      return data;
    },
    enabled: !!activeAccountId,
    refetchInterval: 4000,
  });

  const messagesQ = useQuery({
    queryKey: ["avito", "messages", activeAccountId, selectedChatId],
    queryFn: async () => {
      const { data } = await adminApi.get(`/avito/messenger/chats/${selectedChatId}/messages`, {
        params: { accountId: activeAccountId, per_page: 50, page: 1 },
      });
      return data;
    },
    enabled: !!activeAccountId && !!selectedChatId,
    refetchInterval: 2500,
  });

  const chatAgentQ = useQuery({
    queryKey: ["avito", "chat-agent", selectedChatId],
    queryFn: async () => {
      const { data } = await adminApi.get<{ ai_paused: boolean; intercepted: boolean }>(
        `/avito/messenger/chats/${selectedChatId}/agent-status`,
      );
      return data;
    },
    enabled: !!selectedChatId,
    refetchInterval: 4000,
  });

  const pauseAgentMut = useMutation({
    mutationFn: () => adminApi.post(`/avito/messenger/chats/${selectedChatId}/pause-agent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["avito", "chat-agent", selectedChatId] });
      toast.success("Перехват: агент отключён для этого чата");
    },
  });

  const resumeAgentMut = useMutation({
    mutationFn: () => adminApi.post(`/avito/messenger/chats/${selectedChatId}/resume-agent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["avito", "chat-agent", selectedChatId] });
      toast.success("Агент снова отвечает в этом чате");
    },
  });

  const saveConfig = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.put<AvitoConfig>("/avito/config", draft);
      return data;
    },
    onMutate: () => {
      setConfigStatus({ kind: "saving", message: "Сохранение конфигурации..." });
    },
    onSuccess: (data) => {
      setDraft(data);
      qc.invalidateQueries({ queryKey: ["avito", "config"] });
      setConfigStatus({ kind: "success", message: "Конфигурация успешно сохранена." });
      toast.success("Конфигурация Avito сохранена");
    },
    onError: (error) => {
      const message = err(error);
      setConfigStatus({ kind: "error", message: `Ошибка сохранения: ${message}` });
      toast.error(`Не удалось сохранить конфигурацию: ${message}`);
    },
  });

  const registerWebhook = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post("/avito/messenger/register-webhook", {
        agentId: agentIdForWebhook.trim(),
        webhookBaseUrl: webhookBaseUrlOverride.trim() || undefined,
        accountId: activeAccountId || undefined,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["avito", "events"] });
      webhookStatusQ.refetch();
      toast.success("Webhook зарегистрирован");
    },
    onError: (error) => {
      toast.error(`Ошибка регистрации webhook: ${err(error)}`);
    },
  });

  const tokenRefreshMutation = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post<{ ok: boolean; tokenExpiresAt: string; accessTokenPrefix: string }>(
        "/avito/token-refresh",
        { accountId: activeAccountId || undefined },
      );
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["avito", "config"] });
      qc.invalidateQueries({ queryKey: ["avito", "items"] });
      qc.invalidateQueries({ queryKey: ["avito", "chats"] });
      toast.success(`Токен обновлён${data.tokenExpiresAt ? `, истекает: ${data.tokenExpiresAt}` : ""}`);
    },
    onError: (error) => {
      toast.error(`Ошибка обновления токена: ${err(error)}`);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post("/avito/sync", {
        accountId: activeAccountId || undefined,
        agentId: agentIdForWebhook.trim() || undefined,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["avito", "events"] });
      toast.success("Синхронизация Avito запущена");
    },
    onError: (error) => {
      toast.error(`Ошибка синхронизации: ${err(error)}`);
    },
  });

  const itemDetailQ = useQuery({
    queryKey: ["avito", "item-detail", activeAccountId, selectedItemId],
    queryFn: async () => {
      const { data } = await adminApi.get(`/avito/items/${selectedItemId}`, {
        params: { accountId: activeAccountId },
      });
      return data as LooseObject;
    },
    enabled: !!activeAccountId && !!selectedItemId,
  });

  // Load agent enabled setting
  useQuery({
    queryKey: ["agent-avito-enabled"],
    queryFn: async () => {
      const { data } = await adminApi.get("/settings");
      const arr: Array<{ key: string; value: unknown }> = data;
      const s = arr.find((x) => x.key === "agent.avito_enabled");
      const val = Boolean(s?.value);
      setAgentEnabled(val);
      return val;
    },
  });

  const toggleAgent = useCallback(async (val: boolean) => {
    setAgentSaving(true);
    try {
      await adminApi.patch("/settings/agent.avito_enabled", { value: val });
      setAgentEnabled(val);
      toast.success(val ? "Агент включён — будет отвечать клиентам Avito" : "Агент выключен");
    } catch {
      toast.error("Ошибка сохранения настройки");
    } finally {
      setAgentSaving(false);
    }
  }, []);

  const sendReply = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post(`/avito/messenger/chats/${selectedChatId}/messages`, { text: chatReply.trim() }, { params: { accountId: activeAccountId } });
      return data;
    },
    onSuccess: () => {
      setChatReply("");
      messagesQ.refetch();
      qc.invalidateQueries({ queryKey: ["avito", "events"] });
      qc.invalidateQueries({ queryKey: ["avito", "chat-agent", selectedChatId] });
      toast.success("Сообщение отправлено — агент отключён для этого чата");
    },
    onError: (error) => {
      toast.error(`Ошибка отправки сообщения: ${err(error)}`);
    },
  });

  const syncToCleroMutation = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post<{ sent: number; skipped: number; errors: { chatid: string; error: string }[] }>(
        "/avito/clero/sync-all",
      );
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["avito", "events"] });
      toast.success(`Clero: отправлено ${data.sent}, пропущено ${data.skipped}${data.errors.length ? `, ошибок: ${data.errors.length}` : ""}`);
    },
    onError: (error) => {
      toast.error(`Ошибка синхронизации с Clero: ${err(error)}`);
    },
  });

  const err = (e: unknown) =>
    axios.isAxiosError(e) ? (e.response?.data as { error?: string })?.error || e.message : (e as Error).message;

  const accountList = useMemo(() => draft.accounts || [], [draft.accounts]);
  const activeAccount = useMemo(
    () => accountList.find((a) => a.id === activeAccountId) || accountList.find((a) => a.isActive) || accountList[0],
    [accountList, activeAccountId],
  );

  const itemRows = useMemo(() => avitoList(itemsQ.data as LooseObject | undefined, ["resources", "items", "results"]), [itemsQ.data]);

  const chatRows = useMemo(() => avitoList(chatsQ.data as LooseObject | undefined, ["chats", "results"]), [chatsQ.data]);

  const msgRows = useMemo(() => avitoList(messagesQ.data as LooseObject | undefined, ["messages", "results"]), [messagesQ.data]);

  useEffect(() => {
    if (!configQ.data) return;
    setDraft(configQ.data);
    if (!activeAccountId) {
      const first = configQ.data.accounts?.find((a) => a.isActive) || configQ.data.accounts?.[0];
      if (first?.id) setActiveAccountId(first.id);
    }
  }, [configQ.data, activeAccountId]);

  if (configQ.isLoading) return <p className="text-sm text-[#6A6860]">Загрузка Avito конфигурации…</p>;
  if (configQ.isError) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err(configQ.error)}</div>;

  const activeSection = (section || "config").toLowerCase();
  const allowedSections = new Set(["config", "accounts", "webhook", "items", "chats", "events"]);
  if (!allowedSections.has(activeSection)) {
    return <Navigate to="/admin/avito/config" replace />;
  }

  const primaryBtnClass = "rounded-xl border border-[#0B0B0A] bg-[#111110] px-4 text-white hover:bg-[#222220] disabled:opacity-60 disabled:text-white";
  const secondaryBtnClass = "rounded-xl border border-[#CBC5BA] bg-white px-4 text-[#111110] hover:bg-[#F3F1EC] disabled:text-[#8A867D]";
  const readableInputClass = "h-11 border-[#BEB7AA] bg-white text-[#111110] placeholder:text-[#7E786D] focus-visible:ring-[#111110]";

  return (
    <div className="space-y-8 text-[#0D0D0B]">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#0D0D0B]">Avito интеграция</h1>
        <p className="mt-1 text-sm text-[#6A6860]">Управление объявлениями, чатами, webhook, уведомлениями и синхронизацией в CRM.</p>
      </div>

      {activeSection === "config" && (
        <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-[#0D0D0B]">Конфигурация</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-[#6A6860]">Webhook base URL</label>
              <Input value={draft.webhookBaseUrl} onChange={(e) => setDraft((p) => ({ ...p, webhookBaseUrl: e.target.value }))} className={`mt-1 ${readableInputClass}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6A6860]">Telegram bot token</label>
              <Input value={draft.telegramBotToken} onChange={(e) => setDraft((p) => ({ ...p, telegramBotToken: e.target.value }))} className={`mt-1 ${readableInputClass}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6A6860]">Telegram chat id</label>
              <Input value={draft.telegramChatId} onChange={(e) => setDraft((p) => ({ ...p, telegramChatId: e.target.value }))} className={`mt-1 ${readableInputClass}`} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#3C3A34]">
            <input
              type="checkbox"
              checked={draft.telegramEnabled}
              onChange={(e) => setDraft((p) => ({ ...p, telegramEnabled: e.target.checked }))}
            />
            Уведомления в TG бот включены
          </label>
          <Button type="button" className={primaryBtnClass} onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending}>
            {saveConfig.isPending ? "Сохранение..." : "Сохранить конфигурацию"}
          </Button>
          {configStatus.kind !== "idle" && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                configStatus.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : configStatus.kind === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {configStatus.message}
            </div>
          )}
        </section>
      )}

      {activeSection === "accounts" && (
        <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Avito аккаунты</h2>
            <Button type="button" variant="outline" className={secondaryBtnClass} onClick={() => setDraft((p) => ({ ...p, accounts: [...p.accounts, emptyAccount()] }))}>
              Добавить аккаунт
            </Button>
          </div>
          <div className="space-y-3">
            {draft.accounts.map((a, idx) => (
              <div key={a.id} className="rounded-xl border border-[#E8E6E0] bg-[#FCFCFB] p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-4">
                  <Input className={readableInputClass} placeholder="Name" value={a.name} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], name: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                  <Input className={readableInputClass} placeholder="accountId" value={a.accountId} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], accountId: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                  <Input className={readableInputClass} placeholder="clientId" value={a.clientId} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], clientId: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                  <Input className={readableInputClass} placeholder="clientSecret" value={a.clientSecret} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], clientSecret: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <Input className={readableInputClass} placeholder="accessToken" value={a.accessToken} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], accessToken: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                  <Input className={readableInputClass} placeholder="refreshToken" value={a.refreshToken} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], refreshToken: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                  <Input className={readableInputClass} placeholder="webhookSecret" value={a.webhookSecret} onChange={(e) => setDraft((p) => {
                    const next = [...p.accounts];
                    next[idx] = { ...next[idx], webhookSecret: e.target.value };
                    return { ...p, accounts: next };
                  })} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm flex items-center gap-2">
                    <input
                      type="radio"
                      checked={activeAccount?.id === a.id}
                      onChange={() => {
                        setActiveAccountId(a.id);
                        setDraft((p) => ({ ...p, accounts: p.accounts.map((x) => ({ ...x, isActive: x.id === a.id })) }));
                      }}
                    />
                    Активный
                  </label>
                  <Button type="button" variant="ghost" className="text-red-700 hover:text-red-900" onClick={() => setDraft((p) => ({ ...p, accounts: p.accounts.filter((x) => x.id !== a.id) }))}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
            {draft.accounts.length === 0 && <p className="text-sm text-[#6A6860]">Аккаунты еще не добавлены.</p>}
          </div>
        </section>
      )}

      {activeSection === "webhook" && (
        <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-heading text-lg font-bold">Webhook и сервисные операции</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Input className={readableInputClass} placeholder="agentId (UUID)" value={agentIdForWebhook} onChange={(e) => setAgentIdForWebhook(e.target.value)} />
            <Input className={readableInputClass} placeholder="webhookBaseUrl override" value={webhookBaseUrlOverride} onChange={(e) => setWebhookBaseUrlOverride(e.target.value)} />
            <div className="rounded-lg border border-[#D5CFC3] bg-white px-3 py-2 text-sm font-medium text-[#2E2C27]">
              Активный аккаунт: {activeAccount?.name || activeAccount?.accountId || "—"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className={primaryBtnClass} onClick={() => registerWebhook.mutate()} disabled={registerWebhook.isPending || !agentIdForWebhook.trim()}>
              {registerWebhook.isPending ? "Регистрация..." : "Register webhook"}
            </Button>
            <Button type="button" variant="outline" className={secondaryBtnClass} onClick={() => tokenCheckQ.refetch()}>
              {tokenCheckQ.isFetching ? "Проверка..." : "Token check"}
            </Button>
            <Button type="button" variant="outline" className={secondaryBtnClass} onClick={() => webhookStatusQ.refetch()}>
              {webhookStatusQ.isFetching ? "Проверка..." : "Webhook status"}
            </Button>
            <Button type="button" variant="outline" className={secondaryBtnClass} onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              {syncMutation.isPending ? "Синхронизация..." : "Avito sync"}
            </Button>
            <Button type="button" variant="outline" className={`${secondaryBtnClass} border-amber-400 text-amber-700 hover:bg-amber-50`} onClick={() => tokenRefreshMutation.mutate()} disabled={tokenRefreshMutation.isPending}>
              {tokenRefreshMutation.isPending ? "Обновление..." : "🔄 Обновить токен"}
            </Button>
          </div>
          {(registerWebhook.isError || tokenCheckQ.isError || webhookStatusQ.isError || syncMutation.isError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {registerWebhook.isError && <p>{err(registerWebhook.error)}</p>}
              {tokenCheckQ.isError && <p>{err(tokenCheckQ.error)}</p>}
              {webhookStatusQ.isError && <p>{err(webhookStatusQ.error)}</p>}
              {syncMutation.isError && <p>{err(syncMutation.error)}</p>}
            </div>
          )}
          {(registerWebhook.data || tokenCheckQ.data || webhookStatusQ.data || syncMutation.data) && (
            <div className="rounded-xl border border-[#EEE] bg-[#FAFAF8] p-3 text-xs overflow-auto">
              <pre className="whitespace-pre-wrap">
                {shortJson({
                  registerWebhook: registerWebhook.data,
                  tokenCheck: tokenCheckQ.data,
                  webhookStatus: webhookStatusQ.data,
                  sync: syncMutation.data,
                })}
              </pre>
            </div>
          )}
        </section>
      )}

      {activeSection === "items" && (
        <div className="space-y-4">
          {/* Agent toggle banner */}
          <div className={`flex items-center justify-between rounded-2xl border p-4 ${agentEnabled ? "border-green-200 bg-green-50" : "border-[#E8E6E0] bg-white"}`}>
            <div className="flex items-center gap-3">
              {agentEnabled ? <Bot size={18} className="text-green-600" /> : <BotOff size={18} className="text-[#6A6860]" />}
              <div>
                <p className="text-sm font-semibold text-[#0D0D0B]">
                  AI-ассистент {agentEnabled ? "включён" : "выключен"}
                </p>
                <p className="text-xs text-[#6A6860]">
                  {agentEnabled
                    ? "Агент автоматически отвечает клиентам Avito, использует базу знаний и прайс"
                    : "Агент не отвечает. Включите для автоматической обработки сообщений клиентов"}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={agentSaving}
              onClick={() => toggleAgent(!agentEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${agentEnabled ? "bg-green-500" : "bg-gray-300"} ${agentSaving ? "opacity-50" : ""}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${agentEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <section className="rounded-2xl border border-[#E8E6E0] bg-white shadow-sm">
            <div className="flex items-center justify-between p-5 pb-4">
              <h2 className="font-heading text-lg font-bold">Управление объявлениями</h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={secondaryBtnClass}
                  onClick={() => {
                    adminApi.post("/admin/knowledge/sync-avito-items")
                      .then((r) => toast.success(`Синхронизировано в базу знаний: ${r.data?.synced || 0} объявлений`))
                      .catch(() => toast.error("Ошибка синхронизации"));
                  }}
                >
                  Синх. в КБ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={secondaryBtnClass}
                  onClick={() => itemsQ.refetch()}
                  disabled={itemsQ.isFetching}
                >
                  <RefreshCw size={13} className={`mr-1 ${itemsQ.isFetching ? "animate-spin" : ""}`} />
                  Обновить
                </Button>
              </div>
            </div>

            {/* Stats */}
            {itemRows.length > 0 && (
              <div className="grid grid-cols-3 gap-3 px-5 pb-4">
                {[
                  { label: "Всего объявлений", value: itemRows.length },
                  { label: "Активных", value: itemRows.filter(r => String(r.status ?? r.state ?? "") === "active").length },
                  { label: "Общая сумма", value: itemRows.reduce((s, r) => {
                    const p = Number(String(r.price_string ?? r.price ?? "0").replace(/\D/g, ""));
                    return s + (Number.isFinite(p) ? p : 0);
                  }, 0).toLocaleString("ru-RU") + " ₽" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl border border-[#EEE] bg-[#FAFAF8] p-3">
                    <p className="text-xs text-[#6A6860]">{stat.label}</p>
                    <p className="text-xl font-semibold text-[#1C1B1A] mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {itemsQ.isLoading && <p className="px-5 pb-4 text-sm text-[#6A6860]">Загрузка объявлений…</p>}
            {itemsQ.isError && (
              <p className="px-5 pb-4 text-sm text-red-700">{err(itemsQ.error)}. Обновите страницу (Ctrl+F5).</p>
            )}

            {/* Items list + detail panel */}
            <div className="flex border-t border-[#EEE]" style={{ minHeight: selectedItemId ? 500 : "auto" }}>
              {/* List */}
              <div className={`overflow-auto ${selectedItemId ? "w-1/2 border-r border-[#EEE]" : "w-full"}`} style={{ maxHeight: 560 }}>
                <table className="w-full text-sm">
                  <thead className="bg-[#FAFAF8] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#6A6860]">Заголовок</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#6A6860]">Цена</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#6A6860]">Статус</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemRows.map((r, i) => {
                      const id = String(r.id ?? r.item_id ?? `row-${i}`);
                      const title = String(r.title ?? r.name ?? "—");
                      const status = String(r.status ?? r.state ?? "—");
                      const price = r.price_string ? String(r.price_string) : r.price ? `${r.price} ₽` : "—";
                      const isSelected = selectedItemId === id;
                      return (
                        <tr
                          key={id}
                          onClick={() => setSelectedItemId(isSelected ? null : id)}
                          className={`border-b border-[#F5F5F5] cursor-pointer transition-colors ${isSelected ? "bg-[#F0F4FF]" : "hover:bg-[#FAFAF8]"}`}
                        >
                          <td className="px-3 py-2.5 font-medium text-[#0D0D0B]">{title}</td>
                          <td className="px-3 py-2.5 text-[#6A6860] whitespace-nowrap">{price}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                              status === "active" ? "bg-green-100 text-green-700" :
                              status === "blocked" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>{status}</span>
                          </td>
                          <td className="px-2 py-2.5 text-[#BEB7AA]">
                            <ChevronRight size={14} className={`transition-transform ${isSelected ? "rotate-90 text-blue-500" : ""}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {itemRows.length === 0 && !itemsQ.isLoading && (
                  <p className="p-6 text-center text-sm text-[#6A6860]">Нет данных</p>
                )}
              </div>

              {/* Detail panel */}
              {selectedItemId && (
                <div className="w-1/2 overflow-auto" style={{ maxHeight: 560 }}>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#EEE] bg-[#FAFAF8] sticky top-0">
                    <span className="text-sm font-semibold text-[#0D0D0B]">Детали объявления</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          adminApi.put(`/avito/items/${selectedItemId}/vas`, { accountId: activeAccountId, services: ["x2_1"] })
                            .then(() => toast.success(`VAS применён`))
                            .catch(e => toast.error(`VAS ошибка: ${(e as { response?: { data?: { error?: string } } })?.response?.data?.error || (e as Error).message}`));
                        }}
                      >
                        Поднять VAS
                      </Button>
                      <button onClick={() => setSelectedItemId(null)} className="p-1 text-[#6A6860] hover:text-[#0D0D0B]">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {itemDetailQ.isLoading && (
                    <div className="p-5 text-sm text-[#6A6860]">Загрузка данных объявления…</div>
                  )}
                  {itemDetailQ.isError && (
                    <div className="p-5 text-sm text-red-600">Ошибка загрузки. Попробуйте ещё раз.</div>
                  )}
                  {itemDetailQ.data && <AvitoItemDetail item={itemDetailQ.data} />}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeSection === "chats" && (
        <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Диалоги Avito</h2>
            <Button
              type="button"
              variant="outline"
              className={secondaryBtnClass}
              onClick={() => syncToCleroMutation.mutate()}
              disabled={syncToCleroMutation.isPending}
            >
              {syncToCleroMutation.isPending ? "Синхронизация..." : "Отправить все в Clero"}
            </Button>
          </div>
          {chatsQ.isLoading && <p className="text-sm text-[#6A6860]">Загрузка чатов…</p>}
          {chatsQ.isError && (
            <p className="text-sm text-red-700">
              {err(chatsQ.error)}. Обновите страницу (Ctrl+F5), если раньше был 403.
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-[280px_1fr]">
            <div className="rounded-xl border border-[#EEE] max-h-[560px] overflow-auto">
              {chatRows.map((c, idx) => {
                const id = String(c.id ?? c.chat_id ?? idx);
                const title = avitoChatTitle(c, idx);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`w-full border-b border-[#F5F5F5] p-2 text-left text-sm ${selectedChatId === id ? "bg-[#0D0D0B] text-white" : "text-[#0D0D0B] hover:bg-[#FAFAF8]"}`}
                    onClick={() => setSelectedChatId(id)}
                  >
                    <div className="font-semibold">{title}</div>
                    <div className={`text-xs ${selectedChatId === id ? "text-white/70" : "text-[#6A6860]"}`}>#{id}</div>
                  </button>
                );
              })}
              {chatRows.length === 0 && <p className="p-3 text-sm text-[#6A6860]">Чатов нет</p>}
            </div>
            <div className="rounded-xl border border-[#EEE] p-3 min-h-[420px] flex flex-col">
              {selectedChatId && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {chatAgentQ.data?.intercepted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800">
                      Перехвачен — агент не отвечает
                    </span>
                  ) : agentEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      Агент отвечает автоматически
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-600">
                      Агент выключен глобально
                    </span>
                  )}
                  {chatAgentQ.data?.intercepted ? (
                    <Button type="button" variant="outline" size="sm" className={secondaryBtnClass} onClick={() => resumeAgentMut.mutate()} disabled={resumeAgentMut.isPending}>
                      Вернуть агенту
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="sm" className={secondaryBtnClass} onClick={() => pauseAgentMut.mutate()} disabled={pauseAgentMut.isPending || !selectedChatId}>
                      Перехватить чат
                    </Button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-auto space-y-2">
                {messagesQ.isError && selectedChatId && (
                  <p className="text-sm text-red-700">{err(messagesQ.error)}</p>
                )}
                {msgRows.map((m, idx) => {
                  const text = avitoMessageText(m);
                  const created = String(m.created_at ?? m.created ?? "");
                  const side = String(m.direction ?? m.type ?? "").toLowerCase().includes("out") ? "justify-end" : "justify-start";
                  return (
                    <div key={`${idx}-${created}`} className={`flex ${side}`}>
                      <div className="max-w-[80%] rounded-xl bg-[#F5F5F5] px-3 py-2 text-sm">
                        <p className="whitespace-pre-wrap">{text || "—"}</p>
                        <p className="mt-1 text-[10px] text-[#6A6860]">{created}</p>
                      </div>
                    </div>
                  );
                })}
                {!selectedChatId && <p className="text-sm text-[#6A6860]">Выберите чат слева.</p>}
              </div>
              <div className="mt-3 flex gap-2 border-t pt-3">
                <Input className={readableInputClass} value={chatReply} onChange={(e) => setChatReply(e.target.value)} placeholder="Ответ пользователю..." />
                <Button type="button" className={primaryBtnClass} onClick={() => sendReply.mutate()} disabled={!selectedChatId || !chatReply.trim() || sendReply.isPending}>
                  Отправить
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "events" && (
        <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-sm">
          <h2 className="font-heading text-lg font-bold">События webhook / sync</h2>
          {eventsQ.isLoading && <p className="text-sm text-[#6A6860]">Загрузка событий…</p>}
          {eventsQ.isError && <p className="text-sm text-red-700">{err(eventsQ.error)}</p>}
          <div className="mt-3 max-h-[520px] space-y-2 overflow-auto">
            {(eventsQ.data || []).map((ev) => (
              <div key={ev.id} className="rounded-xl border border-[#EEE] p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{ev.eventType}</p>
                  <p className="text-xs text-[#6A6860]">{new Date(ev.at).toLocaleString()}</p>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-[#6A6860]">{shortJson(ev.payload)}</pre>
              </div>
            ))}
            {(eventsQ.data || []).length === 0 && <p className="text-sm text-[#6A6860]">Событий пока нет</p>}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#E8E6E0] bg-white p-4 text-sm text-[#6A6860] shadow-sm">
        <p>Дальнейшее расширение: автогенерация ответов ассистентом, правила эскалации менеджеру, автосоздание лидов и приоритизация по intent/readiness.</p>
      </section>
    </div>
  );
}
