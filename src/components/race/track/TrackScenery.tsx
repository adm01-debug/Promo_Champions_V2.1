import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down flat para o circuito serpenteante:
 * árvores como clusters de bolinhas verdes + estruturas pit cinza.
 */

interface TreeProps { cx: number; cy: number; scale?: number; }

function Tree({ cx, cy, scale = 1 }: TreeProps) {
  const greens = ['#3a7a3a', '#4a8a4a', '#5a9a5a'];
  const blobs = [
    { dx: 0, dy: 0, r: 14, c: greens[1] },
    { dx: -10, dy: -4, r: 10, c: greens[0] },
    { dx: 10, dy: -2, r: 11, c: greens[2] },
    { dx: -6, dy: 8, r: 9, c: greens[0] },
    { dx: 8, dy: 7, r: 10, c: greens[2] },
    { dx: 0, dy: -10, r: 9, c: greens[1] },
  ];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <ellipse cx={2} cy={16} rx={18} ry={5} fill="#000" opacity={0.18} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.dx} cy={b.dy} r={b.r} fill={b.c} />
      ))}
      <circle cx={-3} cy={-4} r={4} fill="#7ab87a" opacity={0.6} />
    </g>
  );
}

interface BuildingProps { x: number; y: number; w: number; h: number; doors?: number; }

function Building({ x, y, w, h, doors = 3 }: BuildingProps) {
  const doorW = (w - 8) / doors - 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={3} y={4} width={w} height={h} rx={2} fill="#000" opacity={0.22} />
      <rect width={w} height={h} rx={2} fill="#c0c4c8" stroke="#6b7280" strokeWidth={1.4} />
      <rect width={w} height={6} fill="#9ca3af" />
      {Array.from({ length: doors }).map((_, i) => (
        <rect
          key={i}
          x={6 + i * (doorW + 4)}
          y={h - doorW - 4}
          width={doorW}
          height={doorW}
          fill="#4b5563"
          stroke="#1f2937"
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}

function ControlTower({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx={2} cy={3} rx={18} ry={5} fill="#000" opacity={0.22} />
      <circle r={16} fill="#c0c4c8" stroke="#6b7280" strokeWidth={1.4} />
      <circle r={9} fill="#9ca3af" stroke="#4b5563" strokeWidth={1} />
      <circle r={3} fill="#dc2626" />
    </g>
  );
}

export function TrackScenery({ layer }: { layer: 'outer' | 'inner' }) {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  if (layer === 'outer') {
    // árvores nas bordas livres do circuito serpenteante
    const trees: Array<[number, number, number]> = [
      [40, 50, 1], [110, 30, 0.85], [200, 60, 0.95],
      [W - 50, 30, 1], [W - 130, 50, 0.9],
      [40, H - 50, 0.95], [120, H - 30, 1], [240, H - 60, 0.9],
      [W - 50, H - 40, 1], [W - 140, H - 60, 0.9],
      [30, H / 2, 0.85], [W - 30, H / 2 - 40, 0.85],
    ];
    return (
      <g aria-hidden>
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // inner: pit area + torre numa região central livre (~280, 380)
  return (
    <g aria-hidden>
      <Building x={240} y={360} w={100} h={28} doors={3} />
      <Building x={350} y={360} w={90} h={28} doors={3} />
      <ControlTower cx={300} cy={330} />
      <Tree cx={500} cy={330} scale={0.75} />
      <Tree cx={460} cy={380} scale={0.7} />
    </g>
  );
}
