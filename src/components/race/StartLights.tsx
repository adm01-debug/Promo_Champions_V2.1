import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartLightsProps {
  /** Incremente para disparar uma nova largada. */
  trigger: number;
  onGo?: () => void;
}

/**
 * Sequência F1 de 5 luzes vermelhas: cada luz acende em sequência (1s cada),
 * todas permanecem por ~1s e então apagam simultaneamente = GO. Glassmorphism,
 * centralizado no topo da pista.
 */
export function StartLights({ trigger, onGo }: StartLightsProps) {
  const [phase, setPhase] = useState<'idle' | 'lighting' | 'go' | 'done'>('idle');
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    if (trigger <= 0) return;
    setPhase('lighting');
    setLitCount(0);
    const timers: number[] = [];
    // Acende 1 luz por segundo
    [1, 2, 3, 4, 5].forEach((n) => {
      timers.push(window.setTimeout(() => setLitCount(n), n * 700));
    });
    // Apaga + GO
    timers.push(
      window.setTimeout(() => {
        setPhase('go');
        onGo?.();
      }, 5 * 700 + 900),
    );
    timers.push(
      window.setTimeout(() => setPhase('done'), 5 * 700 + 2400),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [trigger, onGo]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div
      className="pointer-events-none absolute top-6 left-1/2 z-40 -translate-x-1/2"
      aria-label="Sinal de largada"
    >
      <AnimatePresence>
        {phase === 'lighting' && (
          <motion.div
            key="lights"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 rounded-2xl border-2 border-border/70 px-4 py-3 shadow-2xl backdrop-blur-md"
            style={{ background: 'hsl(0 0% 6% / 0.92)' }}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const isLit = litCount >= n;
              return (
                <div
                  key={n}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: isLit ? 'hsl(0 80% 35%)' : 'hsl(0 0% 18%)',
                    background: isLit
                      ? 'radial-gradient(circle, hsl(0 90% 55%) 0%, hsl(0 80% 35%) 70%)'
                      : 'hsl(0 0% 12%)',
                    boxShadow: isLit
                      ? '0 0 18px hsl(0 90% 55% / 0.85), inset 0 0 6px hsl(0 100% 70% / 0.6)'
                      : 'inset 0 1px 2px hsl(0 0% 0% / 0.6)',
                    transition: 'all 0.18s ease-out',
                  }}
                />
              );
            })}
          </motion.div>
        )}
        {phase === 'go' && (
          <motion.div
            key="go"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.3, 1] }}
            exit={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border-2 border-emerald-400/80 px-8 py-3 shadow-2xl backdrop-blur-md"
            style={{
              background:
                'linear-gradient(135deg, hsl(142 76% 38%) 0%, hsl(142 90% 50%) 100%)',
              boxShadow: '0 0 60px hsl(142 90% 50% / 0.7)',
            }}
          >
            <span
              className="text-3xl font-black tracking-[0.3em]"
              style={{ fontFamily: 'system-ui, sans-serif', color: 'hsl(0 0% 100%)', textShadow: '0 2px 8px hsl(0 0% 0% / 0.6)' }}
            >
              GO!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
