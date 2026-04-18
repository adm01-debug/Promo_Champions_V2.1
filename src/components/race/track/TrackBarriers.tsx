import { getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Barreiras zebradas vermelho/branco em pontos estratégicos do circuito,
 * posicionadas para fora da pista (laneOffset positivo).
 */
const BARRIER_POSITIONS = [0.06, 0.2, 0.34, 0.5, 0.66, 0.82, 0.94];
const OFFSET = 56; // fora do asfalto (asfalto = 64 de largura → metade=32, run-off ~18)

function ZebraBarrier({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  const w = 38;
  const h = 14;
  const stripeW = w / 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx={2} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="#ffffff" stroke="#1a1a1a" strokeWidth={1.2} />
      {[0, 2, 4].map((i) => (
        <rect key={i} x={-w / 2 + i * stripeW} y={-h / 2} width={stripeW} height={h} fill="#dc2626" />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="none" stroke="#1a1a1a" strokeWidth={1.2} />
    </g>
  );
}

export function TrackBarriers() {
  return (
    <g aria-hidden>
      {BARRIER_POSITIONS.map((p, i) => {
        // alterna lado externo/interno para variedade visual
        const offset = i % 2 === 0 ? OFFSET : -OFFSET;
        const pos = getPositionOnTrack(p, offset);
        return <ZebraBarrier key={p} x={pos.x} y={pos.y} rotation={pos.rotation} />;
      })}
    </g>
  );
}
