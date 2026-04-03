import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsSetting } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  usePageTitle("CMS — настройки");
  const q = useQuery({
    queryKey: ["cms", "settings", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsSetting[]>("/settings");
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
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold">Настройки</h1>
      <div className="space-y-3">
        {rows.map((s) => (
          <div key={s.key} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#E8E6E0] bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold break-all">{s.key}</p>
              <p className="text-xs text-muted-foreground">public: {s.is_public ? "да" : "нет"}</p>
              <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-[#F9F9F9] p-2 text-xs">{JSON.stringify(s.value, null, 2)}</pre>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg flex-shrink-0" asChild>
              <Link to={`/admin/settings/item/${encodeURIComponent(s.key)}`}>Открыть</Link>
            </Button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">Нет записей.</p>}
      </div>
    </div>
  );
}
