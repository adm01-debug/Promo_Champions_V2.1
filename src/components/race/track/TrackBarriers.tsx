import { getPositionOnTrack, TRACK_RY_INNER, TRACK_RY_OUTER } from '../raceTrackHelpers';

/**
 * Barreiras zebradas vermelho/branco verticais top-down.
 * Posicionadas em pontos estratégicos do perímetro externo da pista.
 */
const BARRIER_POSITIONS = [0.12, 0.38, 0.6, 0.88]; // progresso normalizado

function ZebraBarrier({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  const w = 38;
  const h = 14;
  const stripeW = w / 6;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {/* sombra */}
      <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx={2} fill="#000" opacity={0.25} />
      {/* base branca */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="#ffffff" stroke="#1a1a1a" strokeWidth={1.2} />
      {/* listras vermelhas alternadas */}
      {[0, 2, 4].map((i) => (
        <rect
          key={i}
          x={-w / 2 + i * stripeW}
          y={-h / 2}
          width={stripeW}
          height={h}
          fill="#dc2626"
        />
      ))}
      {/* contorno final por cima */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="none" stroke="#1a1a1a" strokeWidth={1.2} />
    </g>
  );
}

export function TrackBarriers() {
  const offset = (TRACK_RY_OUTER - TRACK_RY_INNER) / 2 + 28; // pouco fora do asfalto

  return (
    <g aria-hidden>
      {BARRIER_POSITIONS.map((p) => {
        const pos = getPositionOnTrack(p, offset);
        return <ZebraBarrier key={p} x={pos.x} y={pos.y} rotation={pos.rotation} />;
      })}
    </g>
  );
}
