import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { RefreshCw, Bot, Zap, DollarSign, BarChart3, Settings2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Balance {
  balanceRub: number;
  spentRub: number;
  remainingRub: number;
  isExhausted: boolean;
  currency: string;
}

interface ModelsData {
  defaultModel: string;
  models: string[];
  data: Array<{ id: string; type: string; pricePerMillionRub: number }>;
}

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminAiAgentPage() {
  const qc = useQueryClient();
  const [editPrompt, setEditPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);

  const { data: balance, isLoading: loadingBal, refetch: refetchBal } = useQuery<Balance>({
    queryKey: ["ai-agent-balance"],
    queryFn: () => adminApi.get("/ai-agent/balance").then((r) => r.data),
    retry: 1,
  });

  const { data: models } = useQuery<ModelsData>({
    queryKey: ["ai-agent-models"],
    queryFn: () => adminApi.get("/ai-agent/models").then((r) => r.data),
    retry: 1,
  });

  const { data: status } = useQuery<{ configured: boolean }>({
    queryKey: ["ai-agent-status"],
    queryFn: () => adminApi.get("/ai-agent/status").then((r) => r.data),
  });

  const { data: settings } = useQuery({
    queryKey: ["cms-settings-agent"],
    queryFn: () =>
      adminApi.get("/settings").then((r) => {
        const all: Array<{ key: string; value: unknown }> = r.data;
        const promptSetting = all.find((s) => s.key === "agent.avito_system_prompt");
        const enabledSetting = all.find((s) => s.key === "agent.avito_enabled");
        const prompt = typeof promptSetting?.value === "string" ? promptSetting.value : "";
        const enabled = Boolean(enabledSetting?.value);
        setPromptText(prompt);
        setAgentEnabled(enabled);
        return { prompt, enabled };
      }),
  });

  const savePromptMut = useMutation({
    mutationFn: () =>
      Promise.all([
        adminApi.patch("/settings/agent.avito_system_prompt", { value: promptText }),
        adminApi.patch("/settings/agent.avito_enabled", { value: agentEnabled }),
      ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-settings-agent"] });
      toast.success("Настройки агента сохранены");
      setEditPrompt(false);
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const syncItemsMut = useMutation({
    mutationFn: () => adminApi.post("/admin/knowledge/sync-avito-items"),
    onSuccess: (r) => toast.success(`Синхронизировано: ${r.data?.synced || 0} объявлений`),
    onError: () => toast.error("Ошибка синхронизации"),
  });

  const DEFAULT_PROMPT = `Ты — умный менеджер-консультант компании Neeklo (AI-студия).
Твоя задача — помочь клиенту найти решение, предложить подходящий сервис, уточнить детали и провести к встрече или сделке.

Правила:
1. Отвечай ТОЛЬКО на русском языке.
2. Ответ не более 4–5 предложений. Будь конкретным и полезным.
3. Используй информацию из CONTEXT — цены, услуги, условия.
4. Задавай ОДИН уточняющий вопрос если не хватает информации.
5. Предлагай конкретные варианты, называй цены если знаешь.
6. Цель — записать клиента на встречу или оформить заказ.
7. Будь дружелюбным, живым, без шаблонных фраз.`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Агент</h1>
          <p className="text-sm text-gray-500 mt-0.5">crm-al.neeklo.ru — управление и мониторинг</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => refetchBal()}>
          <RefreshCw size={13} className="mr-1" />Обновить
        </Button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className={`w-2.5 h-2.5 rounded-full ${status?.configured ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm font-medium text-gray-700">
          {status?.configured ? "Агент настроен (CRM_AL_API_KEY задан)" : "Ключ не настроен — добавьте CRM_AL_API_KEY в .env"}
        </span>
        <span className="ml-auto text-xs text-gray-400">crm-al.neeklo.ru</span>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={15} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Баланс</span>
          </div>
          {loadingBal ? (
            <div className="text-gray-300 text-lg">...</div>
          ) : balance ? (
            <p className={`text-2xl font-semibold ${balance.isExhausted ? "text-red-600" : "text-gray-900"}`}>
              {fmt(balance.remainingRub)} ₽
            </p>
          ) : (
            <p className="text-sm text-red-500">Ошибка загрузки</p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={15} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Потрачено</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{balance ? fmt(balance.spentRub) + " ₽" : "—"}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={15} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Начислено</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{balance ? fmt(balance.balanceRub) + " ₽" : "—"}</p>
        </div>
      </div>

      {balance?.isExhausted && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Баланс исчерпан — пополните баланс в разделе «API Ключи» на crm-al.neeklo.ru
        </div>
      )}

      {/* Models */}
      {models && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bot size={15} />Доступные модели
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {models.data?.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg border text-sm ${models.defaultModel === m.id ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium font-mono">{m.id}</span>
                  {models.defaultModel === m.id && (
                    <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded">default</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{m.pricePerMillionRub?.toLocaleString("ru-RU")} ₽ / 1M токенов</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Settings2 size={15} />Настройки автоответа Avito
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agentEnabled}
                onChange={(e) => setAgentEnabled(e.target.checked)}
                className="rounded"
              />
              Авто-ответ включён
            </label>
            {!editPrompt && (
              <Button size="sm" variant="ghost" onClick={() => setEditPrompt(true)}>
                Редактировать промпт
              </Button>
            )}
          </div>
        </div>

        {editPrompt ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Системный промпт агента Avito</label>
              <button
                onClick={() => setPromptText(DEFAULT_PROMPT)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Сбросить к умолчанию
              </button>
            </div>
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => savePromptMut.mutate()} disabled={savePromptMut.isPending}>
                <Save size={13} className="mr-1" />
                {savePromptMut.isPending ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditPrompt(false)}>Отмена</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-2">Текущий промпт:</p>
            <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {promptText || DEFAULT_PROMPT}
            </pre>
          </div>
        )}
      </div>

      {/* Knowledge sync */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Синхронизация объявлений в базу знаний</h2>
        <p className="text-sm text-gray-500 mb-4">
          Загружает текущие объявления Avito в Qdrant (коллекция neeklo_avito_items), чтобы агент знал о них.
        </p>
        <Button size="sm" onClick={() => syncItemsMut.mutate()} disabled={syncItemsMut.isPending}>
          <RefreshCw size={13} className={`mr-1 ${syncItemsMut.isPending ? "animate-spin" : ""}`} />
          {syncItemsMut.isPending ? "Синхронизация..." : "Синхронизировать объявления"}
        </Button>
      </div>
    </div>
  );
}
