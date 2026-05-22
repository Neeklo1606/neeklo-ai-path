import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyRoute() {
  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)" }}>
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full">

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[13px] transition-colors duration-150 mb-8"
          style={{ color: "var(--tx-muted)", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-muted)"; }}
        >
          <ChevronLeft size={14} />
          На главную
        </Link>

        <h1
          className="font-bold text-2xl md:text-3xl tracking-[-0.02em] mb-2"
          style={{ fontFamily: "'Onest', sans-serif", color: "var(--tx)" }}
        >
          Политика конфиденциальности
        </h1>
        <p className="text-[13px] mb-10" style={{ color: "var(--tx-muted)" }}>
          Последнее обновление: май 2026
        </p>

        <div className="space-y-6">

          <Section title="1. Общие положения">
            Оператор персональных данных: ИП Клочко Никита Николаевич, ИНН 263520430560. Сайт: neeklo.ru.
            Настоящая политика определяет порядок обработки и защиты персональных данных пользователей в соответствии
            с Федеральным законом № 152-ФЗ «О персональных данных».
          </Section>

          <Section title="2. Какие данные мы собираем">
            Через формы обратной связи: имя, номер телефона, адрес электронной почты, содержание обращения или задачи.
            Технические данные: IP-адрес, тип и версия браузера, страницы сайта, время визита (через Яндекс.Метрику).
            Данные, которые вы явно предоставляете в переписке через Telegram или email.
          </Section>

          <Section title="3. Цели обработки данных">
            Ответить на заявку и связаться с вами по указанным контактам.
            Подготовить коммерческое предложение или смету.
            Улучшить качество сервиса на основе аналитики поведения посетителей.
            Соблюдение требований законодательства Российской Федерации.
          </Section>

          <Section title="4. Правовое основание">
            Обработка персональных данных осуществляется на основании вашего согласия (ст. 6 и 9 152-ФЗ),
            которое вы даёте при заполнении формы на сайте, а также в целях исполнения договора
            (ст. 6 ч. 1 п. 5 152-ФЗ).
          </Section>

          <Section title="5. Хранение и передача данных">
            Мы не передаём персональные данные третьим лицам без вашего согласия.
            Исключения: требования законодательства Российской Федерации; технические подрядчики (хостинг, CRM),
            связанные обязательством конфиденциальности.
            Данные хранятся на серверах, расположенных на территории Российской Федерации.
          </Section>

          <Section title="6. Права пользователя">
            Вы вправе в любой момент: запросить информацию об обрабатываемых данных; потребовать исправления
            неточных данных; потребовать удаления ваших персональных данных; отозвать ранее данное согласие.
            Для этого напишите на почту: neeklostudio@gmail.com. Мы ответим в течение 30 дней.
          </Section>

          <Section title="7. Cookies">
            Мы используем cookies для аналитики посещаемости (Яндекс.Метрика) и корректной работы сайта.
            Вы можете отказаться от cookies в настройках вашего браузера или через баннер на сайте.
            Отказ от cookies не препятствует использованию основных функций сайта.
          </Section>

          <Section title="8. Изменения политики">
            Мы вправе обновлять настоящую политику. Актуальная версия всегда доступна на странице{" "}
            <a href="/privacy" style={{ color: "var(--ac-b)" }}>neeklo.ru/privacy</a>.
            Продолжение использования сайта после изменений означает согласие с новой редакцией.
          </Section>

          <Section title="9. Контакты">
            По вопросам обработки персональных данных: neeklostudio@gmail.com
            <br />
            Telegram: <a href="https://t.me/neeekn" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ac-b)" }}>@neeekn</a>
          </Section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="font-semibold text-lg mb-2 mt-8"
        style={{ fontFamily: "'Onest', sans-serif", color: "var(--tx)" }}
      >
        {title}
      </h2>
      <p className="text-[15px] leading-relaxed" style={{ color: "var(--tx-muted)" }}>
        {children}
      </p>
    </section>
  );
}
