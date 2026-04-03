import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { adminApi } from "@/lib/admin-api";
import type { CmsPage } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";

export default function AdminPagesList() {
  usePageTitle("CMS — страницы");
  const q = useQuery({
    queryKey: ["cms", "pages", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.get<CmsPage[]>("/pages?locale=ru");
      return data;
    },
  });

  if (q.isLoading) {
    return <p className="font-body text-muted-foreground">Загрузка…</p>;
  }
  if (q.isError) {
    const msg = axios.isAxiosError(q.error)
      ? (q.error.response?.data as { error?: string })?.error || q.error.message
      : (q.error as Error).message;
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {msg}. Проверьте вход в <code className="rounded bg-white px-1">/admin/login</code> и{" "}
        <code className="rounded bg-white px-1">npm run dev:full</code>.
      </div>
    );
  }

  const rows = q.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Страницы CMS</h1>
        <Button asChild className="rounded-xl bg-[#0D0D0B]">
          <Link to="/admin/pages/new">Новая страница</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#F0F0F0] bg-[#FAFAF8]">
            <tr>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Заголовок</th>
              <th className="px-4 py-3 font-semibold">Locale</th>
              <th className="px-4 py-3 font-semibold">Опубликована</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAF8]">
                <td className="px-4 py-3">
                  <Link className="font-medium text-[#0052FF] hover:underline" to={`/admin/pages/${p.id}`}>
                    {p.slug}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#6A6860]">{p.title}</td>
                <td className="px-4 py-3">{p.locale}</td>
                <td className="px-4 py-3">{p.published ? "да" : "нет"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-muted-foreground">Нет страниц. Примените миграции Supabase.</p>}
      </div>
    </div>
  );
}
