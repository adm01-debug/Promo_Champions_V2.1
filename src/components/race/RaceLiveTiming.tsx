import { RankBadge } from './RankBadge';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface RaceLiveTimingProps {
  entries: RaceLeaderboardEntry[];
  leaderProgress: number;
}

export function RaceLiveTiming({ entries, leaderProgress }: RaceLiveTimingProps) {
  if (entries.length === 0) return null;

  return (
    <div
      className="absolute top-3 right-3 z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-2 shadow-lg"
      style={{
        background: 'hsl(var(--background) / 0.78)',
        minWidth: 210,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Live Timing
        </span>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
        </span>
      </div>
      <div className="space-y-1">
        {entries.map((c, i) => {
          const gap = i === 0 ? null : leaderProgress - Number(c.progress);
          const gapStr = gap === null ? 'LEADER' : `+${(gap * 100).toFixed(2)}%`;
          return (
            <div key={c.car_id} className="flex items-center gap-2">
              <RankBadge rank={i + 1} />
              <span className="flex-1 truncate text-[11px] font-medium text-foreground/90">
                {c.salesperson_name?.split(' ')[0]}
              </span>
              <span
                className={`font-mono tabular-nums w-12 text-right ${
                  i === 0
                    ? 'text-[11px] font-black text-primary'
                    : 'text-[10px] font-bold text-muted-foreground'
                }`}
                style={{ letterSpacing: '-0.02em' }}
              >
                {gapStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
