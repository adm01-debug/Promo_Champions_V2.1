import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Wraps children with a celebratory bounce + glow when `trigger` changes to true.
 */
export function CelebrationPulse({
  trigger,
  children,
  className,
}: {
  trigger: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("relative", className)}
      animate={trigger ? { scale: [1, 1.08, 0.97, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Glow ring behind */}
      {trigger && (
        <motion.div
          className="absolute inset-0 rounded-inherit bg-primary/20 blur-xl -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 0.8 }}
        />
      )}
      {children}
    </motion.div>
  );
}

/**
 * Hover-lift card wrapper — replaces CSS-only hover-lift with spring physics.
 */
export function HoverLiftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list animation wrapper.
 * Wrap each child in <StaggerItem> inside this container.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/**
 * Number counter animation for KPI values.
 * Animates from 0 to value with easing.
 */
export function CountUpText({
  value,
  _duration = 1.2,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span>{prefix}</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      </motion.span>
      <motion.span>{suffix}</motion.span>
    </motion.span>
  );
}
