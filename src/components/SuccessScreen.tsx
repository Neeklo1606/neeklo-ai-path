import { motion } from "framer-motion";
import { Send, CheckCircle, MessageCircle, Clock } from "lucide-react";
import { TELEGRAM_URL } from "@/constants";

// Six burst dots evenly spaced around the circle (start at top)
const DOT_ANGLES = [0, 60, 120, 180, 240, 300];
const DOT_RADIUS = 34; // distance from center to dot

interface Props {
  onClose: () => void;
}

export default function SuccessScreen({ onClose }: Props) {
  return (
    <div className="flex flex-col">

      {/* ── Animated icon ─────────────────────────────────────────── */}
      <motion.div
        className="flex justify-center mb-2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "backOut" }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="text-primary overflow-visible"
        >
          {/* Layer 1 — expanding rings (repeat: 0, fires once) */}
          {([0, 1] as const).map((i) => (
            <motion.circle
              key={i}
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ transformOrigin: "60px 60px" }}
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                ease: "easeOut",
                repeat: 0,
              }}
            />
          ))}

          {/* Layer 3 — burst dots (radial outward) */}
          {DOT_ANGLES.map((deg) => {
            // position along the ring
            const rad = (deg - 90) * (Math.PI / 180);
            const cx = 60 + DOT_RADIUS * Math.cos(rad);
            const cy = 60 + DOT_RADIUS * Math.sin(rad);
            // outward direction delta for animation
            const dx = ((cx - 60) / DOT_RADIUS) * 22;
            const dy = ((cy - 60) / DOT_RADIUS) * 22;
            return (
              <motion.circle
                key={deg}
                cx={cx}
                cy={cy}
                r="3"
                fill="currentColor"
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, x: dx, y: dy }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              />
            );
          })}

          {/* Layer 2 — main circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="28"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transformOrigin: "60px 60px",
              fill: "hsl(var(--primary) / 0.1)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
          />

          {/* Layer 2 — checkmark drawn via pathLength */}
          <motion.path
            d="M 45 61 L 56 72 L 76 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      {/* ── Text (delay 0.4s) ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35, ease: "easeOut" }}
      >
        <p className="font-bold text-2xl text-center text-foreground">
          Заявка принята
        </p>
        <p className="text-muted-foreground text-sm text-center mt-2">
          Менеджер свяжется с вами в течение часа
        </p>

        <div className="border-t border-border my-5" />

        <div className="flex flex-col">
          {[
            { Icon: CheckCircle, text: "Ваш запрос уже у нас" },
            { Icon: MessageCircle, text: "Пока ждёте — задайте вопросы ассистенту" },
            { Icon: Clock, text: "Ответ в течение часа" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 py-2">
              <Icon size={15} className="text-primary shrink-0" />
              <span className="text-sm text-foreground">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Button (delay 0.6s) ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3, ease: "easeOut" }}
      >
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl mt-5 bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ textDecoration: "none" }}
        >
          <Send size={15} />
          Написать ассистенту
        </a>

        <span
          role="button"
          tabIndex={0}
          className="text-sm text-muted-foreground hover:text-foreground text-center mt-3 block cursor-pointer"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        >
          Закрыть
        </span>
      </motion.div>

    </div>
  );
}
