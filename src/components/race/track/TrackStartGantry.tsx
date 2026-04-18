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
      <rect
        x={-STRIPE_W / 2}
        y={-length / 2}
        width={STRIPE_W}
        height={length}
        fill="url(#finishCheckers)"
        stroke="hsl(var(--race-checkered-dark))"
        strokeWidth={1.5}
      />
    </g>
  );
}
