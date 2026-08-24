import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  /** Quando true, mostra fogos de artifício (ex: 100% da season). */
  showFireworks?: boolean;
}

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
] as const;

/**
 * Easter eggs visuais:
 * 1. Konami code → "Rainbow Road" 10s (gradiente animado overlay).
 * 2. showFireworks (vindo de pai) → fogos SVG em P1.
 */
export function RaceEasterEggs({ showFireworks }: Props) {
  const reducedMotion = useReducedMotion();
  const [rainbowActive, setRainbowActive] = useState(false);
  const seqRef = useRef<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seqRef.current = [...seqRef.current, k].slice(-KONAMI.length);
      if (seqRef.current.join(',') === KONAMI.join(',')) {
        setRainbowActive(true);
        seqRef.current = [];
        window.setTimeout(() => setRainbowActive(false), 10_000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <AnimatePresence>
        {rainbowActive && (
          <motion.div
            key="rainbow"
            className="pointer-events-none absolute inset-0 z-[8] rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background:
                'linear-gradient(115deg, hsl(0 90% 55%), hsl(35 95% 55%), hsl(50 95% 55%), hsl(140 75% 50%), hsl(195 90% 55%), hsl(245 80% 60%), hsl(290 80% 55%))',
              backgroundSize: '300% 100%',
              animation: reducedMotion ? undefined : 'race-rainbow-road 3s linear infinite',
              mixBlendMode: 'overlay',
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFireworks && !reducedMotion && (
          <motion.svg
            key="fireworks-svg"
            className="pointer-events-none absolute inset-0 z-[9]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          >
            {[
              { cx: 22, cy: 30, color: 'hsl(45 95% 60%)', delay: 0 },
              { cx: 78, cy: 28, color: 'hsl(0 84% 60%)', delay: 0.4 },
              { cx: 50, cy: 18, color: 'hsl(195 90% 55%)', delay: 0.8 },
              { cx: 35, cy: 50, color: 'hsl(290 80% 60%)', delay: 1.2 },
              { cx: 65, cy: 48, color: 'hsl(140 75% 50%)', delay: 1.6 },
            ].map((f, i) => (
              <g key={i} style={{ animation: `race-fireworks-burst 1.6s ease-out ${f.delay}s both` }}>
                {Array.from({ length: 12 }).map((_, j) => {
                  const angle = (j / 12) * Math.PI * 2;
                  const r = 6;
                  const x = f.cx + Math.cos(angle) * r;
                  const y = f.cy + Math.sin(angle) * r;
                  return (
                    <line
                      key={j}
                      x1={f.cx}
                      y1={f.cy}
                      x2={x}
                      y2={y}
                      stroke={f.color}
                      strokeWidth={0.4}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 1.5px ${f.color})` }}
                    />
                  );
                })}
              </g>
            ))}
          </motion.svg>
        )}
      </AnimatePresence>
    </>
  );
}
