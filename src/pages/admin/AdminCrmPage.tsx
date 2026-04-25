import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapCrmJsonMessagesToAdmin } from "@/lib/crm-chat-messages";

type LeadRow = {
  id: string;
  name: string | null;
  display_name?: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  chats_count: number;
  chat_id?: string | null;
  last_message_preview?: string | null;
  message_count?: number;
  readiness_score?: number;
  intent_label?: string | null;
  summary?: string | null;
};

type ChatRow = {
  id: string;
  lead_id: string | null;
  lead: { id: string; name: string | null; phone: string | null; status: string } | null;
  display_title: string;
  last_message_preview: string | null;
  status: string;
  message_count: number;
  operator_requested?: boolean;
  operator_connected?: boolean;
  ai_paused?: boolean;
  created_at: string;
  updated_at: string;
};

const LEAD_STATUSES = ["new", "contacted", "qualified", "lost", "won"];
const CHAT_STATUSES = ["active", "closed"];

export default function AdminCrmPage() {
  usePageTitle("CRM — лиды и чаты");
  const qc = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [operatorMessage, setOperatorMessage] = useState("");
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");

  const leadsQ = useQuery({
    queryKey: ["crm", "leads"],
    queryFn: async () => {
      const { data } = await adminApi.get<LeadRow[]>("/crm/leads");
      return data;
    },
  });

  const chatsQ = useQuery({
    queryKey: ["crm", "chats"],
    queryFn: async () => {
      const { data } = await adminApi.get<ChatRow[]>("/crm/chats");
      return data;
    },
  });

  const detailQ = useQuery({
    queryKey: ["crm", "chat", detailId],
    enabled: !!detailId,
    queryFn: async () => {
      const { data } = await adminApi.get(`/crm/chats/${detailId}`);
      return data as { id: string; messages: unknown; status: string; lead: ChatRow["lead"] };
    },
  });

  const createLead = useMutation({
    mutationFn: () =>
      adminApi.post("/crm/leads", {
        name: newLeadName.trim() || null,
        phone: newLeadPhone.trim() || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "leads"] });
      setNewLeadName("");
      setNewLeadPhone("");
    },
  });

  const patchLead = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.patch(`/crm/leads/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "leads"] });
      qc.invalidateQueries({ queryKey: ["crm", "chats"] });
    },
  });

  const patchChat = useMutation({
    mutationFn: (body: { id: string; status?: string; leadId?: string | null }) => {
      const { id, ...rest } = body;
      return adminApi.patch(`/crm/chats/${id}`, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "chats"] });
      qc.invalidateQueries({ queryKey: ["crm", "chat", detailId] });
    },
  });

  const connectOperator = useMutation({
    mutationFn: (id: string) => adminApi.post(`/crm/chats/${id}/connect-operator`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "chats"] });
      qc.invalidateQueries({ queryKey: ["crm", "chat", detailId] });
    },
  });

  const sendManagerMessage = useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      adminApi.post(`/crm/chats/${chatId}/messages`, { text }),
    onSuccess: () => {
      setOperatorMessage("");
      qc.invalidateQueries({ queryKey: ["crm", "chat", detailId] });
      qc.invalidateQueries({ queryKey: ["crm", "chats"] });
    },
  });

  const err = (e: unknown) =>
    axios.isAxiosError(e) ? (e.response?.data as { error?: string })?.error || e.message : (e as Error).message;

  if (leadsQ.isLoading || chatsQ.isLoading) {
    return <p className="font-body text-muted-foreground">Загрузка…</p>;
  }
  if (leadsQ.isError) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err(leadsQ.error)}</div>;
  }
  if (chatsQ.isError) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err(chatsQ.error)}</div>;
  }

  const leads = leadsQ.data ?? [];
  const chats = chatsQ.data ?? [];
  const hotLeads = leads.filter((l) => Number(l.readiness_score || 0) >= 70).length;
  const pendingOperator = chats.filter((c) => c.operator_requested).length;
  const liveOperator = chats.filter((c) => c.operator_connected).length;

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-extrabold">CRM</h1>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-4">
          <p className="text-xs text-muted-foreground">Всего лидов</p>
          <p className="mt-1 text-2xl font-extrabold">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-4">
          <p className="text-xs text-muted-foreground">Горячие лиды (&gt;=70)</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{hotLeads}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-4">
          <p className="text-xs text-muted-foreground">Оператор: ожидают / в линии</p>
          <p className="mt-1 text-2xl font-extrabold">{pendingOperator} / {liveOperator}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold">Лиды</h2>
        <div className="flex flex-wrap gap-2 items-end rounded-2xl border border-[#E8E6E0] bg-white p-4">
          <div>
            <label className="text-xs text-muted-foreground">Имя</label>
            <Input value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} className="mt-1 w-48" placeholder="—" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Телефон</label>
            <Input value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} className="mt-1 w-48" placeholder="—" />
          </div>
          <Button
            type="button"
            className="rounded-xl bg-[#0D0D0B]"
            disabled={createLead.isPending}
            onClick={() => createLead.mutate()}
          >
            Добавить
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[#E8E6E0] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#F0F0F0] bg-[#FAFAF8]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Имя</th>
                <th className="px-4 py-3 font-semibold">Телефон</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 font-semibold">Готовность</th>
                <th className="px-4 py-3 font-semibold">Чаты</th>
                <th className="px-4 py-3 font-semibold">Создан</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAF8]">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">{l.name ?? "—"}</td>
                  <td className="px-4 py-3">{l.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-[#E0E0E0] bg-white px-2 py-1 text-sm"
                      value={l.status}
                      onChange={(e) => patchLead.mutate({ id: l.id, status: e.target.value })}
                    >
                      {[...new Set([...LEAD_STATUSES, l.status])].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="font-semibold">{Number(l.readiness_score || 0)}%</div>
                      <div className="text-muted-foreground">{l.intent_label || "—"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.chats_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p className="p-6 text-center text-muted-foreground">Нет лидов</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold">Чаты</h2>
        <div className="overflow-x-auto rounded-2xl border border-[#E8E6E0] bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[#F0F0F0] bg-[#FAFAF8]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Лид</th>
                <th className="px-4 py-3 font-semibold">Статус чата</th>
                <th className="px-4 py-3 font-semibold">Сообщений</th>
                <th className="px-4 py-3 font-semibold">Оператор</th>
                <th className="px-4 py-3 font-semibold">Обновлён</th>
                <th className="px-4 py-3 font-semibold">Лид (привязка)</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {chats.map((c) => (
                <tr key={c.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAF8]">
                  <td className="px-4 py-3 font-mono text-xs">{c.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    {c.lead ? (
                      <span>
                        {c.lead.name ?? "—"} / {c.lead.phone ?? "—"}{" "}
                        <span className="text-muted-foreground">({c.lead.status})</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-[#E0E0E0] bg-white px-2 py-1 text-sm"
                      value={c.status}
                      onChange={(e) => patchChat.mutate({ id: c.id, status: e.target.value })}
                    >
                      {[...new Set([...CHAT_STATUSES, c.status])].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{c.message_count}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      {c.operator_connected ? (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">в линии</span>
                      ) : c.operator_requested ? (
                        <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">ожидает</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">AI</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      className="max-w-[200px] rounded-lg border border-[#E0E0E0] bg-white px-2 py-1 text-xs"
                      value={c.lead_id ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        patchChat.mutate({ id: c.id, leadId: v === "" ? null : v });
                      }}
                    >
                      <option value="">—</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {(l.name || l.phone || l.id).slice(0, 40)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setDetailId(c.id)}>
                      Текст
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {chats.length === 0 && <p className="p-6 text-center text-muted-foreground">Нет чатов</p>}
        </div>
      </section>

      {detailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">Операторский чат</span>
              <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setDetailId(null)}>
                Закрыть
              </button>
            </div>
            <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_280px]">
              <div className="flex min-h-0 flex-col border-r">
                <div className="flex items-center gap-2 border-b p-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => detailId && connectOperator.mutate(detailId)}
                    disabled={connectOperator.isPending}
                  >
                    Подключить оператора
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => detailId && patchChat.mutate({ id: detailId, ai_paused: true })}
                  >
                    Пауза AI
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto p-4">
                  {detailQ.isLoading && <p>…</p>}
                  {detailQ.isError && <p className="text-destructive">{err(detailQ.error)}</p>}
                  {detailQ.data && (
                    <div className="space-y-3">
                      {mapCrmJsonMessagesToAdmin(detailQ.data.messages).map((m) => (
                        <div key={m.id} className={`flex ${m.from === "manager" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                              m.from === "manager" ? "bg-[#0D0D0B] text-white" : "bg-[#F5F5F5] text-[#111]"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>
                            <p className={`mt-1 text-[10px] ${m.from === "manager" ? "text-white/60" : "text-muted-foreground"}`}>
                              {m.name} · {m.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      value={operatorMessage}
                      onChange={(e) => setOperatorMessage(e.target.value)}
                      placeholder="Ответ оператора..."
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        detailId &&
                        operatorMessage.trim() &&
                        sendManagerMessage.mutate({ chatId: detailId, text: operatorMessage.trim() })
                      }
                      disabled={!operatorMessage.trim() || sendManagerMessage.isPending}
                    >
                      Отправить
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-auto p-4 text-sm">
                {detailQ.data?.lead ? (
                  <>
                    <p className="font-semibold">Лид</p>
                    <p className="mt-2 text-muted-foreground">Имя: {detailQ.data.lead.name || "—"}</p>
                    <p className="text-muted-foreground">Телефон: {detailQ.data.lead.phone || "—"}</p>
                    <p className="text-muted-foreground">Статус: {detailQ.data.lead.status || "—"}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Лид не привязан</p>
                )}
                <div className="mt-4">
                  <p className="font-semibold">Управление</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => detailId && patchChat.mutate({ id: detailId, status: "closed" })}
                  >
                    Закрыть чат
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
