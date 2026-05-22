import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, Check, Send } from "lucide-react";
import { SOLUTIONS, BUDGET_OPTIONS } from "@/data/homeData";

export type WizardData = {
  serviceId: string;
  budget: string;
  name: string;
  phone: string;
  telegram: string;
};

type Props = {
  open: boolean;
  initialServiceId?: string;
  lang: string;
  onClose: () => void;
};

const STEPS = 3;
const ease = [0.16, 1, 0.3, 1] as const;
const STORAGE_KEY = "neeklo_wizard_brief";
const TELEGRAM_ASSISTANT = "https://t.me/neeekn";

// ─── Phone mask ────────────────────────────────────────────────────────────────
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

// ─── Telegram format ───────────────────────────────────────────────────────────
function formatTelegram(raw: string): string {
  if (!raw) return "";
  const clean = raw.replace(/^@+/, "");
  if (!clean) return "@";
  return "@" + clean.slice(0, 32);
}

export default function BriefWizard({ open, initialServiceId, lang, onClose }: Props) {
  const ru = lang === "ru";

  const [step, setStep]         = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [budget, setBudget]       = useState("");
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [telegram, setTelegram]   = useState("");
  const [agreed, setAgreed]       = useState(false);

  // contact error state (shown on submit attempt)
  const [contactError, setContactError] = useState("");
  const [phoneError, setPhoneError]     = useState("");

  useEffect(() => {
    if (open) {
      setStep(1); setDirection(1); setSubmitted(false);
      setBudget(""); setName(""); setPhone(""); setTelegram("");
      setAgreed(false); setContactError(""); setPhoneError("");
      setServiceId(initialServiceId ?? "");
    }
  }, [open, initialServiceId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const go = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const handleSubmit = () => {
    // Validate contacts
    const phoneDigits = phone.replace(/\D/g, "");
    const telegramFilled = telegram && telegram.length > 1;
    const phoneFilled    = phone && phoneDigits.length === 11;

    let hasError = false;

    if (phone && phoneDigits.length !== 11) {
      setPhoneError(ru ? "Введите полный номер" : "Enter full number");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (!phoneFilled && !telegramFilled) {
      setContactError(
        ru
          ? "Укажите телефон или Telegram — хотя бы один способ связи"
          : "Enter phone or Telegram — at least one contact"
      );
      hasError = true;
    } else {
      setContactError("");
    }

    if (hasError) return;

    const data: WizardData = { serviceId, budget, name, phone, telegram };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    setSubmitted(true);
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const nameValid   = name.trim().length >= 2;
  const phoneFilled = phone && phoneDigits.length === 11;
  const tgFilled    = telegram && telegram.length > 1;
  const step3Valid  = nameValid && (phoneFilled || tgFilled) && agreed;

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 32 : -32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -32 : 32, opacity: 0 }),
  };

  const selectedService = SOLUTIONS.find((s) => s.id === serviceId);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end md:justify-center md:items-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.28, ease }}
        className="brief-wizard-sheet relative w-full flex flex-col"
        style={{
          maxWidth: 520,
          background: "var(--surface)",
          border: "1px solid var(--bd)",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          maxHeight: "92dvh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@media (min-width: 768px) { .brief-wizard-sheet { border-radius: 20px !important; } }`}</style>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ height: 60, borderBottom: "1px solid var(--bd)" }}
        >
          <div className="flex items-center gap-3">
            {step > 1 && !submitted && (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                style={{ background: "var(--surface-2)", border: "none", color: "var(--tx-muted)", cursor: "pointer" }}
              >
                <ArrowLeft size={14} strokeWidth={2} />
              </button>
            )}
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--tx)" }}>
                {submitted
                  ? (ru ? "Заявка отправлена" : "Request sent")
                  : step === 1
                  ? (ru ? "Что нужно сделать?" : "What do you need?")
                  : step === 2
                  ? (ru ? "Бюджет проекта" : "Project budget")
                  : (ru ? "Контакты" : "Your contacts")}
              </p>
              {!submitted && (
                <p style={{ fontSize: 12, color: "var(--tx-faint)" }}>
                  {ru ? `Шаг ${step} из ${STEPS}` : `Step ${step} of ${STEPS}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ background: "var(--surface-2)", border: "none", color: "var(--tx-muted)", cursor: "pointer" }}
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        {!submitted && (
          <div style={{ height: 2, background: "var(--bd)", flexShrink: 0 }}>
            <motion.div
              animate={{ width: `${(step / STEPS) * 100}%` }}
              transition={{ duration: 0.35, ease }}
              style={{ height: "100%", background: "var(--tx)" }}
            />
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "20px 20px 24px" }}>
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── Success screen ── */}
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <div
                  className="flex items-center justify-center rounded-full mb-5"
                  style={{ width: 56, height: 56, background: "var(--ac-b)", opacity: 0.15 }}
                />
                <div
                  className="flex items-center justify-center rounded-full -mt-14 mb-5"
                  style={{ width: 56, height: 56 }}
                >
                  <Check size={26} strokeWidth={2.5} style={{ color: "var(--ac-b)" }} />
                </div>

                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--tx)", marginBottom: 8 }}>
                  {ru ? "Заявка отправлена" : "Request sent!"}
                </p>
                <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6, marginBottom: 4 }}>
                  {ru ? "Менеджер свяжется с вами в течение часа" : "A manager will contact you within an hour"}
                </p>
                <p style={{ fontSize: 13, color: "var(--tx-faint)", lineHeight: 1.5, marginBottom: 28 }}>
                  {ru ? "Пока ждёте — можете задать вопросы нашему ассистенту" : "While you wait, feel free to ask our assistant"}
                </p>

                <a
                  href={TELEGRAM_ASSISTANT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl font-semibold transition-opacity hover:opacity-85"
                  style={{
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    background: "var(--tx)",
                    color: "var(--bg)",
                    fontSize: 15,
                    textDecoration: "none",
                  }}
                >
                  <Send size={15} strokeWidth={2} />
                  {ru ? "Написать ассистенту" : "Message assistant"}
                </a>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease }}>
                <Step1
                  ru={ru}
                  selectedId={serviceId}
                  onSelect={(id) => { setServiceId(id); setTimeout(() => go(2), 180); }}
                />
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease }}>
                <Step2
                  ru={ru}
                  selected={budget}
                  onSelect={(b) => { setBudget(b); setTimeout(() => go(3), 180); }}
                />
              </motion.div>
            ) : (
              <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease }}>
                <Step3
                  ru={ru}
                  name={name}
                  phone={phone}
                  telegram={telegram}
                  onChangeName={setName}
                  onChangePhone={(v) => {
                    setPhone(formatPhone(v));
                    setPhoneError("");
                    setContactError("");
                  }}
                  onChangeTelegram={(v) => {
                    setTelegram(formatTelegram(v));
                    setContactError("");
                  }}
                  phoneError={phoneError}
                  contactError={contactError}
                  agreed={agreed}
                  onChangeAgreed={setAgreed}
                  serviceName={selectedService?.name[ru ? "ru" : "en"] ?? ""}
                  budget={budget}
                  step3Valid={step3Valid}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer CTA (steps 1–2 only) ── */}
        {!submitted && step === 1 && (
          <div style={{ padding: "0 20px 20px", flexShrink: 0 }}>
            <button
              onClick={() => go(2)}
              disabled={!serviceId}
              className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
              style={{
                height: 48, borderRadius: 12,
                background: "var(--tx)", color: "var(--bg)",
                fontSize: 15, fontWeight: 600, border: "none",
                cursor: serviceId ? "pointer" : "not-allowed",
              }}
            >
              {ru ? "Далее" : "Next"}
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
        {!submitted && step === 2 && (
          <div style={{ padding: "0 20px 20px", flexShrink: 0 }}>
            <button
              onClick={() => go(3)}
              disabled={!budget}
              className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
              style={{
                height: 48, borderRadius: 12,
                background: "var(--tx)", color: "var(--bg)",
                fontSize: 15, fontWeight: 600, border: "none",
                cursor: budget ? "pointer" : "not-allowed",
              }}
            >
              {ru ? "Далее" : "Next"}
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Step 1: Service selection ─────────────────────────────────────────────────
function Step1({ ru, selectedId, onSelect }: { ru: boolean; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {SOLUTIONS.map((s) => {
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-3 text-left transition-all duration-150 active:scale-[0.98]"
            style={{
              padding: "14px 16px", minHeight: 52, borderRadius: 12,
              background: active ? "var(--surface-3)" : "var(--surface-2)",
              border: active ? "1.5px solid var(--tx)" : "1px solid var(--bd)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd-hover)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd)"; }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</span>
            <div className="flex-1">
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)", marginBottom: 2 }}>
                {s.name[ru ? "ru" : "en"]}
              </p>
              <p style={{ fontSize: 12, color: "var(--tx-faint)" }}>
                {s.price[ru ? "ru" : "en"]} · {s.duration[ru ? "ru" : "en"]}
              </p>
            </div>
            {active && <Check size={16} strokeWidth={2.5} style={{ color: "var(--tx)", flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 2: Budget ────────────────────────────────────────────────────────────
function Step2({ ru, selected, onSelect }: { ru: boolean; selected: string; onSelect: (b: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {BUDGET_OPTIONS.map((b) => {
        const active = b.id === selected;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className="flex items-center justify-between text-left transition-all duration-150 active:scale-[0.98]"
            style={{
              padding: "16px 18px", minHeight: 52, borderRadius: 12,
              background: active ? "var(--surface-3)" : "var(--surface-2)",
              border: active ? "1.5px solid var(--tx)" : "1px solid var(--bd)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd-hover)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd)"; }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--tx)" }}>
              {b[ru ? "ru" : "en"]}
            </span>
            {active && <Check size={16} strokeWidth={2.5} style={{ color: "var(--tx)" }} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 3: Contact form ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px",
  borderRadius: 10, background: "var(--surface-2)",
  border: "1px solid var(--bd)", color: "var(--tx)",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "rgba(239,68,68,0.6)",
};

function Step3({
  ru, name, phone, telegram,
  onChangeName, onChangePhone, onChangeTelegram,
  phoneError, contactError,
  agreed, onChangeAgreed,
  serviceName, budget, step3Valid, onSubmit,
}: {
  ru: boolean;
  name: string;
  phone: string;
  telegram: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeTelegram: (v: string) => void;
  phoneError: string;
  contactError: string;
  agreed: boolean;
  onChangeAgreed: (v: boolean) => void;
  serviceName: string;
  budget: string;
  step3Valid: boolean;
  onSubmit: () => void;
}) {
  const budgetLabel = BUDGET_OPTIONS.find((b) => b.id === budget)?.[ru ? "ru" : "en"] ?? budget;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary pill */}
      {serviceName && (
        <div
          className="flex items-center gap-2"
          style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--bd)" }}
        >
          <span style={{ fontSize: 12, color: "var(--tx-faint)" }}>{serviceName}</span>
          {budgetLabel && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--bd)", display: "block", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--tx-faint)" }}>{budgetLabel}</span>
            </>
          )}
        </div>
      )}

      {/* Name */}
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 6 }}>
          {ru ? "Как вас зовут?" : "Your name"}
        </label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value.slice(0, 100))}
          placeholder={ru ? "Имя или компания" : "Name or company"}
          autoFocus
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "var(--bd-hover)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--bd)"; }}
        />
      </div>

      {/* Phone */}
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 6 }}>
          {ru ? "Телефон" : "Phone"}
          <span style={{ fontWeight: 400, color: "var(--tx-faint)", marginLeft: 6, fontSize: 12 }}>
            {ru ? "(необязательно)" : "(optional)"}
          </span>
        </label>
        <input
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="+7 (999) 000-00-00"
          type="tel"
          inputMode="tel"
          style={phoneError ? inputErrorStyle : inputStyle}
          onFocus={(e) => { e.target.style.borderColor = phoneError ? "rgba(239,68,68,0.6)" : "var(--bd-hover)"; }}
          onBlur={(e) => { e.target.style.borderColor = phoneError ? "rgba(239,68,68,0.6)" : "var(--bd)"; }}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        />
        {phoneError && (
          <p style={{ fontSize: 11, color: "rgb(239,68,68)", marginTop: 4 }}>{phoneError}</p>
        )}
      </div>

      {/* Telegram */}
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 6 }}>
          Telegram
          <span style={{ fontWeight: 400, color: "var(--tx-faint)", marginLeft: 6, fontSize: 12 }}>
            {ru ? "(необязательно)" : "(optional)"}
          </span>
        </label>
        <input
          value={telegram}
          onChange={(e) => onChangeTelegram(e.target.value)}
          placeholder="@username"
          type="text"
          inputMode="text"
          style={contactError && !telegram ? inputErrorStyle : inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--bd-hover)";
            // Auto-add @ on first focus if empty
            if (!telegram) onChangeTelegram("@");
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--bd)";
            // Clear bare @ on blur
            if (telegram === "@") onChangeTelegram("");
          }}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        />
        {/* Combined contact error */}
        {contactError && (
          <p style={{ fontSize: 11, color: "rgb(239,68,68)", marginTop: 4 }}>{contactError}</p>
        )}
      </div>

      {/* Consent */}
      <label className="flex items-start gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChangeAgreed(e.target.checked)}
          style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0, cursor: "pointer", accentColor: "var(--tx)" }}
        />
        <span>
          {ru
            ? <>Согласен(а) с <Link to="/privacy" style={{ color: "var(--tx-muted)", textDecoration: "underline" }}>политикой конфиденциальности</Link> и обработкой данных (152-ФЗ)</>
            : <>I agree to the <Link to="/privacy" style={{ color: "var(--tx-muted)", textDecoration: "underline" }}>privacy policy</Link> and data processing</>
          }
        </span>
      </label>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!agreed || !name.trim()}
        className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
        style={{
          height: 48, borderRadius: 12,
          background: "var(--tx)", color: "var(--bg)",
          fontSize: 15, fontWeight: 600, border: "none",
          cursor: (!agreed || !name.trim()) ? "not-allowed" : "pointer",
          marginTop: 2,
        }}
      >
        {ru ? "Отправить заявку" : "Submit request"}
        <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
