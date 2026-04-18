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
    // árvores nos cantos e bordas livres do novo circuito
    const trees: Array<[number, number, number]> = [
      [40, 40, 1], [110, 25, 0.85], [200, 40, 0.95], [300, 25, 0.9],
      [W - 50, 30, 1], [W - 130, 45, 0.9], [W - 220, 30, 0.85],
      [40, H - 40, 0.95], [120, H - 25, 1], [240, H - 50, 0.9], [340, H - 30, 0.85],
      [W - 50, H - 40, 1], [W - 140, H - 60, 0.9], [W - 240, H - 35, 0.85],
      [30, H / 2 + 20, 0.85], [W - 30, H / 2 - 20, 0.85],
    ];
    return (
      <g aria-hidden>
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // inner: pit area + torre na área central-direita livre do novo traçado
  return (
    <g aria-hidden>
      <Building x={500} y={250} w={100} h={28} doors={3} />
      <Building x={610} y={250} w={90} h={28} doors={3} />
      <ControlTower cx={560} cy={220} />
      <Tree cx={720} cy={250} scale={0.75} />
      <Tree cx={680} cy={300} scale={0.7} />
      <Tree cx={560} cy={340} scale={0.7} />
    </g>
  );
}
