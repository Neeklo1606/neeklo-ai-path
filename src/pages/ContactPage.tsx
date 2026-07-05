import { Send, Mail, MapPin, Radio, Instagram } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Footer from "@/components/Footer";
import { TELEGRAM_URL, TELEGRAM_HANDLE, EMAIL } from "@/constants";

export default function ContactPage() {
  usePageMeta({
    title: "Контакты — neeklo",
    description: `Никита Клочко — основатель neeklo. Разработка digital-продуктов и AI-решений. Написать: ${TELEGRAM_HANDLE}`,
    og: { url: "/contact" },
  });

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)" }}>
      {/* ── СЕКЦИЯ 1 — Hero с видео фоном ─────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/contact-bg.mp4"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-16 pt-32 w-full">
          <p className="text-xs uppercase tracking-widest text-white/60 mb-4">
            AI-продакшн студия
          </p>
          <h1 className="font-bold text-4xl md:text-6xl text-white leading-tight">
            Никита Клочко
          </h1>
          <p className="text-white/70 text-lg mt-3 max-w-lg">
            Основатель neeklo · Разработка digital-продуктов и AI-решений
          </p>
          <div className="mt-4 flex items-center gap-2 text-white/50 text-sm">
            <MapPin size={14} />
            <span>Bangkok / Moscow</span>
          </div>
        </div>
      </section>

      {/* ── СЕКЦИЯ 2 — О студии ───────────────────────────────────────── */}
      <section style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Левый столбец — текст */}
            <div>
              <p className="uppercase text-xs tracking-widest text-muted-foreground mb-4">
                О НАС
              </p>
              <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-6" style={{ color: "var(--tx)" }}>
                Делаем не сайты ради сайтов
              </h2>
              <div className="text-muted-foreground leading-relaxed text-[15px] space-y-4">
                <p>
                  Меня зовут Никита Клочко, мне 26 лет.
                  Последние несколько лет я занимаюсь разработкой digital-продуктов,
                  AI-решений и автоматизацией бизнеса.
                </p>
                <p>
                  Начинал с сайтов и интерфейсов, а со временем это выросло
                  в полноценную студию — neeklo. Сейчас вместе с командой мы создаём
                  сайты, Telegram Mini Apps, AI-ассистентов, внутренние системы для бизнеса,
                  рекламные видео и нестандартные digital-решения.
                </p>
                <p>
                  За это время мы работали над интернет-магазинами, платформами для вузов,
                  сервисами недвижимости, AI-ботами для юридических компаний, Mini Apps
                  в Telegram и внутренними CRM.
                </p>
                <p>
                  Сейчас отдельный фокус — AI-ассистенты, автоматизация,
                  Telegram-экосистемы и AI-видео для бизнеса.
                  Работаем спокойно, системно и без лишнего шума.
                </p>
              </div>
            </div>

            {/* Правый столбец — контакты */}
            <div>
              <p className="uppercase text-xs tracking-widest text-muted-foreground mb-6">
                СВЯЗАТЬСЯ
              </p>

              <div className="space-y-4">
                {/* Telegram личный */}
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
                  style={{ textDecoration: "none" }}
                >
                  <span className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10" style={{ background: "hsl(var(--primary)/0.1)" }}>
                    <Send size={20} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--tx)" }}>Telegram</p>
                    <p className="text-sm text-muted-foreground">@neeklo</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${EMAIL}`}
                  className="rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
                  style={{ textDecoration: "none" }}
                >
                  <span className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10" style={{ background: "hsl(var(--primary)/0.1)" }}>
                    <Mail size={20} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--tx)" }}>Email</p>
                    <p className="text-sm text-muted-foreground">{EMAIL}</p>
                  </div>
                </a>

                {/* Telegram канал */}
                <a
                  href="https://t.me/neekloai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
                  style={{ textDecoration: "none" }}
                >
                  <span className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10" style={{ background: "hsl(var(--primary)/0.1)" }}>
                    <Radio size={20} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--tx)" }}>Канал об AI</p>
                    <p className="text-sm text-muted-foreground">@neekloai</p>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/nee.klo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
                  style={{ textDecoration: "none" }}
                >
                  <span className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10" style={{ background: "hsl(var(--primary)/0.1)" }}>
                    <Instagram size={20} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--tx)" }}>Instagram</p>
                    <p className="text-sm text-muted-foreground">@nee.klo</p>
                  </div>
                </a>
              </div>

              {/* CTA кнопка */}
              <div className="mt-8">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--tx)",
                    color: "var(--bg)",
                    textDecoration: "none",
                    display: "flex",
                  }}
                >
                  <Send size={16} />
                  Написать в Telegram
                </a>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Отвечаю лично. Обычно в течение часа.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
