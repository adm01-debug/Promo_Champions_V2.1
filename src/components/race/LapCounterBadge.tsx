import { Flag } from 'lucide-react';

interface LapCounterBadgeProps {
  current: number;
  total: number;
}

/**
 * Badge LED-style com "LAP X / Y" — posicionado ao lado do MiniMap
 * (canto inferior esquerdo, deslocado p/ não colidir).
 */
export function LapCounterBadge({ current, total }: LapCounterBadgeProps) {
  return (
    <div
      className="absolute bottom-3 left-[110px] z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-1.5 shadow-lg flex items-center gap-1.5"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
      aria-label={`Volta ${current} de ${total}`}
    >
      <Flag className="w-3 h-3 text-primary" />
      <div className="flex items-baseline gap-1">
        <span className="text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          Lap
        </span>
        <span
          className="text-[12px] font-black tabular-nums text-foreground"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {current}
          <span className="text-muted-foreground font-bold">/{total}</span>
        </span>
      </div>
    </div>
  );
}
