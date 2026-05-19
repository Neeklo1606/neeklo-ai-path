import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  usePageTitle("Политика конфиденциальности · neeklo");
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
          Политика конфиденциальности
        </h1>
        <p style={{ fontSize: 13, color: "var(--tx-muted)", marginBottom: 48 }}>Последнее обновление: май 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Общие положения</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Оператор персональных данных: ИП Клочко Н.Н., ИНН 263520430560. Сайт: neeklo.ru. Настоящая политика определяет порядок обработки и защиты персональных данных пользователей.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Какие данные мы собираем</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Через форму обращения: имя, номер телефона, содержание вопроса или задачи. Технические данные: IP-адрес, тип браузера, действия на сайте (Яндекс.Метрика).</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Цели обработки данных</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Ответить на заявку и связаться с вами по указанным контактам. Улучшить качество сервиса на основе аналитики поведения посетителей.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Хранение и передача данных</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Мы не передаём персональные данные третьим лицам без вашего согласия. Исключение: требование законодательства Российской Федерации.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Права пользователя</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Вы вправе запросить удаление ваших персональных данных. Для этого напишите на почту: hi@neeklo.ru.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Cookies</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>Мы используем cookies для аналитики посещаемости. Вы можете отключить cookies в настройках вашего браузера.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--tx)", marginBottom: 8, marginTop: 16 }}>Контакты</h2>
            <p style={{ fontSize: 15, color: "var(--tx-muted)", lineHeight: 1.7 }}>По вопросам обработки данных: hi@neeklo.ru.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
