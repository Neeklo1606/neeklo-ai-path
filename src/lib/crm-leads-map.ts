/** UI-модель лида в админке (таблица / карточки) */
export interface CrmLeadUi {
  id: string;
  /** Связанный чат сайта (crm_chats) — для переписки в админке */
  chatId: string | null;
  num: string;
  name: string;
  contact: string;
  source: string;
  service: string;
  budget: number;
  prepaid: number;
  balance: number;
  deadline: string;
  daysLeft: number;
  status: string;
  manager: string;
  comment: string;
  unread: number;
  /** Превью последней реплики из CRM (GET /crm/leads) */
  lastMessagePreview: string | null;
}

/** Ответ GET /crm/leads */
export type ApiCrmLead = {
  id: string;
  name: string | null;
  /** Имя для UI: из БД или первое сообщение пользователя в чате */
  display_name?: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  chats_count: number;
  chat_id: string | null;
  last_message_preview?: string | null;
  message_count?: number;
};

const UI_STATUSES = new Set(["in_progress", "done", "new", "cancelled"]);

/** Приводит статус из БД к ключам `leadStatusConfig` в админке */
export function normalizeLeadStatus(raw: string): string {
  const s = (raw || "new").toLowerCase();
  if (UI_STATUSES.has(s)) return s;
  if (s === "completed" || s === "завершён" || s === "завершен") return "done";
  if (s === "canceled" || s === "отмена") return "cancelled";
  if (s === "working" || s === "progress") return "in_progress";
  return "new";
}

function formatDeadline(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

/** Строит UI-модель лида из CRM API (бюджет/менеджер в БД пока нет — показываем «—» и 0) */
export function mapApiLeadToUi(row: ApiCrmLead, index: number): CrmLeadUi {
  const created = new Date(row.created_at);
  const st = normalizeLeadStatus(row.status);
  const display =
    (row.display_name && row.display_name.trim()) ||
    (row.name && row.name.trim()) ||
    "";
  return {
    id: row.id,
    chatId: row.chat_id ?? null,
    num: String(index + 1).padStart(3, "0"),
    name: display || "Без имени",
    contact: (row.phone && row.phone.trim()) || "—",
    source: "CRM",
    service: "—",
    budget: 0,
    prepaid: 0,
    balance: 0,
    deadline: formatDeadline(created),
    daysLeft: st === "done" || st === "cancelled" ? 0 : 14,
    status: st,
    manager: "—",
    comment: "",
    /** Непрочитанное без отдельной таблицы не считаем — не показываем ложные бейджи */
    unread: 0,
    lastMessagePreview: row.last_message_preview ?? null,
  };
}
