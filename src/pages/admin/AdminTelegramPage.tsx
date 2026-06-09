import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Send, RefreshCw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TgRequest {
  chatId: string;
  username: string;
  firstName: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  createdAt: string;
  approvedAt?: string;
}

interface WebhookInfo {
  ok: boolean;
  result?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_message?: string;
    last_error_date?: number;
  };
}

const statusLabels: Record<string, string> = {
  pending: "⏳ Ожидает",
  approved: "✅ Одобрен",
  rejected: "❌ Отклонён",
  revoked: "🚫 Отозван",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  revoked: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminTelegramPage() {
  const qc = useQueryClient();
  const [notifyText, setNotifyText] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data: requests = [], isLoading: loadingReqs, refetch } = useQuery<TgRequest[]>({
    queryKey: ["tg-requests"],
    queryFn: () => adminApi.get("/tg/admin-requests").then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: webhookInfo } = useQuery<WebhookInfo>({
    queryKey: ["tg-webhook-info"],
    queryFn: () => adminApi.get("/tg/webhook-info").then((r) => r.data),
  });

  const { data: approvedChats = [] } = useQuery<string[]>({
    queryKey: ["tg-approved-chats"],
    queryFn: () => adminApi.get("/tg/approved-chats").then((r) => r.data),
  });

  const approveMut = useMutation({
    mutationFn: (chatId: string) => adminApi.post(`/tg/admin-requests/${chatId}/approve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tg-requests"] }); qc.invalidateQueries({ queryKey: ["tg-approved-chats"] }); toast.success("Доступ одобрен — пользователь получил уведомление"); },
    onError: () => toast.error("Ошибка"),
  });

  const rejectMut = useMutation({
    mutationFn: (chatId: string) => adminApi.post(`/tg/admin-requests/${chatId}/reject`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tg-requests"] }); toast.success("Заявка отклонена"); },
    onError: () => toast.error("Ошибка"),
  });

  const revokeMut = useMutation({
    mutationFn: (chatId: string) => adminApi.delete(`/tg/admin-requests/${chatId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tg-requests"] }); qc.invalidateQueries({ queryKey: ["tg-approved-chats"] }); toast.success("Доступ отозван"); },
    onError: () => toast.error("Ошибка"),
  });

  const setupWebhookMut = useMutation({
    mutationFn: () => adminApi.post("/tg/setup-webhook", { baseUrl: window.location.origin }),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ["tg-webhook-info"] }); toast.success("Webhook зарегистрирован"); console.log(r.data); },
    onError: () => toast.error("Ошибка регистрации webhook"),
  });

  const notifyMut = useMutation({
    mutationFn: (text: string) => adminApi.post("/tg/notify", { text }),
    onSuccess: (r) => { toast.success(`Отправлено: ${r.data?.sent || 0} чатов`); setNotifyText(""); },
    onError: () => toast.error("Ошибка отправки"),
  });

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const webhookUrl = webhookInfo?.result?.url;
  const webhookOk = Boolean(webhookUrl && !webhookInfo?.result?.last_error_message);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Telegram бот</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление доступами и уведомлениями</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => refetch()}>
            <RefreshCw size={13} className="mr-1" />Обновить
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Получают уведомления</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{approvedChats.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Ожидают одобрения</p>
          <p className={`text-2xl font-semibold mt-1 ${pendingCount > 0 ? "text-yellow-600" : "text-gray-900"}`}>{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Webhook</p>
          <div className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${webhookOk ? "text-green-600" : "text-red-500"}`}>
            <div className={`w-2 h-2 rounded-full ${webhookOk ? "bg-green-500" : "bg-red-500"}`} />
            {webhookOk ? "Активен" : "Не настроен"}
          </div>
        </div>
      </div>

      {/* Webhook setup */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bot size={16} />Webhook Telegram
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Бот получает сообщения через webhook. Нужно зарегистрировать один раз.</p>
          </div>
          <Button size="sm" onClick={() => setupWebhookMut.mutate()} disabled={setupWebhookMut.isPending}>
            {setupWebhookMut.isPending ? "Регистрируем..." : "Зарегистрировать webhook"}
          </Button>
        </div>
        {webhookUrl && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 break-all">{webhookUrl}</div>
        )}
        {webhookInfo?.result?.last_error_message && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            Ошибка: {webhookInfo.result.last_error_message}
          </div>
        )}
      </div>

      {/* Manual broadcast */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Send size={15} />Ручная рассылка
        </h2>
        <p className="text-xs text-gray-500 mb-3">Отправить сообщение всем одобренным пользователям ({approvedChats.length} чел.)</p>
        <Textarea
          value={notifyText}
          onChange={(e) => setNotifyText(e.target.value)}
          rows={3}
          placeholder="Текст сообщения..."
          className="mb-3"
        />
        <Button
          size="sm"
          onClick={() => notifyMut.mutate(notifyText)}
          disabled={!notifyText.trim() || notifyMut.isPending || approvedChats.length === 0}
        >
          <Send size={13} className="mr-1" />
          {notifyMut.isPending ? "Отправка..." : `Отправить (${approvedChats.length})`}
        </Button>
      </div>

      {/* Access requests */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-semibold text-gray-800">Заявки на доступ</h2>
          {pendingCount > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              {pendingCount} новых
            </span>
          )}
          <div className="ml-auto flex gap-1">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${filter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "all" ? "Все" : statusLabels[f]?.replace(/[⏳✅❌🚫]\s/, "")}
              </button>
            ))}
          </div>
        </div>

        {loadingReqs ? (
          <div className="text-center py-8 text-gray-400 text-sm">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-medium">Заявок нет</p>
            <p className="text-xs mt-1">Когда пользователь отправит /admin в боте, заявка появится здесь</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((req) => (
              <div key={req.chatId} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {req.firstName || "Без имени"}
                    </span>
                    {req.username && (
                      <span className="text-xs text-gray-400">@{req.username}</span>
                    )}
                    <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{req.chatId}</code>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(req.createdAt).toLocaleString("ru-RU")}
                    {req.approvedAt && ` · одобрен ${new Date(req.approvedAt).toLocaleString("ru-RU")}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[req.status]}`}>
                  {statusLabels[req.status]}
                </span>
                <div className="flex gap-1">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveMut.mutate(req.chatId)}
                        disabled={approveMut.isPending}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Одобрить"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => rejectMut.mutate(req.chatId)}
                        disabled={rejectMut.isPending}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Отклонить"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {req.status === "approved" && (
                    <button
                      onClick={() => { if (confirm("Отозвать доступ?")) revokeMut.mutate(req.chatId); }}
                      disabled={revokeMut.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Отозвать"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
