import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";

type AnalyticsPayload = {
  chats: number;
  leads: number;
  messages: number;
  by_assistant: { assistant_id: string | null; chats: number }[];
};

export default function AdminAiAnalyticsPage() {
  usePageTitle("AI / CRM аналитика");

  const q = useQuery({
    queryKey: ["crm", "analytics"],
    queryFn: async () => {
      const { data } = await adminApi.get<AnalyticsPayload>("/crm/analytics");
      return data;
    },
  });

  if (q.isLoading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (q.isError) {
    const msg = axios.isAxiosError(q.error)
      ? (q.error.response?.data as { error?: string })?.error || q.error.message
      : (q.error as Error).message;
    return <p className="text-red-600">{msg}</p>;
  }

  const d = q.data!;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold">AI · CRM аналитика</h1>
      <p className="text-sm text-muted-foreground">
        Сводка по чатам сайта (таблица <code className="text-xs">crm_chats</code>), лидам и сообщениям в JSON-истории.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
          <p className="text-xs uppercase text-muted-foreground">Чаты</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums">{d.chats}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
          <p className="text-xs uppercase text-muted-foreground">Лиды</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums">{d.leads}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6">
          <p className="text-xs uppercase text-muted-foreground">Сообщений (всего)</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums">{d.messages}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-3">
        <h2 className="font-heading text-lg font-extrabold">Чаты по ассистенту</h2>
        <ul className="divide-y divide-border rounded-xl border border-border text-sm">
          {d.by_assistant.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">Нет данных</li>
          ) : (
            d.by_assistant.map((row) => (
              <li key={row.assistant_id ?? "none"} className="flex justify-between px-3 py-2">
                <span className="font-mono text-xs">{row.assistant_id ?? "(не привязан)"}</span>
                <span className="tabular-nums">{row.chats}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
