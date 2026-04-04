import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

type Overview = {
  keys: {
    id: string;
    key: string;
    balance: number;
    is_active: boolean;
    assistant_id: string;
    assistant_name?: string | null;
    api_key_prefix?: string | null;
    usage: { total_cost: number; total_tokens: number; requests: number };
  }[];
  top_users: {
    api_key_id: string;
    assistant_name: string | null;
    key: string | null;
    total_cost: number;
    requests: number;
  }[];
  recent_usage: {
    id: string;
    cost: number;
    tokens_approx: number;
    messages_count: number;
    path: string;
    created_at: string;
    assistant_name?: string | null;
  }[];
};

export default function AdminBillingPage() {
  usePageTitle("Биллинг");
  const qc = useQueryClient();
  const [addByKey, setAddByKey] = useState<Record<string, string>>({});

  const q = useQuery({
    queryKey: ["billing", "overview"],
    queryFn: async () => {
      const { data } = await adminApi.get<Overview>("/billing/overview");
      return data;
    },
  });

  const addBalance = async (id: string) => {
    const raw = addByKey[id]?.trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n === 0) {
      toast.error("Введите сумму для пополнения");
      return;
    }
    try {
      await adminApi.patch(`/billing/keys/${id}`, { add_balance: n });
      toast.success("Баланс обновлён");
      setAddByKey((p) => ({ ...p, [id]: "" }));
      await qc.invalidateQueries({ queryKey: ["billing", "overview"] });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error || e.message
        : (e as Error).message;
      toast.error(msg);
    }
  };

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
      <h1 className="font-heading text-2xl font-extrabold">Биллинг и API-ключи</h1>
      <p className="text-sm text-muted-foreground">
        Списание за каждый запрос <code className="text-xs">POST /chat</code>: стоимость из{" "}
        <code className="text-xs">BILLING_COST_PER_MESSAGE</code> и{" "}
        <code className="text-xs">BILLING_COST_PER_1K_TOKENS</code>. Лимит:{" "}
        <code className="text-xs">BILLING_RATE_LIMIT_PER_MIN</code> запросов/мин на ключ сайта.
      </p>

      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-3">
        <h2 className="font-heading text-lg font-extrabold">Кошельки (по ассистентам)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Ассистент</th>
                <th className="py-2 pr-2">Префикс ключа</th>
                <th className="py-2 pr-2">Баланс</th>
                <th className="py-2 pr-2">Запросов</th>
                <th className="py-2 pr-2">Списано (всего)</th>
                <th className="py-2 pr-2">Пополнить</th>
              </tr>
            </thead>
            <tbody>
              {d.keys.map((k) => (
                <tr key={k.id} className="border-b border-border/60">
                  <td className="py-2 pr-2">{k.assistant_name ?? "—"}</td>
                  <td className="font-mono text-xs">{k.api_key_prefix ?? "—"}</td>
                  <td className="tabular-nums">{k.balance.toFixed(4)}</td>
                  <td className="tabular-nums">{k.usage.requests}</td>
                  <td className="tabular-nums">{Number(k.usage.total_cost).toFixed(6)}</td>
                  <td className="py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="h-8 w-28 rounded-lg text-xs"
                        placeholder="+ сумма"
                        value={addByKey[k.id] ?? ""}
                        onChange={(e) => setAddByKey((p) => ({ ...p, [k.id]: e.target.value }))}
                      />
                      <Button type="button" size="sm" className="h-8 rounded-lg" onClick={() => void addBalance(k.id)}>
                        OK
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-3">
        <h2 className="font-heading text-lg font-extrabold">Топ по списаниям</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {d.top_users.length === 0 ? (
            <li className="text-muted-foreground">Нет данных</li>
          ) : (
            d.top_users.map((t) => (
              <li key={t.api_key_id}>
                <span className="font-medium">{t.assistant_name ?? t.key ?? t.api_key_id}</span> —{" "}
                <span className="tabular-nums text-muted-foreground">{Number(t.total_cost).toFixed(6)}</span> ({t.requests}{" "}
                запр.)
              </li>
            ))
          )}
        </ol>
      </div>

      <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 space-y-3">
        <h2 className="font-heading text-lg font-extrabold">Последние списания</h2>
        <ul className="divide-y divide-border rounded-xl border border-border text-xs max-h-[360px] overflow-y-auto">
          {d.recent_usage.map((u) => (
            <li key={u.id} className="flex flex-wrap justify-between gap-2 px-3 py-2">
              <span>{u.assistant_name ?? "—"}</span>
              <span className="text-muted-foreground">{new Date(u.created_at).toLocaleString()}</span>
              <span className="tabular-nums">−{Number(u.cost).toFixed(6)}</span>
              <span className="text-muted-foreground">
                ~{u.tokens_approx} tok · {u.messages_count} msg
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
