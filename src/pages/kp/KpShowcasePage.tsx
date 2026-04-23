import { useEffect, useState } from "react";
import "@/styles/kp.css";
import { cmsJson } from "@/lib/cms-api";
import KPTopbar   from "@/components/kp/KPTopbar";
import KPPackages from "@/components/kp/KPPackages";
import KPCta      from "@/components/kp/KPCta";
import type { KpPackagesData, KpCtaData, KpContactsData } from "@/lib/cms-api";

interface ShowcaseData {
  hero: {
    badge: string;
    title_1: string;
    title_2: string;
    subtitle: string;
  };
  directions: Array<{
    icon: string;
    title: string;
    text: string;
  }>;
  packages: KpPackagesData;
  cta: KpCtaData;
  contacts: KpContactsData;
}

const DEFAULT_SHOWCASE: ShowcaseData = {
  hero: {
    badge: "КП за 48 часов",
    title_1: "Прозрачные коммерческие",
    title_2: "предложения",
    subtitle:
      "Сайты, Telegram-боты, Mini App и AI-агенты — под ключ. Фиксированная смета, понятные сроки, результат за 4–8 недель.",
  },
  directions: [
    { icon: "🌐", title: "Сайты", text: "Многостраничные имиджевые сайты на Next.js с админкой, SEO и Telegram-воронкой." },
    { icon: "🤖", title: "Telegram-боты", text: "Боты для лидогенерации, поддержки, рассылок и автоматизации бизнес-процессов." },
    { icon: "📱", title: "Mini App", text: "Telegram Mini App: каталоги, квизы, личные кабинеты прямо внутри мессенджера." },
    { icon: "🧠", title: "AI-агенты", text: "AI-ассистенты на базе LLM с доступом к базе знаний компании и интеграцией в CRM." },
  ],
  packages: {
    title_1: "Три базовых пакета —",
    title_2: "выбери свой формат",
    items: [
      {
        name: "Start",
        subtitle: "Базовый запуск",
        price: "120–180",
        price_sub: "тыс. руб. · разово · 50% предоплата",
        featured: false,
        badge: "",
        cta: "Обсудить Start",
        features: [
          "Один продукт: сайт или бот или Mini App",
          "Дизайн в фирменном стиле",
          "Адаптивная вёрстка (desktop/mobile)",
          "Интеграция с Telegram-уведомлениями",
          "Базовое SEO и аналитика",
          "Техподдержка 30 дней",
        ],
      },
      {
        name: "Pro",
        subtitle: "Сайт + воронка",
        price: "200–300",
        price_sub: "тыс. руб. · разово · 50% предоплата",
        featured: true,
        badge: "ОПТИМАЛЬНО",
        cta: "Обсудить Pro",
        features: [
          "Всё из Start, плюс:",
          "Telegram-бот с лид-магнитом",
          "CRM-интеграция (Notion / Google Sheets)",
          "UTM-разметка + Яндекс.Метрика + GA4",
          "Микроразметка Schema.org",
          "Расширенная структура кейсов",
          "Приоритетная поддержка 30 дней",
        ],
      },
      {
        name: "Подписка",
        subtitle: "Спринты 1–3 мес",
        price: "80–150",
        price_sub: "тыс. руб. / месяц",
        featured: false,
        badge: "",
        cta: "Обсудить подписку",
        features: [
          "Итерационная разработка спринтами",
          "Еженедельные созвоны и статус-отчёты",
          "Контент-поддержка и развитие продукта",
          "AI-ассистент или новые сценарии бота",
          "Гибкий бэклог — добавляем задачи",
          "Приоритетная поддержка весь период",
        ],
      },
    ],
  },
  cta: {
    title_1: "Обсудим",
    title_2: "ваш проект?",
    text: "Расскажите задачу — подготовим индивидуальное КП за 48 часов. Фиксированная смета и прозрачные этапы.",
    button_label: "Обсудить в Telegram",
    button_url: "https://t.me/neeeekn",
  },
  contacts: {
    telegram_handle: "@neeeekn",
    telegram_url: "https://t.me/neeeekn",
    email: "neeklostudio@gmail.com",
    site: "neeklo.ru",
    site_url: "https://neeklo.ru",
  },
};

export default function KpShowcasePage() {
  const [data, setData] = useState<ShowcaseData>(DEFAULT_SHOWCASE);

  useEffect(() => {
    document.title = "КП · neeklo.studio — Коммерческие предложения";
    cmsJson<Record<string, ShowcaseData>>("/settings/public")
      .then((settings) => {
        const val = settings["kp.showcase"] as ShowcaseData | undefined;
        if (val && val.hero && val.packages) setData(val);
      })
      .catch(() => {});
    return () => { document.title = "neeklo — Сайты и AI-агенты под ключ"; };
  }, []);

  return (
    <div className="kp-root">
      <KPTopbar />

      {/* Hero */}
      <section className="kp-hero">
        <div className="kp-hero-bg" />
        <div className="kp-hero-inner">
          <div className="kp-eyebrow kp-fade-up">
            <span className="kp-eyebrow-dot" />
            <span>{data.hero.badge}</span>
          </div>
          <h1 className="kp-hero-h1 kp-fade-up kp-fade-up-1">
            {data.hero.title_1}
            <br />
            <span className="kp-accent">{data.hero.title_2}</span>
          </h1>
          <p className="kp-hero-sub kp-fade-up kp-fade-up-2">{data.hero.subtitle}</p>
        </div>
      </section>

      {/* Направления */}
      <section className="kp-section">
        <div className="kp-container">
          <div className="kp-sec-num">01 / ЧТО МЫ ДЕЛАЕМ</div>
          <h2 className="kp-sec-title">
            Четыре направления —<br />
            <span className="kp-accent">полный digital-контур</span>
          </h2>
          <div className="kp-directions">
            {data.directions.map((d, i) => (
              <div key={i} className="kp-direction-card">
                <div className="kp-direction-icon">{d.icon}</div>
                <h3 className="kp-direction-title">{d.title}</h3>
                <p className="kp-direction-text">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Пакеты */}
      <KPPackages data={data.packages} ctaUrl="#cta" />

      {/* CTA */}
      <KPCta cta={data.cta} contacts={data.contacts} />

      {/* Footer */}
      <footer className="kp-footer">
        <div className="kp-footer-inner">
          <div>© 2026 neeklo.studio · ИП Клочко Н.Н. · ИНН 263520430560</div>
          <div className="kp-footer-links">
            <a href="#packages">Пакеты</a>
            <a href="#cta">Обсудить</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
