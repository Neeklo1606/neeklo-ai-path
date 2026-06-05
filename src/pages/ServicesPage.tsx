import { motion } from "framer-motion";
import { Send, Mail, MessageSquare } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import { SolutionGrid } from "@/components/home/SolutionGrid";
import { useBrief } from "@/context/BriefContext";

const ease = [0.16, 1, 0.3, 1] as const;

export default function ServicesPage() {
  usePageMeta({
    title: "Все услуги — neeklo",
    description: "Сайты с AI и CRM, ИИ агенты, Telegram-боты, видео под ключ. От 15 000 ₽.",
    og: { url: "/services" },
  });
  const { open: openBrief } = useBrief();

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="py-12"
        >
          <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Все услуги" }]} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 8 }}>
            УСЛУГИ
          </p>
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{ fontFamily: "'Onest', sans-serif", letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 10 }}
          >
            Все услуги
          </h1>
          <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.6, maxWidth: 480 }}>
            Выберите направление или опишите задачу — подберём формат.
          </p>
        </motion.div>

        {/* Solutions grid (shared with home page) */}
        <SolutionGrid />

        {/* Contacts */}
        <section className="py-12 border-t border-[var(--bd)]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease }}
          >
            <h2
              className="font-bold text-xl text-[var(--tx)]"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              Контакты
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Telegram */}
              <a
                href="https://t.me/neeekn"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-[var(--bd)] p-5 flex items-center gap-4 hover:border-[var(--bd-hover)] transition-colors flex-1"
                style={{ textDecoration: "none", background: "var(--surface)" }}
              >
                <Send size={20} className="text-[var(--ac-b)] shrink-0" />
                <div>
                  <p style={{ fontSize: 11, color: "var(--tx-faint)", marginBottom: 2 }}>Telegram</p>
                  <p className="text-[var(--ac-b)] font-semibold text-[14px]">@neeekn</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:neeklostudio@gmail.com"
                className="rounded-2xl border border-[var(--bd)] p-5 flex items-center gap-4 hover:border-[var(--bd-hover)] transition-colors flex-1"
                style={{ textDecoration: "none", background: "var(--surface)" }}
              >
                <Mail size={20} style={{ color: "var(--tx-muted)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 11, color: "var(--tx-faint)", marginBottom: 2 }}>Email</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)" }}>neeklostudio@gmail.com</p>
                </div>
              </a>

              {/* Quick start */}
              <button
                onClick={() => openBrief()}
                className="rounded-2xl border border-[var(--bd)] p-5 flex items-center gap-4 hover:border-[var(--bd-hover)] transition-colors flex-1 text-left"
                style={{ background: "var(--surface)", cursor: "pointer" }}
              >
                <MessageSquare size={20} className="text-[var(--ac-b)] shrink-0" />
                <div>
                  <p style={{ fontSize: 11, color: "var(--tx-faint)", marginBottom: 2 }}>Быстрый старт</p>
                  <p className="text-[var(--ac-b)] font-semibold text-[14px]">Заполнить бриф — 2 минуты</p>
                </div>
              </button>
            </div>
          </motion.div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
