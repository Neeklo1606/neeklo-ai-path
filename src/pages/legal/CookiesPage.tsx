import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  usePageTitle("Политика Cookies · neeklo");
  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)", paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1 transition-colors duration-150"
          style={{ fontSize: 13, color: "var(--tx-muted)", textDecoration: "none", marginBottom: 32, display: "inline-flex" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-muted)"; }}
        >
          <ChevronLeft size={14} />
          На главную
        </Link>
        <h1 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 8 }}>
          Политика Cookies
        </h1>
        <p style={{ fontSize: 13, color: "var(--tx-muted)", marginBottom: 48 }}>Последнее обновление: май 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Что такое cookies</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Cookies: небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта. Они помогают сайту работать корректно и собирать статистику.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Что мы используем</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Яндекс.Метрика: аналитика посещений, действий пользователей и источников трафика. Технические cookies: необходимы для корректной работы сайта.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Как отказаться от cookies</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Вы можете отключить cookies в настройках браузера. В Chrome: Настройки &gt; Конфиденциальность и безопасность &gt; Cookies. В Firefox: Настройки &gt; Приватность и защита. В Safari: Настройки &gt; Конфиденциальность. В Edge: Настройки &gt; Файлы cookie и разрешения сайтов.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Контакты</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>По вопросам использования cookies: hi@neeklo.ru.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
