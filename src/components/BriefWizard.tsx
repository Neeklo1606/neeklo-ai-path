import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, Check, Clock } from "lucide-react";
import { SOLUTIONS, BUDGET_OPTIONS } from "@/data/homeData";

export type WizardData = {
  serviceId: string;
  budget: string;
  name: string;
  contact: string;
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

export default function BriefWizard({ open, initialServiceId, lang, onClose }: Props) {
  const navigate = useNavigate();
  const ru = lang === "ru";

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setDirection(1);
      setSubmitted(false);
      setBudget("");
      setName("");
      setContact("");
      setAgreed(false);
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
    const data: WizardData = { serviceId, budget, name, contact };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      navigate("/chat");
    }, 1600);
  };

  const step1Valid = !!serviceId;
  const step2Valid = !!budget;
  const step3Valid = name.trim().length >= 2 && contact.trim().length >= 3 && agreed;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 32 : -32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -32 : 32, opacity: 0 }),
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

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 flex-shrink-0"
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
                  ? (ru ? "Отлично!" : "Great!")
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

        {/* Progress bar */}
        {!submitted && (
          <div style={{ height: 2, background: "var(--bd)" }}>
            <motion.div
              animate={{ width: `${(step / STEPS) * 100}%` }}
              transition={{ duration: 0.35, ease }}
              style={{ height: "100%", background: "var(--tx)" }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "24px 24px 28px" }}>
          <AnimatePresence mode="wait" custom={direction}>
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
                  style={{ width: 56, height: 56, background: "var(--ac-b)", opacity: 0.15 + 1 }}
                >
                  <Check size={24} strokeWidth={2.5} style={{ color: "var(--ac-b)" }} />
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--tx)", marginBottom: 8 }}>
                  {ru ? "Переходим в чат!" : "Opening chat!"}
                </p>
                <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.6 }}>
                  {ru
                    ? "Данные брифа загружены. AI-ассистент уже в курсе вашего запроса."
                    : "Brief loaded. Our AI assistant already knows your request."}
                </p>
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
                  contact={contact}
                  onChangeName={setName}
                  onChangeContact={setContact}
                  valid={step3Valid}
                  agreed={agreed}
                  onChangeAgreed={setAgreed}
                  serviceName={selectedService?.name[ru ? "ru" : "en"] ?? ""}
                  budget={budget}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA (steps 1–2 auto-advance, step 3 has inline submit) */}
        {!submitted && step === 1 && (
          <div style={{ padding: "0 24px 24px", flexShrink: 0 }}>
            <button
              onClick={() => go(2)}
              disabled={!step1Valid}
              className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
              style={{
                height: 48,
                borderRadius: 12,
                background: "var(--tx)",
                color: "var(--bg)",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: step1Valid ? "pointer" : "not-allowed",
              }}
            >
              {ru ? "Далее" : "Next"}
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
        {!submitted && step === 2 && (
          <div style={{ padding: "0 24px 24px", flexShrink: 0 }}>
            <button
              onClick={() => go(3)}
              disabled={!step2Valid}
              className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
              style={{
                height: 48,
                borderRadius: 12,
                background: "var(--tx)",
                color: "var(--bg)",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: step2Valid ? "pointer" : "not-allowed",
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
              padding: "14px 16px",
              minHeight: 52,
              borderRadius: 12,
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
              padding: "16px 18px",
              minHeight: 52,
              borderRadius: 12,
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
function Step3({
  ru, name, contact, onChangeName, onChangeContact, valid, agreed, onChangeAgreed, serviceName, budget, onSubmit,
}: {
  ru: boolean;
  name: string;
  contact: string;
  onChangeName: (v: string) => void;
  onChangeContact: (v: string) => void;
  valid: boolean;
  agreed: boolean;
  onChangeAgreed: (v: boolean) => void;
  serviceName: string;
  budget: string;
  onSubmit: () => void;
}) {
  const budgetLabel = BUDGET_OPTIONS.find((b) => b.id === budget)?.[ru ? "ru" : "en"] ?? budget;
  return (
    <div className="flex flex-col gap-5">
      {/* Brief summary pill */}
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

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 8 }}>
          {ru ? "Как вас зовут?" : "Your name"}
        </label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value.slice(0, 100))}
          placeholder={ru ? "Имя или компания" : "Name or company"}
          autoFocus
          style={{
            width: "100%",
            height: 46,
            padding: "0 14px",
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--bd)",
            color: "var(--tx)",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--bd-hover)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--bd)"; }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 8 }}>
          {ru ? "Телефон или Telegram" : "Phone or Telegram"}
        </label>
        <input
          value={contact}
          onChange={(e) => onChangeContact(e.target.value.slice(0, 100))}
          placeholder={ru ? "+7 … или @username" : "+1 … or @username"}
          style={{
            width: "100%",
            height: 46,
            padding: "0 14px",
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--bd)",
            color: "var(--tx)",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--bd-hover)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--bd)"; }}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onSubmit(); }}
        />
        <p style={{ fontSize: 12, color: "var(--tx-faint)", marginTop: 6 }}>
          {ru ? "Ответим в течение часа" : "We'll reply within an hour"}
        </p>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--tx-faint)", lineHeight: 1.5 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChangeAgreed(e.target.checked)}
          style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0, cursor: "pointer", accentColor: "var(--tx)" }}
        />
        <span>
          {ru
            ? <>Я согласен(а) с <Link to="/privacy" style={{ color: "var(--tx-muted)", textDecoration: "underline" }}>политикой конфиденциальности</Link> и даю согласие на обработку персональных данных (152-ФЗ)</>
            : <>I agree to the <Link to="/privacy" style={{ color: "var(--tx-muted)", textDecoration: "underline" }}>privacy policy</Link> and consent to personal data processing</>
          }
        </span>
      </label>

      <button
        onClick={onSubmit}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
        style={{
          height: 48,
          borderRadius: 12,
          background: "var(--tx)",
          color: "var(--bg)",
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          cursor: valid ? "pointer" : "not-allowed",
          marginTop: 4,
        }}
      >
        {ru ? "Отправить заявку" : "Submit request"}
        <ArrowRight size={15} strokeWidth={2.5} />
      </button>

      {/* Trust line */}
      <div className="flex items-center gap-3" style={{ fontSize: 12, color: "var(--tx-faint)", marginTop: 14 }}>
        <span className="flex items-center gap-1">
          <Clock size={12} strokeWidth={1.8} />
          {ru ? "около 1 минуты" : "about 1 minute"}
        </span>
        <span>·</span>
        <span>{ru ? "Ответ в течение 2 часов" : "Reply within 2 hours"}</span>
      </div>
    </div>
  );
}
