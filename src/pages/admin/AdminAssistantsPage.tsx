import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsAssistant } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";

export default function AdminAssistantsPage() {
  usePageTitle("CMS — ассистенты");
  const q = useQuery({
    queryKey: ["cms", "assistants"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsAssistant[]>("/assistants");
      return data;
    },
  });

  if (q.isLoading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (q.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{(q.error as Error).message}</div>
    );
  }

  const rows = q.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Ассистенты AI</h1>
        <Button asChild className="rounded-xl bg-[#0D0D0B]">
          <Link to="/admin/assistants/new">Создать</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#F0F0F0] bg-[#FAFAF8]">
            <tr>
              <th className="px-4 py-3 font-semibold">Имя</th>
              <th className="px-4 py-3 font-semibold">Префикс ключа</th>
              <th className="px-4 py-3 font-semibold">Модель</th>
              <th className="px-4 py-3 font-semibold">Активен</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAF8]">
                <td className="px-4 py-3">
                  <Link className="font-medium text-[#0052FF] hover:underline" to={`/admin/assistants/${a.id}`}>
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{a.api_key_prefix}…</td>
                <td className="px-4 py-3">{a.model}</td>
                <td className="px-4 py-3">{a.active ? "да" : "нет"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-muted-foreground">Нет ассистентов.</p>}
      </div>
    </div>
  );
}
