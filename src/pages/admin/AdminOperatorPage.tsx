import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import { mapCrmJsonMessagesToAdmin } from "@/lib/crm-chat-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatRow = {
  id: string;
  display_title: string;
  last_message_preview: string | null;
  status: string;
  message_count: number;
  operator_requested?: boolean;
  operator_connected?: boolean;
  updated_at: string;
};

export default function AdminOperatorPage() {
  usePageTitle("Оператор — живые чаты");
  const qc = useQueryClient();
  const [chatId, setChatId] = useState<string>("");
  const [text, setText] = useState("");

  const chatsQ = useQuery({
    queryKey: ["operator", "chats"],
    queryFn: async () => {
      const { data } = await adminApi.get<ChatRow[]>("/crm/chats");
      return data;
    },
    refetchInterval: 4000,
  });

  const selectedId = chatId || chatsQ.data?.find((c) => c.operator_requested || c.operator_connected)?.id || "";

  const detailQ = useQuery({
    queryKey: ["operator", "chat", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await adminApi.get(`/crm/chats/${selectedId}`);
      return data as { id: string; messages: unknown; status: string };
    },
    refetchInterval: 2500,
  });

  const connect = useMutation({
    mutationFn: (id: string) => adminApi.post(`/crm/chats/${id}/connect-operator`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operator", "chats"] });
      qc.invalidateQueries({ queryKey: ["operator", "chat", selectedId] });
    },
  });

  const send = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) => adminApi.post(`/crm/chats/${id}/messages`, { text: msg }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["operator", "chat", selectedId] });
      qc.invalidateQueries({ queryKey: ["operator", "chats"] });
    },
  });

  const waiting = useMemo(() => {
    const rows = [...(chatsQ.data || [])];
    rows.sort((a, b) => {
      const prioA = a.operator_connected ? 3 : a.operator_requested ? 2 : 1;
      const prioB = b.operator_connected ? 3 : b.operator_requested ? 2 : 1;
      if (prioA !== prioB) return prioB - prioA;
      return String(b.updated_at).localeCompare(String(a.updated_at));
    });
    return rows.slice(0, 50);
  }, [chatsQ.data]);

  const err = (e: unknown) =>
    axios.isAxiosError(e) ? (e.response?.data as { error?: string })?.error || e.message : (e as Error).message;

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold">Оператор — живые чаты</h1>
      <div className="grid gap-4 md:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-3">
          <p className="mb-2 text-sm font-semibold">Очередь оператора</p>
          <div className="space-y-2">
            {waiting.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedId === c.id ? "border-black bg-black text-white" : "border-[#E8E6E0] bg-white"
                }`}
                onClick={() => setChatId(c.id)}
              >
                <div className="font-medium">{c.display_title}</div>
                <div className={`text-xs ${selectedId === c.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {c.last_message_preview || "—"}
                </div>
              </button>
            ))}
            {!waiting.length && <p className="text-sm text-muted-foreground">Пока нет чатов.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6E0] bg-white">
          {!selectedId ? (
            <p className="p-6 text-muted-foreground">Выберите чат из очереди.</p>
          ) : (
            <div className="flex h-[70vh] flex-col">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="font-semibold">Чат #{selectedId.slice(0, 8)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => connect.mutate(selectedId)}>
                  Подключиться
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {detailQ.isLoading && <p>Загрузка…</p>}
                {detailQ.isError && <p className="text-destructive">{err(detailQ.error)}</p>}
                {detailQ.data && (
                  <div className="space-y-3">
                    {mapCrmJsonMessagesToAdmin(detailQ.data.messages).map((m) => (
                      <div key={m.id} className={`flex ${m.from === "manager" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            m.from === "manager" ? "bg-[#0D0D0B] text-white" : "bg-[#F4F4F5] text-[#111]"
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
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введите ответ клиенту…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && text.trim()) {
                        send.mutate({ id: selectedId, msg: text.trim() });
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => text.trim() && send.mutate({ id: selectedId, msg: text.trim() })}
                    disabled={!text.trim() || send.isPending}
                  >
                    Отправить
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

