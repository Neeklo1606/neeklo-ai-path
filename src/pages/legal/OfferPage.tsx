import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";

export default function OfferPage() {
  usePageTitle("Публичная оферта · neeklo");
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
          Публичная оферта
        </h1>
        <p style={{ fontSize: 13, color: "var(--tx-muted)", marginBottom: 48 }}>Последнее обновление: май 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Предмет оферты</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Настоящая оферта является предложением ИП Клочко Н.Н. (далее Исполнитель) заключить договор на оказание цифровых услуг: разработка сайтов, Telegram-ботов, AI-ассистентов, видеоконтента.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Акцепт оферты</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Акцептом считается заполнение формы заявки на сайте или оплата выставленного счёта.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Порядок оказания услуг</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Детали проекта согласовываются через мессенджер или email. Результат работы передаётся заказчику после полной оплаты.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Стоимость услуг</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Стоимость определяется индивидуально для каждого проекта и фиксируется в счёте или отдельном договоре.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Ответственность</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Исполнитель не несёт ответственности за результаты рекламных кампаний заказчика, а также за действия третьих лиц.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Срок действия</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Оферта действует бессрочно до момента публикации новой редакции на сайте neeklo.ru.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
