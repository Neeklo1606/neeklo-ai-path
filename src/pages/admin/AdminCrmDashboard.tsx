import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/admin-api";
import { Users, TrendingUp, Flame, DollarSign, ArrowRight, Clock } from "lucide-react";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  new:          { label: "Новые",         color: "#3B82F6" },
  qualified:    { label: "Квалификация",  color: "#8B5CF6" },
  proposal:     { label: "Предложение",   color: "#F59E0B" },
  negotiation:  { label: "Переговоры",    color: "#F97316" },
  won:          { label: "Выиграно",      color: "#22C55E" },
  lost:         { label: "Проиграно",     color: "#6B7280" },
};

const ACTIVITY_ICONS: Record<string, string> = {
  created:      "🆕",
  note:         "💬",
  status_change:"🔄",
  stage_change: "📋",
  deal_created: "💼",
};

function formatRub(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} тыс ₽`;
  return `${n} ₽`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}

type Stats = {
  totalContacts: number;
  newToday: number;
  hotLeads: number;
  dealsByStage: Record<string, { count: number; sum: number }>;
  totalRevenue: number;
  recentActivities: {
    id: string; type: string; text: string; createdAt: string;
    contact?: { id: string; name: string };
    deal?: { id: string; title: string };
  }[];
};

type Contact = { id: string; name: string; phone: string | null; status: string; source: string | null; score: number; createdAt: string };

export default function AdminCrmDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    adminApi.get<Stats>("/admin/crm/stats").then(r => setStats(r.data)).catch(() => {});
    adminApi.get<{ contacts: Contact[] }>("/admin/crm/contacts?limit=5").then(r => setContacts(r.data.contacts)).catch(() => {});
  }, []);

  const totalDeals = stats ? Object.values(stats.dealsByStage).reduce((a, b) => a + b.count, 0) : 0;
  const openRevenue = stats ? Object.entries(stats.dealsByStage)
    .filter(([k]) => k !== "won" && k !== "lost")
    .reduce((a, [, v]) => a + v.sum, 0) : 0;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 4 }}>CRM — Дашборд</h1>
        <p style={{ fontSize: 13, color: "#666" }}>Обзор контактов, сделок и активности</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { icon: <Users size={18} />, label: "Всего контактов", value: stats?.totalContacts ?? "—", color: "#3B82F6", bg: "#EFF6FF" },
          { icon: <TrendingUp size={18} />, label: "Новых сегодня", value: stats?.newToday ?? "—", color: "#22C55E", bg: "#F0FDF4" },
          { icon: <Flame size={18} />, label: "Горячих лидов", value: stats?.hotLeads ?? "—", color: "#F97316", bg: "#FFF7ED" },
          { icon: <DollarSign size={18} />, label: "В работе", value: openRevenue > 0 ? formatRub(openRevenue) : (totalDeals > 0 ? `${totalDeals} сделок` : "—"), color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: kpi.bg, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 28 }}>
        {/* Recent Activities */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>Последние активности</h2>
          {!stats?.recentActivities?.length ? (
            <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "24px 0" }}>Активностей пока нет</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recentActivities.map(act => (
                <div key={act.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                    {ACTIVITY_ICONS[act.type] || "📌"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#111", lineHeight: 1.4, marginBottom: 2 }}>{act.text}</p>
                    <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#9CA3AF" }}>
                      {act.contact && (
                        <Link to={`/admin/crm/contacts`} style={{ color: "#3B82F6", textDecoration: "none", fontWeight: 500 }}>
                          {act.contact.name}
                        </Link>
                      )}
                      {act.deal && <span>{act.deal.title}</span>}
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {timeAgo(act.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deals by stage */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>Сделки по стадиям</h2>
          {!stats || totalDeals === 0 ? (
            <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "24px 0" }}>Сделок пока нет</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(STAGE_LABELS).map(([key, { label, color }]) => {
                const stage = stats.dealsByStage[key];
                const count = stage?.count || 0;
                const pct = totalDeals > 0 ? (count / totalDeals) * 100 : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: "#374151", fontWeight: 500 }}>{label}</span>
                      <span style={{ color: "#6B7280" }}>{count} сделок{stage?.sum ? ` · ${formatRub(stage.sum)}` : ""}</span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 9999 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 9999, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent contacts */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Последние контакты</h2>
          <Link to="/admin/crm/contacts" style={{ fontSize: 13, color: "#3B82F6", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Все контакты <ArrowRight size={13} />
          </Link>
        </div>
        {contacts.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "16px 0" }}>Контактов пока нет</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["Имя", "Телефон", "Источник", "Статус", "Оценка", "Добавлен"].map(h => (
                  <th key={h} style={{ padding: "6px 12px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <Link to="/admin/crm/contacts" style={{ fontSize: 13, fontWeight: 600, color: "#111", textDecoration: "none" }}>{c.name}</Link>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#4B5563" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#6B7280" }}>{c.source || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: "#F3F4F6", borderRadius: 9999, maxWidth: 60 }}>
                        <div style={{ width: `${c.score}%`, height: "100%", background: c.score >= 70 ? "#22C55E" : c.score >= 40 ? "#F59E0B" : "#E5E7EB", borderRadius: 9999 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>{c.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#9CA3AF" }}>
                    {new Date(c.createdAt).toLocaleDateString("ru", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    new:       { label: "Новый",    bg: "#EFF6FF", color: "#3B82F6" },
    contacted: { label: "В работе", bg: "#F0FDF4", color: "#22C55E" },
    qualified: { label: "Горячий",  bg: "#FFF7ED", color: "#F97316" },
    client:    { label: "Клиент",   bg: "#F5F3FF", color: "#8B5CF6" },
    lost:      { label: "Отказ",    bg: "#F9FAFB", color: "#6B7280" },
  };
  const s = map[status] || { label: status, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
