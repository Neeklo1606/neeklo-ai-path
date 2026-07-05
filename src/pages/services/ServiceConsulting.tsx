import "@/styles/services.css";
import { ScanSearch, Map, Calculator, ListChecks, Rocket, Check, X } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import ServicePackages, { type ServicePackage } from "@/components/services/ServicePackages";
import ServiceProcess, { type ProcessStep } from "@/components/services/ServiceProcess";
import ServiceFAQ, { type FAQItem } from "@/components/services/ServiceFAQ";
import ServiceRelatedCases from "@/components/services/ServiceRelatedCases";
import QuickLeadForm from "@/components/QuickLeadForm";
import FadeIn from "@/components/ui/FadeIn";

// ─── Данные страницы ──────────────────────────────────────────────────────────

const INCLUDED = [
  { Icon: ScanSearch, title: "Аудит процессов", text: "Разбираем, как устроены заявки, документы, отчёты и коммуникации — где команда делает руками то, что может делать AI." },
  { Icon: Calculator, title: "Расчёт стоимости рутины", text: "Считаем в рублях, сколько ручной труд стоит вам каждый месяц: зарплаты × время × объёмы." },
  { Icon: Map, title: "Карта точек внедрения", text: "Конкретные места в процессах, где AI даёт максимальную отдачу — с приоритетами по эффекту." },
  { Icon: ListChecks, title: "План внедрения", text: "Пошаговый план: что внедрять первым, что потом, сколько стоит каждый шаг и что он экономит." },
  { Icon: Rocket, title: "Сопровождение первого шага", text: "Помогаем запустить первое внедрение из карты — чтобы план не остался на бумаге." },
];

const FOR_WHOM = [
  "Команда от 3 человек тонет в ручных операциях: заявки, документы, отчёты",
  "Менеджеры отвечают на одни и те же вопросы по 20 раз в день",
  "Хотите внедрить AI, но не понимаете, с чего начать и что окупится",
  "Растёте, и найм новых людей на рутину съедает маржу",
];

const NOT_FOR_WHOM = [
  "Нужен готовый продукт «вчера» — без анализа процессов",
  "В компании нет процессов, которые повторяются регулярно",
  "Ждёте, что AI решит проблемы бизнес-модели, а не операционки",
  "Не готовы выделить 2–3 часа команды на интервью для аудита",
];

const PROCESS: ProcessStep[] = [
  { num: "01", title: "Интервью", text: "Дни 1–2. Говорим с вами и командой: какие процессы есть, кто что делает руками." },
  { num: "02", title: "Замеры", text: "Дни 3–4. Считаем время и стоимость каждого ручного процесса на ваших цифрах." },
  { num: "03", title: "Карта внедрения", text: "Дни 5–7. Составляем карту точек автоматизации с приоритетами по окупаемости." },
  { num: "04", title: "Защита плана", text: "Дни 8–9. Презентуем карту и экономику: что внедрять, в каком порядке, что это даст." },
  { num: "05", title: "Первый шаг", text: "День 10. Согласуем первое внедрение и запускаем — с нами или вашими силами." },
];

const PACKAGES: ServicePackage[] = [
  { name: "Мини-разбор", price: "от 15 000 ₽", duration: "2–3 дня", desc: "Экспресс-оценка одного процесса. Быстрый ответ: есть ли здесь экономия и какая.", featured: false },
  { name: "AI-аудит", price: "от 90 000 ₽", duration: "7–10 дней", desc: "Полный аудит процессов + карта внедрения + расчёт экономики + защита плана.", featured: true },
  { name: "Strategy Sprint", price: "от 250 000 ₽", duration: "3–4 недели", desc: "Аудит + внедрение первых двух решений из карты + обучение команды.", featured: false },
];

const FAQ: FAQItem[] = [
  { q: "Гарантируете результат?", a: "Гарантируем процесс и артефакты (карту, экономику, roadmap), не абстрактный ROI без ваших данных." },
  { q: "А если AI не нужен?", a: "Скажем прямо, иногда вывод — начните с порядка в CRM, а не с AI-агента." },
  { q: "Сколько стоит внедрение после аудита?", a: "От 150 000 рублей (MVP) до 2 000 000 рублей (комплексная система)." },
  { q: "Специфичная ниша?", a: "Поэтому и начинаем с аудита, не с шаблона. Работали с клиниками, недвижимостью, юрфирмами, e-commerce." },
  { q: "Нужно останавливать процессы?", a: "Нет, интервью идут параллельно с обычной работой, 2-3 часа времени владельца плюс 30-60 минут ключевых сотрудников." },
];

// ─── Компоненты секций ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 12 }}>
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", color: "var(--tx)", lineHeight: 1.1 }}>
      {children}
    </h2>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function ServiceConsulting() {
  usePageMeta({
    title: "AI-консалтинг — аудит процессов и карта внедрения | neeklo",
    description: "Находим, где бизнес теряет деньги на ручных процессах. AI-аудит + карта внедрения за 7–10 дней. Расчёт экономии на ваших цифрах.",
    og: { url: "/services/consulting" },
  });

  const scrollToCta = () => {
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="svc-root">
      <main>
        {/* ── 1. Hero ── */}
        <section id="hero" style={{ background: "var(--bg)", padding: "120px 0 80px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", padding: "4px 10px", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--accent-signal) 30%, transparent)", background: "color-mix(in srgb, var(--accent-signal) 12%, transparent)", color: "var(--accent-signal)", textTransform: "uppercase" }}>
                НОВАЯ УСЛУГА
              </span>
            </div>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(34px, 6vw, 64px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "var(--tx)", marginBottom: 24, maxWidth: 900 }}>
              Находим, где ваш бизнес теряет деньги на ручных процессах
            </h1>
            <p style={{ fontSize: 18, fontWeight: 300, color: "var(--tx-muted)", maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
              AI-аудит + карта внедрения за 7–10 дней. Считаем экономию на ваших цифрах — до того, как вы потратите рубль на внедрение.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={scrollToCta} style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 9999, background: "var(--accent-signal)", color: "var(--bg)", border: "none", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-signal-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-signal)")}>
                Получить диагностику →
              </button>
              <a href="#packages" style={{ fontSize: 14, padding: "16px 24px", borderRadius: 9999, border: "1px solid var(--bd)", color: "var(--tx-muted)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--tx)"; e.currentTarget.style.borderColor = "var(--bd-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--tx-muted)"; e.currentTarget.style.borderColor = "var(--bd)"; }}>
                Смотреть тарифы
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. Что входит ── */}
        <section id="delivers" style={{ background: "var(--surface)", padding: "80px 0" }}>
          <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: 48 }}>
              <SectionLabel>ЧТО ВХОДИТ</SectionLabel>
              <SectionTitle>Пять результатов<br />аудита</SectionTitle>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {INCLUDED.map(({ Icon, title, text }, i) => (
                <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: "24px", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--bd-hover)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-card-hover)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--bd)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Icon size={18} style={{ color: "var(--tx-muted)" }} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--tx)", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "var(--tx-muted)", lineHeight: 1.55 }}>{text}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ── 3. Пример на цифрах (до/после) ── */}
        <section id="example" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
          <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: 48 }}>
              <SectionLabel>ПРИМЕР НА ЦИФРАХ</SectionLabel>
              <SectionTitle>Сколько это<br />экономит</SectionTitle>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, padding: "clamp(24px, 4vw, 40px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 32 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>Было: ручной труд</p>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 24, color: "var(--tx)", lineHeight: 1 }}>86 430 ₽<span style={{ fontSize: 13, color: "var(--tx-muted)", fontWeight: 400 }}> /мес</span></p>
                  <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 6, lineHeight: 1.5 }}>обработка заявок и документов вручную</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>Внедрение</p>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 24, color: "var(--tx)", lineHeight: 1 }}>120 000 ₽<span style={{ fontSize: 13, color: "var(--tx-muted)", fontWeight: 400 }}> разово</span></p>
                  <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 6, lineHeight: 1.5 }}>AI-ассистент + автоматизация документов</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--tx-faint)", textTransform: "uppercase", marginBottom: 8 }}>Стало: экономия</p>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 24, color: "var(--accent-signal)", lineHeight: 1 }}>69 144 ₽<span style={{ fontSize: 13, color: "var(--tx-muted)", fontWeight: 400 }}> /мес</span></p>
                  <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 6, lineHeight: 1.5 }}>окупаемость — 2,6 месяца</p>
                </div>
              </div>

              {/* ROI — самая крупная цифра на экране */}
              <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 32, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 16 }}>
                <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(56px, 9vw, 104px)", letterSpacing: "-0.03em", color: "var(--accent-signal)", lineHeight: 1 }}>
                  361%
                </p>
                <p style={{ fontSize: 15, color: "var(--tx-muted)", maxWidth: 320, lineHeight: 1.5 }}>
                  ROI за первый год — на каждый вложенный рубль возвращается 3,6 ₽ экономии
                </p>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--tx-faint)", marginTop: 12, lineHeight: 1.5 }}>
              Менеджер вручную переносит данные из звонков в CRM: 20 минут на звонок, 20 звонков в день.
            </p>
          </FadeIn>
        </section>

        {/* ── 4. Кому нужно / кому не нужно ── */}
        <section id="for-whom" style={{ background: "var(--surface)", padding: "80px 0" }}>
          <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: 48 }}>
              <SectionLabel>ДЛЯ КОГО</SectionLabel>
              <SectionTitle>Кому нужно —<br />а кому нет</SectionTitle>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {/* Кому нужно */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: "28px" }}>
                <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--tx)", marginBottom: 20 }}>Вам нужно, если</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {FOR_WHOM.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "color-mix(in srgb, var(--accent-signal) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <Check size={12} style={{ color: "var(--accent-signal)" }} strokeWidth={2.5} />
                      </span>
                      <span style={{ fontSize: 14, color: "var(--tx)", lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Кому не нужно */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: "28px" }}>
                <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--tx-muted)", marginBottom: 20 }}>Не подойдёт, если</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {NOT_FOR_WHOM.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <X size={12} style={{ color: "var(--tx-faint)" }} strokeWidth={2.5} />
                      </span>
                      <span style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 5. Процесс: 5 шагов, дни 1–10 ── */}
        <ServiceProcess steps={PROCESS} />

        {/* ── 6. Тарифы ── */}
        <ServicePackages packages={PACKAGES} ctaUrl="#cta" />

        {/* ── Кейсы по консалтингу (если есть) ── */}
        <ServiceRelatedCases serviceSlug="consulting" />

        {/* ── 7. FAQ ── */}
        <ServiceFAQ items={FAQ} />

        {/* ── 8. Финальный CTA — форма в 1 поле ── */}
        <section id="cta" style={{ background: "var(--bg)", padding: "80px 0", borderTop: "1px solid var(--bd)" }}>
          <FadeIn style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div
              className="flex flex-col lg:flex-row gap-10 lg:gap-16"
              style={{ background: "linear-gradient(135deg, #111118 0%, #1a1a2a 100%)", borderRadius: 24, padding: "clamp(32px, 5vw, 56px)" }}
            >
              <div className="lg:flex-1">
                <SectionLabel>НАЧАТЬ С ДИАГНОСТИКИ</SectionLabel>
                <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3.5vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "white", marginBottom: 16 }}>
                  Узнайте, сколько стоит ваша рутина
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 380 }}>
                  Оставьте телефон — перезвоним в течение 2 часов и скажем, есть ли в ваших процессах экономия, до всякой оплаты.
                </p>
              </div>
              <div className="lg:w-[380px] lg:shrink-0 flex flex-col justify-center">
                <QuickLeadForm variant="panel" source="consulting" />
              </div>
            </div>
          </FadeIn>
        </section>
      </main>
    </div>
  );
}
