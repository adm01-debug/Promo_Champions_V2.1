import { getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Barreiras zebradas (curb) em pontos estratégicos do circuito.
 * Usa tokens --race-curb-a/b para cor e --race-checkered-dark para borda.
 */
const BARRIER_POSITIONS = [0.05, 0.18, 0.3, 0.42, 0.55, 0.7, 0.85, 0.95];
const OFFSET = 56;

function ZebraBarrier({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  const w = 38;
  const h = 14;
  const stripeW = w / 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx={2} fill="hsl(var(--race-checkered-dark))" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="hsl(var(--race-curb-a))" stroke="hsl(var(--race-checkered-dark))" strokeWidth={1.2} />
      {[0, 2, 4].map((i) => (
        <rect key={i} x={-w / 2 + i * stripeW} y={-h / 2} width={stripeW} height={h} fill="hsl(var(--race-curb-b))" />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="none" stroke="hsl(var(--race-checkered-dark))" strokeWidth={1.2} />
    </g>
  );
}

export function TrackBarriers() {
  return (
    <g aria-hidden>
      {BARRIER_POSITIONS.map((p, i) => {
        const offset = i % 2 === 0 ? OFFSET : -OFFSET;
        const pos = getPositionOnTrack(p, offset);
        return <ZebraBarrier key={p} x={pos.x} y={pos.y} rotation={pos.rotation} />;
      })}
    </g>
  );
}
