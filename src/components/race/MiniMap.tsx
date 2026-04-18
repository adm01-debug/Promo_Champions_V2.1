import { TRACK_PATH_D, TRACK_VIEWBOX, getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface MiniMapProps {
  cars: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
}

/**
 * Radar minimalista (80px) com a pista simplificada e dots coloridos
 * representando cada carro. Glassmorphism. Atualiza junto com o main view.
 */
export function MiniMap({ cars, currentUserSalespersonId }: MiniMapProps) {
  const { width, height } = TRACK_VIEWBOX;

  return (
    <div
      className="absolute bottom-3 left-3 z-20 rounded-xl border border-border/50 backdrop-blur-md p-2 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.72)' }}
      aria-label="Mini-mapa do circuito"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1 text-center">
        Radar
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width={96} height={58} aria-hidden>
        {/* pista simplificada */}
        <path
          d={TRACK_PATH_D}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.35)"
          strokeWidth={36}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={TRACK_PATH_D}
          fill="none"
          stroke="hsl(var(--background) / 0.6)"
          strokeWidth={2}
          strokeDasharray="14 10"
        />
        {/* dots dos carros */}
        {cars.map((c) => {
          const pos = getPositionOnTrack(Number(c.progress), 0);
          const isMe = currentUserSalespersonId && c.salesperson_id === currentUserSalespersonId;
          return (
            <g key={c.car_id}>
              {isMe && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={26}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  opacity={0.9}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={18}
                fill={c.primary_color}
                stroke={c.secondary_color}
                strokeWidth={4}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
