import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type Props = {
  lang: string;
  onOpenWizard: () => void;
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

const fieldErrorStyle: React.CSSProperties = {
  ...fieldStyle,
  borderColor: "rgba(239,68,68,0.6)",
};

export default function HomeFinalCTA({ lang, onOpenWizard }: Props) {
  const ru = lang === "ru";

  const [values, setValues] = useState({ name: "", contact: "", message: "" });
  const [errors, setErrors] = useState({ name: "", contact: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const next = {
      name: values.name.trim() === "" ? "Введите ваше имя" : "",
      contact: values.contact.trim() === "" ? "Укажите телефон или Telegram" : "",
    };
    setErrors(next);
    return next.name === "" && next.contact === "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: connect to /api/brief-submissions
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess(true);
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: "name" | "contact" | "message") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (field !== "message") {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  return (
    <section style={{ padding: "64px 16px 80px", borderTop: "1px solid var(--bd)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row gap-10 lg:gap-16"
          style={{
            background: "linear-gradient(135deg, #111118 0%, #1a1a2a 100%)",
            borderRadius: 24,
            padding: "clamp(32px, 5vw, 56px)",
          }}
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
              {ru ? "Обсудим ваш проект" : "Let's talk about your project"}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 340 }}>
              {ru ? "Бесплатная консультация. Отвечаем быстро." : "Free consultation. We respond quickly."}
            </p>

          </div>

          {/* ── Right column ── */}
          <div className="lg:w-[380px] lg:shrink-0">
            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="py-8 text-center"
              >
                <p
                  className="font-bold text-xl text-white"
                  style={{ fontFamily: "'Onest', sans-serif" }}
                >
                  Заявка отправлена
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Ответим в течение 2 часов
                </p>
                <a
                  href="https://t.me/neeekn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-white/80 hover:text-white underline text-sm transition-colors"
                >
                  Или напишите в Telegram прямо сейчас
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Name */}
                <div>
                  <input
                    type="text"
                    placeholder={ru ? "Как к вам обращаться" : "Your name"}
                    value={values.name}
                    onChange={handleChange("name")}
                    style={errors.name ? fieldErrorStyle : fieldStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"; }}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <input
                    type="text"
                    placeholder="+7 999 000-00-00 или @username"
                    value={values.contact}
                    onChange={handleChange("contact")}
                    style={errors.contact ? fieldErrorStyle : fieldStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.contact ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.20)"; }}
                  />
                  {errors.contact && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.contact}</p>
                  )}
                </div>

                {/* Message (optional) */}
                <textarea
                  rows={2}
                  placeholder={ru ? "Ваш проект или задача" : "Your project or task"}
                  value={values.message}
                  onChange={handleChange("message")}
                  style={{ ...fieldStyle, resize: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; }}
                />

                {/* Privacy note */}
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  Отправляя форму, вы соглашаетесь с{" "}
                  <Link to="/privacy" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline" }}>
                    политикой конфиденциальности
                  </Link>
                </p>

                {/* Primary — submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-base bg-white text-[#0A0A0A] hover:bg-white/90 disabled:opacity-60 transition-all active:scale-[0.98]"
                  style={{ minHeight: 44, border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Отправляем..." : (ru ? "Начать проект" : "Start project")}
                </button>

                <p className="text-sm text-center mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Без оплаты. Отвечаем в течение 2 часов.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
