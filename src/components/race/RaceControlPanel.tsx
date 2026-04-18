import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type RaceFlag = 'green' | 'yellow' | 'red' | 'checkered';

interface RaceControlPanelProps {
  flag: RaceFlag;
  /** ISO date da largada (início da season). Se omitido, mostra "—". */
  startedAt?: string | null;
  /** ISO date do término previsto. */
  endsAt?: string | null;
  /** Total de ultrapassagens acumuladas. */
  overtakesTotal: number;
}

const FLAG_META: Record<RaceFlag, { label: string; color: string; bg: string; pattern?: string }> = {
  green: { label: 'PISTA LIVRE', color: 'hsl(0 0% 100%)', bg: 'hsl(142 76% 38%)' },
  yellow: { label: 'CUIDADO', color: 'hsl(20 30% 18%)', bg: 'hsl(45 95% 55%)' },
  red: { label: 'PARALISADA', color: 'hsl(0 0% 100%)', bg: 'hsl(0 80% 50%)' },
  checkered: {
    label: 'BANDEIRADA',
    color: 'hsl(0 0% 100%)',
    bg: 'hsl(0 0% 12%)',
    pattern: 'repeating-conic-gradient(hsl(0 0% 8%) 0% 25%, hsl(0 0% 100%) 0% 50%)',
  },
};

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Painel lateral "Race Control" — bandeira atual, tempo decorrido, próximo evento,
 * total de ultrapassagens. Glassmorphism vertical compacto.
 */
export function RaceControlPanel({ flag, startedAt, endsAt, overtakesTotal }: RaceControlPanelProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const meta = FLAG_META[flag];
  const elapsed = startedAt ? formatDuration(now - new Date(startedAt).getTime()) : '—';
  const remaining = endsAt ? formatDuration(new Date(endsAt).getTime() - now) : '—';

  return (
    <div
      className="absolute top-3 left-3 z-20 w-[180px] rounded-xl border border-border/50 backdrop-blur-md p-3 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
      aria-label="Race Control"
    >
      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground mb-2 flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
        </span>
        Race Control
      </div>

      {/* Bandeira atual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={flag}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg px-2.5 py-2 mb-2.5 shadow-inner"
          style={{
            background: meta.pattern ?? meta.bg,
            backgroundSize: meta.pattern ? '14px 14px' : undefined,
            animation: flag === 'yellow' ? 'race-yellow-flag-flash 0.7s ease-in-out infinite' : undefined,
          }}
        >
          <div
            className="text-[10px] font-black tracking-[0.16em] text-center"
            style={{
              color: meta.color,
              textShadow: meta.pattern ? '0 1px 2px hsl(0 0% 0% / 0.8)' : undefined,
            }}
          >
            {meta.label}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Métricas */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Decorrido</span>
          <span className="text-[10px] font-mono font-black tabular-nums text-foreground">{elapsed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Restante</span>
          <span className="text-[10px] font-mono font-black tabular-nums text-foreground">{remaining}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Overtakes</span>
          <motion.span
            key={overtakesTotal}
            initial={{ scale: 1.4, color: 'hsl(45 95% 55%)' }}
            animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
            transition={{ duration: 0.5 }}
            className="text-[12px] font-mono font-black tabular-nums"
          >
            {overtakesTotal}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
