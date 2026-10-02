import { AlertTriangle } from "lucide-react";

/**
 * Честная пометка для разделов админки, у которых нет серверной части.
 * Такие экраны рисовали пустые таблицы и молча глотали 404 — выглядело как «данных нет»,
 * хотя на деле запрос не доходил никуда.
 */
export default function NotConnectedNotice({ what, endpoints }: { what: string; endpoints: string[] }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 20,
        borderRadius: 10,
        background: "color-mix(in oklab, orange 12%, transparent)",
        border: "1px solid color-mix(in oklab, orange 35%, transparent)",
      }}
    >
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <strong>Раздел не подключён к серверу.</strong> {what} не сохраняются: обработчиков{" "}
        {endpoints.map((e, i) => (
          <span key={e}>
            <code>{e}</code>
            {i < endpoints.length - 1 ? ", " : ""}
          </span>
        ))}{" "}
        на бэкенде пока нет. Экран оставлен как заготовка интерфейса.
      </div>
    </div>
  );
}
