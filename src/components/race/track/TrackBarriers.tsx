import { getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Barreiras tipo TecPro / pneus — pequenos blocos brancos com sombra
 * em pontos estratégicos, alinhados perpendicular à pista.
 * Mantém o look top-down "diecast toy track".
 */
const BARRIER_POSITIONS = [0.06, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92];
const OFFSET_OUTER = 60;
const OFFSET_INNER = -60;

function TyreStack({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {/* sombra */}
      <ellipse cx={1.5} cy={3} rx={9} ry={2.5} fill="hsl(var(--race-checkered-dark))" opacity={0.35} />
      {/* 3 pneus alinhados */}
      {[-6, 0, 6].map((dx) => (
        <g key={dx} transform={`translate(${dx} 0)`}>
          <circle r={3.5} fill="hsl(var(--race-checkered-dark))" />
          <circle r={2} fill="hsl(var(--race-asphalt))" />
          <circle r={0.6} fill="hsl(var(--race-checkered-dark))" />
        </g>
      ))}
    </g>
  );
}

export function TrackBarriers() {
  return (
    <g aria-hidden>
      {BARRIER_POSITIONS.map((p, i) => {
        const offset = i % 2 === 0 ? OFFSET_OUTER : OFFSET_INNER;
        const pos = getPositionOnTrack(p, offset);
        return <TyreStack key={p} x={pos.x} y={pos.y} rotation={pos.rotation} />;
      })}
    </g>
  );
}
