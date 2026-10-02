import { RefreshCw, AlertCircle } from "lucide-react";

type Props = {
  loading: boolean;
  error: unknown;
  /** Данные загрузились, но список пуст */
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  /** Высота заглушки, чтобы блок не прыгал */
  minHeight?: number;
};

/**
 * Состояния блока с данными: загрузка, ошибка с повтором, пусто.
 * До этого при недоступном API секции кейсов, видео и блога молча показывали
 * заголовок и ноль карточек — посетитель не понимал, что это сбой.
 * Возвращает null, когда данные есть и их можно рисовать.
 */
export default function DataState({ loading, error, empty, emptyText, onRetry, minHeight = 160 }: Props) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight, color: "var(--tx-faint)", fontSize: 14 }}
        role="status"
        aria-live="polite"
      >
        <RefreshCw size={16} className="animate-spin" style={{ marginRight: 8 }} />
        Загружаем…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{
          minHeight,
          gap: 12,
          padding: "24px 16px",
          borderRadius: 12,
          background: "var(--surface-2)",
          border: "1px solid var(--bd)",
        }}
        role="alert"
      >
        <AlertCircle size={20} style={{ color: "var(--tx-muted)" }} />
        <p style={{ fontSize: 14, color: "var(--tx)", margin: 0 }}>Не удалось загрузить данные</p>
        <p style={{ fontSize: 13, color: "var(--tx-faint)", margin: 0 }}>
          Похоже, сервис временно недоступен. Попробуйте ещё раз.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{
              marginTop: 4,
              padding: "8px 16px",
              borderRadius: 9999,
              border: "1px solid var(--bd-hover)",
              background: "transparent",
              color: "var(--tx)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} />
            Повторить
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className="flex items-center justify-center text-center"
        style={{ minHeight, color: "var(--tx-faint)", fontSize: 14 }}
      >
        {emptyText || "Пока пусто"}
      </div>
    );
  }

  return null;
}
