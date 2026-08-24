import { TRACK_PATH_D, TRACK_VIEWBOX, getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface MiniMapProps {
  cars: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
}

/**
 * Radar minimalista vertical (~retrato) com a pista simplificada e dots
 * coloridos representando cada carro. Glassmorphism. Atualiza junto com o main view.
 * Calibrado para viewBox 600×1000.
 */
export function MiniMap({ cars, currentUserSalespersonId }: MiniMapProps) {
  const { width, height } = TRACK_VIEWBOX;
  // Mantém proporção retrato: largura fixa 56, altura calculada
  const radarW = 60;
  const radarH = Math.round((height / width) * radarW); // ~100

  return (
    <div
      className="absolute bottom-3 left-3 z-20 rounded-xl border border-border/50 backdrop-blur-md p-2 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.72)' }}
      aria-label="Mini-mapa do circuito"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1 text-center">
        Radar
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width={radarW} height={radarH} aria-hidden>
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
        {/* linha de largada (horizontal no topo) */}
        <line
          x1={210} y1={95} x2={390} y2={95}
          stroke="hsl(var(--primary))"
          strokeWidth={6}
          opacity={0.9}
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
                  r={32}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={5}
                  opacity={0.9}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={c.primary_color}
                stroke={c.secondary_color}
                strokeWidth={5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
