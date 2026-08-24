import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Crown } from 'lucide-react';
import type { TakeoverEvent } from '@/hooks/race/useLeaderTakeoverDetector';

interface Props {
  takeover: TakeoverEvent | null;
  onClear: () => void;
  onPlaySound?: () => void;
}

const DURATION_MS = 2800;

async function fireConfetti(primary: string, secondary: string) {
  try {
    const mod = await import('canvas-confetti');
    const confetti = mod.default;
    const warning = 'hsl(45 100% 55%)';
    const colors = [primary, secondary, warning];
    const defaults = { zIndex: 9999, disableForReducedMotion: true };

    confetti({ ...defaults, particleCount: 120, spread: 90, startVelocity: 55, origin: { x: 0.5, y: 0.55 }, colors });
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 80, spread: 70, angle: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ ...defaults, particleCount: 80, spread: 70, angle: 120, origin: { x: 1, y: 0.7 }, colors });
    }, 200);
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 60, spread: 120, startVelocity: 35, origin: { x: 0.5, y: 0.4 }, colors });
    }, 500);
  } catch {
    /* noop — confetti é estritamente decorativo */
  }
}

export function LeaderTakeoverCelebration({ takeover, onClear, onPlaySound }: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!takeover) return;
    if (!reduceMotion) {
      fireConfetti(takeover.primaryColor, takeover.secondaryColor);
    }
    onPlaySound?.();
    const t = setTimeout(onClear, DURATION_MS);
    return () => clearTimeout(t);
  }, [takeover, reduceMotion, onClear, onPlaySound]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AnimatePresence>
        {takeover && (
          <motion.div
            key={takeover.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 30 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative"
          >
            <div
              className="relative px-10 py-7 rounded-3xl border-2 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3"
              style={{
                borderColor: takeover.primaryColor,
                boxShadow: `0 0 60px ${takeover.primaryColor}66, 0 0 120px ${takeover.secondaryColor}33`,
              }}
              role="alert"
            >
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0.6 }}
                animate={reduceMotion ? {} : { opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 1.4, repeat: 2 }}
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${takeover.primaryColor}33, transparent 70%)`,
                }}
              />

              <motion.div
                initial={reduceMotion ? {} : { rotate: -20, scale: 0.5 }}
                animate={reduceMotion ? {} : { rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                className="relative"
              >
                <Crown
                  className="w-16 h-16 drop-shadow-lg"
                  style={{ color: takeover.primaryColor, filter: `drop-shadow(0 0 12px ${takeover.primaryColor})` }}
                  aria-hidden
                />
              </motion.div>

              <p className="font-display font-black text-3xl uppercase tracking-tight text-foreground text-center leading-none">
                Liderança Assumida!
              </p>
              <p className="font-display text-base text-muted-foreground text-center">
                <span className="font-bold" style={{ color: takeover.primaryColor }}>
                  {takeover.salespersonName}
                </span>{' '}
                agora é P1 🏁
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
