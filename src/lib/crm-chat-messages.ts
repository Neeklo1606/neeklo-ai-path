/** Преобразование JSON сообщений из `crm_chats.messages` в формат UI админки */

export type AdminChatLine = {
  id: string;
  from: "client" | "manager";
  name: string;
  text: string;
  time: string;
  read?: boolean;
  /** Сообщение ассистента (слева, подпись AI) */
  isAi?: boolean;
};

export function mapCrmJsonMessagesToAdmin(json: unknown): AdminChatLine[] {
  if (!Array.isArray(json)) return [];
  return json.map((entry: Record<string, unknown>, i: number) => {
    const role = String(entry?.role ?? "");
    const text = String(entry?.content ?? "");
    const rawAt = entry?.at;
    const at = rawAt ? new Date(String(rawAt)) : new Date();
    const time = Number.isNaN(at.getTime())
      ? ""
      : at.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

    if (role === "user") {
      return { id: `u-${i}`, from: "client", name: "Клиент", text, time };
    }
    if (role === "assistant") {
      return { id: `a-${i}`, from: "client", name: "AI (ассистент)", text, time, isAi: true };
    }
    if (role === "manager") {
      return { id: `m-${i}`, from: "manager", name: "Менеджер", text, time, read: true };
    }
    return { id: `x-${i}`, from: "client", name: "…", text, time };
  });
}
