import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down flat: árvores e edifícios pit usando tokens semânticos
 * para se adaptar a light/dark/skins.
 */

interface TreeProps { cx: number; cy: number; scale?: number; }

function Tree({ cx, cy, scale = 1 }: TreeProps) {
  const blobs = [
    { dx: 0, dy: 0, r: 14, fill: 'hsl(var(--race-tree-mid))' },
    { dx: -10, dy: -4, r: 10, fill: 'hsl(var(--race-tree-dark))' },
    { dx: 10, dy: -2, r: 11, fill: 'hsl(var(--race-tree-light))' },
    { dx: -6, dy: 8, r: 9, fill: 'hsl(var(--race-tree-dark))' },
    { dx: 8, dy: 7, r: 10, fill: 'hsl(var(--race-tree-light))' },
    { dx: 0, dy: -10, r: 9, fill: 'hsl(var(--race-tree-mid))' },
  ];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <ellipse cx={2} cy={16} rx={18} ry={5} fill="hsl(var(--race-grass-shadow))" opacity={0.45} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.dx} cy={b.dy} r={b.r} fill={b.fill} />
      ))}
      <circle cx={-3} cy={-4} r={4} fill="hsl(var(--race-tree-light))" opacity={0.7} />
    </g>
  );
}

interface BuildingProps { x: number; y: number; w: number; h: number; doors?: number; }

function Building({ x, y, w, h, doors = 3 }: BuildingProps) {
  const doorW = (w - 8) / doors - 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={3} y={4} width={w} height={h} rx={2} fill="hsl(var(--race-grass-shadow))" opacity={0.4} />
      <rect width={w} height={h} rx={2} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.4} />
      <rect width={w} height={6} fill="hsl(var(--race-asphalt))" />
      {Array.from({ length: doors }).map((_, i) => (
        <rect
          key={i}
          x={6 + i * (doorW + 4)}
          y={h - doorW - 4}
          width={doorW}
          height={doorW}
          fill="hsl(var(--race-building-edge))"
          stroke="hsl(var(--race-checkered-dark))"
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}

function ControlTower({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx={2} cy={3} rx={18} ry={5} fill="hsl(var(--race-grass-shadow))" opacity={0.45} />
      <circle r={16} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.4} />
      <circle r={9} fill="hsl(var(--race-asphalt))" stroke="hsl(var(--race-building-edge))" strokeWidth={1} />
      <circle r={3} fill="hsl(var(--race-curb-b))" />
    </g>
  );
}

export function TrackScenery({ layer }: { layer: 'outer' | 'inner' }) {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  if (layer === 'outer') {
    // Árvores nas 4 bordas externas (fora da serpentina que ocupa toda a área).
    const trees: Array<[number, number, number]> = [
      [30, 25, 0.9], [80, 15, 0.8], [W - 30, 25, 0.95], [W - 80, 15, 0.85],
      [30, H - 25, 0.95], [80, H - 15, 0.85], [W - 30, H - 25, 0.9], [W - 80, H - 15, 0.8],
      [20, 200, 0.8], [20, 320, 0.85], [20, 440, 0.8],
      [W - 20, 200, 0.85], [W - 20, 320, 0.8], [W - 20, 440, 0.85],
    ];
    return (
      <g aria-hidden>
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // Camada interna: pequenas árvores nos gaps entre as voltas da serpentina.
  return (
    <g aria-hidden>
      <Tree cx={200} cy={140} scale={0.55} />
      <Tree cx={780} cy={140} scale={0.55} />
      <Tree cx={250} cy={275} scale={0.5} />
      <Tree cx={750} cy={275} scale={0.5} />
      <Tree cx={250} cy={505} scale={0.5} />
      <Tree cx={750} cy={505} scale={0.5} />
    </g>
  );
}
