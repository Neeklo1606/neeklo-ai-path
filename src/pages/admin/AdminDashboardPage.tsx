import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/admin-api";
import { Users2, Briefcase, BookOpen, TrendingUp, Plus, ExternalLink, ArrowRight } from "lucide-react";

interface Stats {
  leadsToday: number;
  leadsWeek: number;
  activeCases: number;
  publishedPosts: number;
  recentLeads: { id: string; name: string | null; phone: string | null; status: string; summary: string | null; createdAt: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новый", contacted: "Контакт", in_progress: "В работе", done: "Готово", cancelled: "Отказ",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/admin/stats")
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Лиды сегодня", value: stats?.leadsToday ?? "—", icon: <Users2 size={20} />, color: "text-blue-600 bg-blue-50" },
    { label: "Лиды за 7 дней", value: stats?.leadsWeek ?? "—", icon: <TrendingUp size={20} />, color: "text-violet-600 bg-violet-50" },
    { label: "Кейсов активных", value: stats?.activeCases ?? "—", icon: <Briefcase size={20} />, color: "text-emerald-600 bg-emerald-50" },
    { label: "Статей в блоге", value: stats?.publishedPosts ?? "—", icon: <BookOpen size={20} />, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Дашборд</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${k.color}`}>{k.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{loading ? "…" : k.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Последние лиды</h2>
            <Link to="/admin/leads" className="text-xs text-blue-600 hover:underline">Все →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading && [1,2,3,4,5].map(i => (
              <div key={i} className="px-4 py-3 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-32 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            ))}
            {!loading && (stats?.recentLeads ?? []).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{lead.name}</div>
                  <div className="text-xs text-gray-400 truncate">{lead.phone || "—"} · {lead.summary || ""}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                  {STATUS_LABELS[lead.status] ?? lead.status}
                </span>
              </div>
            ))}
            {!loading && !stats?.recentLeads?.length && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Лидов пока нет</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Быстрые действия</h2>
          <div className="space-y-2">
            <Link to="/admin/cases" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
              <Plus size={15} className="text-gray-400" /> Добавить кейс
            </Link>
            <Link to="/admin/blog" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
              <Plus size={15} className="text-gray-400" /> Написать статью
            </Link>
            <a href="https://neeklo.ru" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
              <ExternalLink size={15} className="text-gray-400" /> Посмотреть сайт
            </a>
            <Link to="/admin/leads" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
              <ArrowRight size={15} className="text-gray-400" /> Открыть Канбан
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
