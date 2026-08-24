import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface RaceCountdownBadgeProps {
  /** ISO date — quando a season termina. */
  endsAt?: string | null;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Encerrada';
  const totalMin = Math.floor(ms / 60_000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Badge LED-style mostrando "⏱ Termina em Xd Yh" — atualiza a cada 30s.
 * Posicionado no canto inferior central da pista, abaixo do MiniMap.
 */
export function RaceCountdownBadge({ endsAt }: RaceCountdownBadgeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  const label = formatRemaining(ms);
  const urgent = ms > 0 && ms < 6 * 60 * 60 * 1000; // <6h

  return (
    <div
      className="absolute bottom-3 right-3 z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-1.5 shadow-lg flex items-center gap-1.5"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
      aria-label={`Tempo restante: ${label}`}
    >
      <Timer className={`w-3 h-3 ${urgent ? 'text-destructive' : 'text-muted-foreground'}`} />
      <div className="flex items-baseline gap-1">
        <span className="text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          Termina em
        </span>
        <span
          className={`text-[12px] font-black tabular-nums ${urgent ? 'text-destructive' : 'text-foreground'}`}
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
