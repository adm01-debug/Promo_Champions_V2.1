import { getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Linha de chegada xadrez perpendicular ao path no progresso 0.
 * Borda usa token semântico para harmonizar com tema.
 */
const TRACK_HALF = 32;
const STRIPE_W = 22;

export function TrackStartGantry() {
  const center = getPositionOnTrack(0);
  const inner = getPositionOnTrack(0, -TRACK_HALF);
  const outer = getPositionOnTrack(0, TRACK_HALF);
  const rotation = center.rotation + 90;
  const length = Math.hypot(outer.x - inner.x, outer.y - inner.y);

  return (
    <g aria-hidden transform={`translate(${center.x} ${center.y}) rotate(${rotation})`}>
      {/* sombra suave abaixo da faixa */}
      <rect
        x={-STRIPE_W / 2 + 1}
        y={-length / 2 + 2}
        width={STRIPE_W}
        height={length}
        fill="hsl(var(--race-grass-shadow))"
        opacity={0.35}
      />
      <rect
        x={-STRIPE_W / 2}
        y={-length / 2}
        width={STRIPE_W}
        height={length}
        fill="url(#finishCheckers)"
        stroke="hsl(var(--race-checkered-dark))"
        strokeWidth={1.5}
      />
      {/* shimmer pulsante sutil sobre a linha */}
      <rect
        x={-STRIPE_W / 2}
        y={-length / 2}
        width={STRIPE_W}
        height={length}
        fill="hsl(0 0% 100%)"
        opacity={0.12}
      >
        <animate attributeName="opacity" values="0.05;0.22;0.05" dur="2.4s" repeatCount="indefinite" />
      </rect>
    </g>
  );
}
