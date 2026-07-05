import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Единая скролл-анимация появления секций: fade-in + translateY.
 * Используется на страницах услуг (главная анимирует секции самостоятельно).
 */
export default function FadeIn({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
