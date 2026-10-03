/** Текст ошибки из ответа API (axios) без использования any. */
export function apiErrorMessage(e: unknown, fallback = "Не удалось выполнить действие"): string {
  const data = (e as { response?: { data?: { error?: string } } })?.response?.data;
  return data?.error || (e as Error)?.message || fallback;
}
