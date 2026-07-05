import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = { lang: string };

export default function HomeStats({ lang }: Props) {
  const ru = lang === "ru";
  return (
    <section id="stats" style={{ padding: "32px 20px", borderTop: "1px solid var(--bd)" }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease }}
          className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start sm:items-center"
        >
          {/* Left — who we are */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tx-faint)", marginBottom: 8 }}>
              {ru ? "О нас" : "About us"}
            </p>
            <h2 style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--tx)", marginBottom: 8, lineHeight: 1.2 }}>
              neeklo: AI-продакшн студия
            </h2>
            <p style={{ fontSize: 14, color: "var(--tx-muted)", lineHeight: 1.65, maxWidth: 360 }}>
              {ru
                ? "Делаем сайты, Telegram-приложения, AI-ассистентов и видео с нейросетями. Работаем с малым и средним бизнесом с 2020 года."
                : "We build websites, Telegram apps, AI assistants and neural network videos. Working with SMB since 2020."}
            </p>
          </div>

          {/* Right — студийные цифры (реальные, используются по всему сайту) */}
          <div className="flex gap-8 sm:gap-12 flex-wrap">
            <div>
              <p style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--tx)", lineHeight: 1 }}>
                44+
              </p>
              <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 4 }}>
                {ru ? "проекта запущено" : "projects launched"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--tx)", lineHeight: 1 }}>
                {ru ? "5 лет" : "5 yrs"}
              </p>
              <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 4 }}>
                {ru ? "в AI и digital" : "in AI & digital"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--tx)", lineHeight: 1 }}>
                {ru ? "48 ч" : "48 h"}
              </p>
              <p style={{ fontSize: 12, color: "var(--tx-muted)", marginTop: 4 }}>
                {ru ? "до старта проекта" : "to project start"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* TODO: здесь блок отзывов, ждём контент от Никиты
            (тексты отзывов, фото/имена клиентов или лого компаний).
            Не добавляем плейсхолдеры — блок появится вместе с реальным контентом. */}
      </div>
    </section>
  );
}
