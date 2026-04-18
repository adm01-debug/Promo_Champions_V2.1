import { TRACK_PATH_D, CHECKPOINTS, DRS_ZONES, getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Asfalto top-down polido — estilo Micro Machines / Mario Kart 2D:
 * - Run-off bege amplo
 * - Asfalto cinza com leve textura
 * - Curbs vermelho/branco aplicados como overlay tracejado em todo o perímetro
 * - Linha central tracejada amarelada, contínua
 * - Borda branca fina visível
 */
const TRACK_WIDTH = 72;
const RUNOFF_EXTRA = 22;

export function TrackAsphalt() {
  return (
    <g aria-hidden>
      {/* sombra suave do asfalto sobre a grama */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-grass-shadow))"
        strokeWidth={TRACK_WIDTH + RUNOFF_EXTRA * 2 + 8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        transform="translate(0 4)"
      />

      {/* run-off bege */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-runoff))"
        strokeWidth={TRACK_WIDTH + RUNOFF_EXTRA * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* curbs vermelho/branco — duas faixas estreitas nas bordas externas */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-curb-b))"
        strokeWidth={TRACK_WIDTH + 16}
        strokeDasharray="14 14"
        strokeLinecap="butt"
        strokeLinejoin="round"
        opacity={0.95}
      />
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-curb-a))"
        strokeWidth={TRACK_WIDTH + 16}
        strokeDasharray="14 14"
        strokeDashoffset={14}
        strokeLinecap="butt"
        strokeLinejoin="round"
        opacity={0.95}
      />

      {/* asfalto base */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt))"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* gradiente de profundidade sobre o asfalto */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="url(#asphaltDepth)"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* textura sutil sobre asfalto */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="url(#asphaltTexture)"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />

      {/* borda branca fina visível (limite interno do curb) */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt-edge))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />

      {/* linha central tracejada amarelada */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(48 95% 60%)"
        strokeWidth={2}
        strokeDasharray="18 12"
        strokeLinecap="butt"
        opacity={0.55}
      />

      {/* checkpoints discretos */}
      {CHECKPOINTS.map((p) => {
        const inner = getPositionOnTrack(p, -TRACK_WIDTH / 2);
        const outer = getPositionOnTrack(p, TRACK_WIDTH / 2);
        return (
          <line
            key={p}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="hsl(var(--race-asphalt-edge))"
            strokeWidth={2}
            strokeDasharray="3 4"
            opacity={0.5}
          />
        );
      })}

      {/* ===== DRS zones — listras diagonais verdes sutis ===== */}
      {DRS_ZONES.map((zone, zi) => {
        const samples = 14;
        const pts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i <= samples; i++) {
          const p = zone.start + ((zone.end - zone.start) * i) / samples;
          pts.push(getPositionOnTrack(p, 0));
        }
        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
        const labelPos = getPositionOnTrack((zone.start + zone.end) / 2, -TRACK_WIDTH / 2 - 14);
        return (
          <g key={`drs-${zi}`} pointerEvents="none">
            <path
              d={d}
              fill="none"
              stroke="hsl(142 76% 45%)"
              strokeWidth={TRACK_WIDTH - 14}
              strokeDasharray="6 10"
              strokeLinecap="butt"
              opacity={0.18}
            />
            <g transform={`translate(${labelPos.x} ${labelPos.y})`}>
              <rect x={-11} y={-5} width={22} height={10} rx={2} fill="hsl(142 76% 38%)" opacity={0.9} />
              <text y={3} textAnchor="middle" fontSize={7} fontWeight={900} fill="hsl(0 0% 100%)" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em' }}>
                DRS
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
