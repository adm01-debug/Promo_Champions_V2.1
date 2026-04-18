import { TRACK_PATH_D, CHECKPOINTS, getPositionOnTrack } from '../raceTrackHelpers';

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
    </g>
  );
}
