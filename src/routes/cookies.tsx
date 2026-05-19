import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function CookiesRoute() {
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
          Политика cookies
        </h1>
        <p className="text-[13px] mb-10" style={{ color: "var(--tx-muted)" }}>
          Последнее обновление: май 2026
        </p>

        <div className="space-y-6">

          <Section title="1. Что такое cookies">
            Cookies: небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта.
            Они помогают сайту запоминать ваши предпочтения, корректно работать и собирать статистику посещений.
            Cookies не содержат личных данных и не могут навредить вашему устройству.
          </Section>

          <Section title="2. Какие cookies мы используем">
            Технические cookies: необходимы для корректной работы сайта (сохранение настроек темы, языка, факта принятия баннера cookies).
            Аналитические cookies (Яндекс.Метрика): сбор обезличенной статистики посещений — количество визитов, страницы,
            источники трафика, поведение пользователей. Данные передаются Яндексу в обезличенном виде.
          </Section>

          <Section title="3. Как управлять cookies">
            Вы можете в любой момент отказаться от cookies или удалить уже сохранённые файлы через настройки браузера.
            Для этого в меню настроек браузера найдите раздел «Конфиденциальность» или «Безопасность» и перейдите
            в управление cookies и данными сайтов. Инструкции для популярных браузеров:
            Google Chrome: Настройки → Конфиденциальность и безопасность → Файлы cookie и другие данные сайтов.
            Mozilla Firefox: Настройки → Приватность и защита → Куки и данные сайтов.
            Safari: Настройки → Конфиденциальность → Управление данными веб-сайтов.
            Microsoft Edge: Настройки → Файлы cookie и разрешения сайтов.
            Отключение cookies может привести к некорректной работе отдельных функций сайта.
          </Section>

          <Section title="4. Согласие на использование cookies">
            При первом посещении сайта вы видите уведомление о cookies. Нажимая «Принять» или продолжая использование сайта,
            вы соглашаетесь с применением cookies в соответствии с настоящей политикой.
            Вы вправе отозвать согласие, отключив cookies в настройках браузера.
          </Section>

          <Section title="5. Передача данных третьим лицам">
            Аналитические данные Яндекс.Метрики обрабатываются сервисом Яндекс в соответствии с их политикой конфиденциальности.
            Мы не продаём и не передаём cookie-данные иным третьим лицам.
          </Section>

          <Section title="6. Контакты по вопросам">
            По любым вопросам, связанным с использованием cookies на нашем сайте:
            neeklostudio@gmail.com
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
