import { Send, Mail } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";
import { useBrief } from "@/context/BriefContext";

export default function ContactPage() {
  usePageMeta({
    title: "Контакты — neeklo",
    description: "Свяжитесь с командой neeklo. Отвечаем в течение 2 часов. Telegram: @neeekn",
  });

  const { open } = useBrief();

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full flex-1">
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", marginBottom: 8, textTransform: "uppercase" }}>
          Контакты
        </p>
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight mb-3" style={{ color: "var(--tx)" }}>
          Напишите нам
        </h1>
        <p className="text-muted-foreground mb-10" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Отвечаем в течение 2 часов в рабочее время. Обсудим задачу, оценим сроки и стоимость бесплатно.
        </p>

        <div className="flex flex-col gap-4">
          {/* Telegram */}
          <a
            href="https://t.me/neeekn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl p-5 border border-border hover:border-[var(--bd-hover)] transition-colors duration-150"
            style={{ background: "var(--surface)", textDecoration: "none" }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 44, height: 44, background: "var(--ac-b)", color: "#fff" }}
            >
              <Send size={18} />
            </span>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>Telegram</p>
              <p className="text-sm text-muted-foreground mt-0.5">@neeekn</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:hi@neeklo.ru"
            className="flex items-center gap-4 rounded-2xl p-5 border border-border hover:border-[var(--bd-hover)] transition-colors duration-150"
            style={{ background: "var(--surface)", textDecoration: "none" }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 44, height: 44, background: "var(--surface-2)", color: "var(--tx)" }}
            >
              <Mail size={18} />
            </span>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>Email</p>
              <p className="text-sm text-muted-foreground mt-0.5">hi@neeklo.ru</p>
            </div>
          </a>
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => open()}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
          >
            Начать проект →
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
