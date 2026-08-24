import { DRS_ZONES, getPositionOnTrack } from './raceTrackHelpers';

/**
 * Renderiza overlay translúcido pulsante sobre cada DRS_ZONE da pista,
 * com label "DRS" no meio do trecho. Renderizado como filho do <RaceTrack>
 * (coordenadas da pista).
 */
export function DRSZoneOverlay() {
  return (
    <g pointerEvents="none" aria-hidden>
      {DRS_ZONES.map((z, idx) => {
        // amostra ~10 pontos do trecho para gerar polyline com largura
        const samples = 14;
        const innerPts: string[] = [];
        const outerPts: string[] = [];
        for (let i = 0; i <= samples; i++) {
          const t = z.start + ((z.end - z.start) * i) / samples;
          const inner = getPositionOnTrack(t, -22);
          const outer = getPositionOnTrack(t, 22);
          innerPts.push(`${inner.x},${inner.y}`);
          outerPts.push(`${outer.x},${outer.y}`);
        }
        const ringPoints = [...innerPts, ...outerPts.reverse()].join(' ');
        const midProgress = (z.start + z.end) / 2;
        const labelPos = getPositionOnTrack(midProgress, 0);

        return (
          <g key={`drs-zone-${idx}`}>
            <polygon
              points={ringPoints}
              fill="hsl(195 95% 55% / 0.18)"
              stroke="hsl(195 95% 55%)"
              strokeWidth={1.2}
              strokeDasharray="6 4"
              style={{
                animation: 'race-drs-zone-pulse 1.6s ease-in-out infinite',
                animationDelay: `${idx * 0.4}s`,
              }}
            />
            <g transform={`translate(${labelPos.x} ${labelPos.y})`}>
              <rect
                x={-14}
                y={-7}
                width={28}
                height={14}
                rx={3}
                fill="hsl(195 95% 45%)"
                stroke="hsl(0 0% 100%)"
                strokeWidth={1}
                opacity={0.9}
              />
              <text
                y={2}
                textAnchor="middle"
                fontSize={9}
                fontWeight={900}
                fill="hsl(0 0% 100%)"
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}
              >
                DRS
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
