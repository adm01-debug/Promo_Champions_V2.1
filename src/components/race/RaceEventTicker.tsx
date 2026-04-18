import { useEffect, useState } from 'react';

export interface RaceTickerEvent {
  id: string;
  text: string;
  /** epoch ms */
  at: number;
  icon?: string;
}

interface RaceEventTickerProps {
  events: RaceTickerEvent[];
  max?: number;
}

function formatTime(ms: number) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Faixa horizontal compacta (top-center, abaixo do LAP) com últimos N
 * eventos da corrida. Cada item entra com fade + slide e expira após 12s.
 */
export function RaceEventTicker({ events, max = 3 }: RaceEventTickerProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 4000);
    return () => window.clearInterval(id);
  }, []);

  const visible = events
    .filter((e) => now - e.at < 12_000)
    .slice(0, max);

  if (visible.length === 0) return null;

  return (
    <div
      className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-1 items-center"
      aria-live="polite"
    >
      {visible.map((e) => (
        <div
          key={e.id}
          className="rounded-full border border-border/50 backdrop-blur-md px-3 py-0.5 shadow-md flex items-center gap-1.5"
          style={{
            background: 'hsl(var(--background) / 0.85)',
            animation: 'race-ticker-fade 0.45s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          {e.icon && <span className="text-[11px] leading-none">{e.icon}</span>}
          <span className="text-[10px] font-bold text-foreground tracking-tight">
            {e.text}
          </span>
          <span
            className="text-[8px] font-mono font-bold text-muted-foreground tabular-nums"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {formatTime(e.at)}
          </span>
        </div>
      ))}
    </div>
  );
}
