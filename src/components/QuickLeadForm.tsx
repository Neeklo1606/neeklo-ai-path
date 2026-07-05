import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import { TELEGRAM_URL } from "@/constants";
import { CMS_BASE } from "@/lib/cms-api";

/**
 * Быстрая форма заявки: одно поле (телефон) + кнопка с оффером.
 * Заменяет BriefWizard как основную точку входа (hero, StickyCTA, финальный CTA).
 *
 * Отправка: POST /crm/public-lead (через CMS_BASE). При сетевой ошибке —
 * мягкое сообщение с запасным путём «Написать в Telegram».
 */

// Маска телефона — идентична BriefWizard
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits && !digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 1) return "+7";
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

type Props = {
  /** panel — крупная форма (финальный CTA, консалтинг); bar — компактный sticky-бар на мобильном */
  variant?: "panel" | "bar";
  /** Метка источника заявки — пишется в serviceId */
  source?: string;
};

export default function QuickLeadForm({ variant = "panel", source = "quick-form" }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [netError, setNetError] = useState(false);

  const isBar = variant === "bar";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11) {
      setError("Введите полный номер");
      return;
    }
    setError("");
    setNetError(false);
    setLoading(true);
    try {
      const res = await fetch(`${CMS_BASE}/crm/public-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone,
          source,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSent(true);
    } catch (err) {
      console.error("Lead submit failed:", err);
      setNetError(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Экран успеха ──
  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: isBar ? "10px 16px" : "24px 0" }}>
        <p style={{ fontSize: isBar ? 14 : 18, fontWeight: 700, color: isBar ? "var(--tx)" : "white", marginBottom: isBar ? 2 : 6 }}>
          Спасибо! Напишем в течение 2 часов
        </p>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{
            marginTop: isBar ? 4 : 12,
            padding: isBar ? "8px 16px" : "12px 24px",
            borderRadius: 9999,
            background: "var(--accent-signal)",
            color: "var(--bg)",
            fontSize: isBar ? 13 : 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Send size={14} />
          Написать в Telegram сейчас
        </a>
      </div>
    );
  }

  // ── Сетевая ошибка — мягкий фолбэк с прямым путём в Telegram ──
  if (netError) {
    return (
      <div style={{ textAlign: "center", padding: isBar ? "8px 12px" : "20px 0" }}>
        <p style={{ fontSize: isBar ? 13 : 15, fontWeight: 600, color: isBar ? "var(--tx)" : "white", marginBottom: isBar ? 4 : 8, lineHeight: 1.4 }}>
          Не удалось отправить. Напишите нам напрямую — ответим сразу.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{
              padding: isBar ? "8px 16px" : "12px 24px",
              borderRadius: 9999,
              background: "var(--accent-signal)",
              color: "var(--bg)",
              fontSize: isBar ? 13 : 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Send size={14} />
            Написать в Telegram
          </a>
          <button
            type="button"
            onClick={() => { setNetError(false); }}
            className="transition-opacity hover:opacity-80"
            style={{
              padding: isBar ? "8px 14px" : "12px 20px",
              borderRadius: 9999,
              background: "transparent",
              border: `1px solid ${isBar ? "var(--bd)" : "rgba(255,255,255,0.3)"}`,
              color: isBar ? "var(--tx-muted)" : "rgba(255,255,255,0.8)",
              fontSize: isBar ? 13 : 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Попробовать ещё раз
          </button>
        </div>
      </div>
    );
  }

  // ── Компактный бар (мобильный sticky) ──
  if (isBar) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <input
          type="tel"
          inputMode="tel"
          placeholder="+7 (999) 000-00-00"
          value={phone}
          onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
          aria-label="Телефон"
          style={{
            flex: 1,
            minWidth: 0,
            height: 44,
            padding: "0 14px",
            borderRadius: 9999,
            background: "var(--surface-2)",
            border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "var(--bd)"}`,
            color: "var(--tx)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 shrink-0 transition-transform duration-100 active:scale-[0.96] disabled:opacity-60"
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 9999,
            background: "var(--accent-signal)",
            color: "var(--bg)",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Отправка…" : "Скидка 10%"}
          {!loading && <ArrowRight size={13} strokeWidth={2.5} />}
        </button>
      </form>
    );
  }

  // ── Панельная форма (финальный CTA) ──
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <input
          type="tel"
          inputMode="tel"
          placeholder="+7 (999) 000-00-00"
          value={phone}
          onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
          aria-label="Телефон"
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.10)",
            border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"}`,
            color: "white",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"; }}
        />
        {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-60"
        style={{
          minHeight: 48,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          background: "var(--accent-signal)",
          color: "#0B0C0E",
        }}
      >
        {loading ? "Отправляем…" : "Получить скидку 10% и бесплатную диагностику →"}
      </button>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, textAlign: "center" }}>
        Отправляя форму, вы соглашаетесь с{" "}
        <Link to="/privacy" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline" }}>
          политикой конфиденциальности
        </Link>
      </p>
    </form>
  );
}
