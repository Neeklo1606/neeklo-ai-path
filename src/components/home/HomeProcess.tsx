import { Link } from "react-router-dom";
import { Check, FileText } from "lucide-react";
import StickyTabs from "@/components/ui/StickyTabs";
import { useBrief } from "@/context/BriefContext";

// ─── Shared primitives ────────────────────────────────────────────────────────

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 my-0 p-0 list-none">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
            style={{ width: 18, height: 18, background: "var(--ac-b)", minWidth: 18 }}
          >
            <Check size={10} color="white" strokeWidth={3} />
          </span>
          <span className="text-sm text-muted-foreground leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionText({
  h3,
  body,
  items,
  cta,
}: {
  h3: string;
  body: string;
  items: string[];
  cta: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[clamp(18px,2.5vw,24px)] leading-tight tracking-tight text-foreground m-0">
        {h3}
      </h3>
      <p className="text-[14px] text-muted-foreground leading-relaxed m-0">{body}</p>
      <CheckList items={items} />
      <div>{cta}</div>
    </div>
  );
}

// ─── Visual: chat card ────────────────────────────────────────────────────────

function ChatCard() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border border-border bg-muted/50">
      {/* Client message (right) */}
      <div className="flex justify-end">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]"
          style={{ background: "var(--tx)", color: "var(--bg)", fontSize: 13, lineHeight: 1.5 }}
        >
          Нужен сайт для кафе с онлайн-записью
        </div>
      </div>

      {/* Manager message (left) */}
      <div className="flex justify-start">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[78%] border border-border bg-background text-foreground"
          style={{ fontSize: 13, lineHeight: 1.5 }}
        >
          Понял. Уже смотрю похожие проекты — покажу варианты через час
        </div>
      </div>

      {/* System note */}
      <p className="text-center text-[11px] text-muted-foreground/60 m-0 leading-snug">
        Ответ через 47 минут · Бесплатно
      </p>
    </div>
  );
}

// ─── Visual: KP card ─────────────────────────────────────────────────────────

function KpCard() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border border-border bg-muted/50">
      <p className="font-semibold text-sm text-foreground m-0">
        Коммерческое предложение
      </p>

      <div className="flex flex-col gap-3">
        {[
          "Сайт + AI-ассистент · 80 000 ₽",
          "Срок: 14 рабочих дней",
          "Гарантия результата: 3 месяца",
        ].map((line) => (
          <div key={line} className="flex items-center gap-2.5">
            <FileText size={14} strokeWidth={1.8} style={{ color: "var(--tx-faint)", flexShrink: 0 }} />
            <span className="text-[13px] text-muted-foreground">{line}</span>
          </div>
        ))}
      </div>

      <button
        className="w-full flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-opacity duration-150 hover:opacity-80"
        style={{ background: "var(--tx)", color: "var(--bg)", border: "none", cursor: "pointer" }}
      >
        Принять
      </button>
    </div>
  );
}

// ─── Visual: progress card ────────────────────────────────────────────────────

type ProgressRow = {
  label: string;
  status: "done" | "active" | "pending";
  statusLabel: string;
};

const PROGRESS_ROWS: ProgressRow[] = [
  { label: "Дизайн главной", status: "done", statusLabel: "Готово" },
  { label: "Разработка", status: "active", statusLabel: "В работе" },
  { label: "AI-ассистент", status: "pending", statusLabel: "На очереди" },
  { label: "Запуск", status: "pending", statusLabel: "На очереди" },
];

function StatusDot({ status }: { status: ProgressRow["status"] }) {
  if (status === "done") {
    return (
      <span
        className="flex items-center justify-center rounded-full"
        style={{ width: 18, height: 18, background: "#22c55e", flexShrink: 0 }}
      >
        <Check size={10} color="white" strokeWidth={3} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className="rounded-full animate-pulse"
        style={{ width: 10, height: 10, background: "var(--ac-b)", display: "inline-block", flexShrink: 0 }}
      />
    );
  }
  return (
    <span
      className="rounded-full"
      style={{ width: 10, height: 10, background: "var(--bd)", display: "inline-block", flexShrink: 0 }}
    />
  );
}

function ProgressCard() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border border-border bg-muted/50">
      <p className="font-semibold text-sm text-foreground m-0">Статус проекта</p>

      <div className="flex flex-col gap-3">
        {PROGRESS_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <StatusDot status={row.status} />
              <span className="text-[13px] text-muted-foreground">{row.label}</span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color:
                  row.status === "done"
                    ? "#22c55e"
                    : row.status === "active"
                    ? "var(--ac-b)"
                    : "var(--tx-faint)",
              }}
            >
              {row.statusLabel}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60 m-0 border-t border-border pt-3">
        Следующий показ через 2 дня
      </p>
    </div>
  );
}

// ─── Shared CTA buttons ───────────────────────────────────────────────────────

function BriefBtn() {
  const { open } = useBrief();
  return (
    <button
      onClick={() => open()}
      className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
    >
      Начать проект
    </button>
  );
}

function CasesBtn() {
  return (
    <Link
      to="/cases"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-150"
      style={{
        color: "var(--tx)",
        border: "1px solid var(--bd)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--bd-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bd)")}
    >
      Посмотреть работы
    </Link>
  );
}

// ─── Item layout (2-col grid) ─────────────────────────────────────────────────

function ItemLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// Props kept for compatibility with CmsHomePage (lang is no longer used for process
// section since content is Russian-only, but we keep the prop so callers don't break)
type Props = { lang?: string };

export default function HomeProcess(_props: Props) {
  return (
    <div style={{ borderTop: "1px solid var(--bd)" }}>
      {/* Section header above StickyTabs */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-8 pb-3">
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "var(--tx-faint)",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Процесс
        </p>
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--tx)",
            margin: 0,
          }}
        >
          Как это работает
        </h2>
      </div>

      {/* StickyTabs — mainNavHeight = h-14 = 3.5rem */}
      <StickyTabs
        mainNavHeight="3.5rem"
        rootClassName="bg-background text-foreground"
        navSpacerClassName="bg-background border-b border-border"
        sectionClassName="bg-background"
        stickyHeaderContainerClassName=""
        headerContentWrapperClassName="bg-background/95 backdrop-blur-sm border-b border-border"
        headerContentLayoutClassName="max-w-6xl mx-auto px-4 md:px-6 py-2.5 md:py-3"
        titleClassName="font-bold text-base md:text-lg tracking-tight text-foreground"
        contentLayoutClassName="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8"
      >
        {/* ── 01 Обсуждаем ─────────────────────────────────────────────────── */}
        <StickyTabs.Item id="discuss" title="01 — Обсуждаем задачу">
          <ItemLayout
            left={
              <SectionText
                h3="Рассказываете о задаче — мы разбираемся"
                body="Заполните бриф за 2 минуты или напишите в Telegram. Изучим задачу, зададим уточняющие вопросы и ответим в течение 2 часов с первой оценкой."
                items={[
                  "Бесплатная консультация без обязательств",
                  "Ответ в течение 2 часов",
                  "Определяем бюджет и сроки на берегу",
                ]}
                cta={<BriefBtn />}
              />
            }
            right={<ChatCard />}
          />
        </StickyTabs.Item>

        {/* ── 02 Предлагаем решение ─────────────────────────────────────────── */}
        <StickyTabs.Item id="solution" title="02 — Предлагаем решение">
          <ItemLayout
            left={
              <SectionText
                h3="Показываем концепцию до старта работ"
                body="Готовим смету, примерный план и первые идеи. Вы видите что и как будем делать — до того как заплатите хоть рубль."
                items={[
                  "Детальная смета без скрытых платежей",
                  "Примеры похожих работ",
                  "Сроки зафиксированы до старта",
                ]}
                cta={<CasesBtn />}
              />
            }
            right={<KpCard />}
          />
        </StickyTabs.Item>

        {/* ── 03 Запускаем ─────────────────────────────────────────────────── */}
        <StickyTabs.Item id="launch" title="03 — Запускаем проект">
          <ItemLayout
            left={
              <SectionText
                h3="Делаем итерациями — вы всегда в курсе"
                body="Показываем промежуточные результаты каждые 2-3 дня. Вы можете вносить правки по ходу. После сдачи — все доступы и документация ваши."
                items={[
                  "Показы каждые 2-3 дня",
                  "Правки включены в стоимость",
                  "Все доступы и исходники после оплаты",
                ]}
                cta={<BriefBtn />}
              />
            }
            right={<ProgressCard />}
          />
        </StickyTabs.Item>
      </StickyTabs>
    </div>
  );
}
