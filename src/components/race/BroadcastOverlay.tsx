import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface BroadcastEvent {
  id: string;
  kind: 'gap' | 'overtake' | 'finale' | 'leader';
  title: string;
  detail: string;
}

interface Props {
  events: BroadcastEvent[];
  /** Bandeira virtual atual (afeta cor da faixa). */
  flag?: 'green' | 'yellow' | 'checkered';
}

const KIND_BADGE: Record<BroadcastEvent['kind'], { label: string; bg: string }> = {
  gap: { label: 'BATTLE', bg: 'hsl(0 84% 60%)' },
  overtake: { label: 'OVERTAKE', bg: 'hsl(45 95% 55%)' },
  finale: { label: 'CHECKERED', bg: 'hsl(0 0% 12%)' },
  leader: { label: 'P1', bg: 'hsl(262 83% 58%)' },
};

const FLAG_ICON: Record<NonNullable<Props['flag']>, string> = {
  green: '🟢',
  yellow: '🟡',
  checkered: '🏁',
};

/**
 * Lower-third estilo F1 TV: rotaciona entre eventos quentes a cada 12s.
 * Aparece somente se houver eventos. Posicionado no rodapé, acima do MiniMap.
 */
export function BroadcastOverlay({ events, flag = 'green' }: Props) {
  const reducedMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % events.length), 12_000);
    return () => window.clearInterval(id);
  }, [events.length]);

  const current = useMemo(() => events[idx % Math.max(1, events.length)] ?? null, [events, idx]);
  if (!current) return null;
  const badge = KIND_BADGE[current.kind];

  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[110px] z-20 w-[min(420px,72%)]"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-stretch overflow-hidden rounded-md border border-border/50 shadow-2xl backdrop-blur-md"
          style={{ background: 'hsl(var(--background) / 0.92)' }}
        >
          {/* Faixa lateral colorida com bandeira */}
          <div
            className="flex items-center justify-center px-2"
            style={{ background: badge.bg, minWidth: 48 }}
          >
            <span className="text-base" aria-hidden>{FLAG_ICON[flag]}</span>
          </div>
          {/* Badge tipo */}
          <div
            className="flex items-center px-2.5"
            style={{ background: 'hsl(0 0% 8%)' }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.22em] text-white"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {badge.label}
            </span>
          </div>
          {/* Conteúdo */}
          <div className="flex flex-1 flex-col justify-center px-3 py-1.5 min-w-0">
            <span className="truncate text-[11px] font-black uppercase tracking-[0.08em] text-foreground">
              {current.title}
            </span>
            <span className="truncate text-[10px] font-medium text-muted-foreground">
              {current.detail}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
