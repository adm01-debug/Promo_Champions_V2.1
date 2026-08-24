import { TRACK_PATH_D, TRACK_VIEWBOX, getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface RaceMiniMapProps {
  cars: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
}

/**
 * Mini-mapa periférico (canto inferior esquerdo) — silhueta da pista
 * + dot por carro. Usa o mesmo TRACK_PATH para garantir consistência
 * visual com a pista principal.
 */
export function RaceMiniMap({ cars, currentUserSalespersonId }: RaceMiniMapProps) {
  return (
    <div
      className="absolute bottom-3 left-3 z-20 rounded-xl border border-border/50 backdrop-blur-md p-1.5 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
      aria-label="Mini-mapa do circuito"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 text-center">
        Track
      </div>
      <svg
        viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
        width={84}
        height={140}
        aria-hidden
      >
        <path
          d={TRACK_PATH_D}
          fill="none"
          stroke="hsl(var(--foreground) / 0.18)"
          strokeWidth={48}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={TRACK_PATH_D}
          fill="none"
          stroke="hsl(var(--background))"
          strokeWidth={6}
          strokeDasharray="14 12"
          opacity={0.7}
        />
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
                  strokeWidth={6}
                  opacity={0.85}
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
