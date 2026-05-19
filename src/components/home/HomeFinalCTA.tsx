import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type Props = {
  lang: string;
  onOpenWizard: () => void;
};

export default function HomeFinalCTA({ lang, onOpenWizard }: Props) {
  const ru = lang === "ru";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; agreed?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!agreed) newErrors.agreed = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.20)",
    color: "white",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
    resize: "none" as const,
  };

  return (
    <section style={{ padding: "64px 16px 80px", borderTop: "1px solid var(--bd)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "var(--tx)",
            borderRadius: 24,
            padding: "clamp(32px, 5vw, 56px)",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
          className="lg:flex-row lg:gap-16"
        >
          {/* ── Left column ── */}
          <div className="lg:flex-1">
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              {ru ? "НАЧАТЬ ПРОЕКТ" : "START PROJECT"}
            </p>
            <h2
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(24px, 3.5vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "white",
                marginBottom: 16,
              }}
            >
              {ru ? <>Есть задача?<br />Обсудим прямо сейчас</> : <>Got a project?<br />Let's talk right now</>}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 340, marginBottom: 40 }}>
              {ru ? "Бесплатная консультация. Отвечаем быстро." : "Free consultation. We respond quickly."}
            </p>

            {/* Metrics */}
            <div className="flex gap-10">
              <div>
                <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3vw, 36px)", color: "white", lineHeight: 1 }}>44+</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{ru ? "проекта запущено" : "projects launched"}</p>
              </div>
              <div>
                <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3vw, 36px)", color: "white", lineHeight: 1 }}>{ru ? "5 лет" : "5 yrs"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{ru ? "в AI и digital" : "in AI & digital"}</p>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:w-[380px] lg:shrink-0">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 8 }}>
                  {ru ? "Заявка отправлена" : "Request sent"}
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  {ru ? "Ответим в течение 2 часов" : "We'll reply within 2 hours"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Name */}
                <div>
                  <input
                    type="text"
                    placeholder={ru ? "Как к вам обращаться" : "Your name"}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: false })); }}
                    style={fieldStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"; }}
                  />
                  {errors.name && <span style={{ fontSize: 11, color: "#fca5a5", display: "block", marginTop: 4 }}>{ru ? "Заполните поле" : "Required"}</span>}
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    placeholder="+7 999 000-00-00"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: false })); }}
                    style={fieldStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.phone ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"; }}
                  />
                  {errors.phone && <span style={{ fontSize: 11, color: "#fca5a5", display: "block", marginTop: 4 }}>{ru ? "Заполните поле" : "Required"}</span>}
                </div>

                {/* Task */}
                <textarea
                  rows={3}
                  placeholder={ru ? "Кратко опишите задачу или вопрос" : "Briefly describe your task"}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  style={{ ...fieldStyle, resize: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; }}
                />

                {/* Consent checkbox */}
                <div>
                  <label
                    className="flex items-start gap-2 cursor-pointer"
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}
                  >
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: false })); }}
                      style={{
                        marginTop: 2,
                        width: 15,
                        height: 15,
                        flexShrink: 0,
                        accentColor: "white",
                        cursor: "pointer",
                      }}
                    />
                    <span>
                      Я согласен(а) с{" "}
                      <Link to="/privacy" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline" }}>
                        политикой конфиденциальности
                      </Link>{" "}
                      и даю согласие на обработку персональных данных в соответствии с 152-ФЗ
                    </span>
                  </label>
                  {errors.agreed && (
                    <span style={{ fontSize: 11, color: "#fca5a5", display: "block", marginTop: 4 }}>
                      Необходимо ваше согласие
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    background: "white",
                    color: "var(--tx)",
                    fontSize: 15,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s, transform 0.15s",
                    minHeight: 44,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {ru ? "Начать проект" : "Start project"}
                </button>

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
