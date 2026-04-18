import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down com árvores frondosas e construções de pit.
 * Layout calibrado para o circuito oval: árvores nos cantos externos
 * e nas margens; arbustos pequenos no infield.
 */

interface TreeProps { cx: number; cy: number; scale?: number; }

function Tree({ cx, cy, scale = 1 }: TreeProps) {
  const blobs = [
    { dx: 0, dy: 0, r: 16, fill: 'hsl(var(--race-tree-mid))' },
    { dx: -11, dy: -4, r: 11, fill: 'hsl(var(--race-tree-dark))' },
    { dx: 11, dy: -2, r: 12, fill: 'hsl(var(--race-tree-light))' },
    { dx: -7, dy: 9, r: 10, fill: 'hsl(var(--race-tree-dark))' },
    { dx: 9, dy: 8, r: 11, fill: 'hsl(var(--race-tree-light))' },
    { dx: 0, dy: -11, r: 10, fill: 'hsl(var(--race-tree-mid))' },
  ];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {/* sombra projetada */}
      <ellipse cx={3} cy={18} rx={20} ry={5.5} fill="hsl(var(--race-grass-shadow))" opacity={0.55} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.dx} cy={b.dy} r={b.r} fill={b.fill} />
      ))}
      {/* highlight superior */}
      <circle cx={-4} cy={-5} r={4.5} fill="hsl(var(--race-tree-light))" opacity={0.75} />
      <circle cx={3} cy={-8} r={2.5} fill="hsl(var(--race-asphalt-edge))" opacity={0.25} />
    </g>
  );
}

function Bush({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx={1} cy={3} rx={8} ry={2} fill="hsl(var(--race-grass-shadow))" opacity={0.5} />
      <circle r={6} fill="hsl(var(--race-tree-mid))" />
      <circle cx={-3} cy={-1} r={4} fill="hsl(var(--race-tree-light))" opacity={0.85} />
      <circle cx={3} cy={1} r={4} fill="hsl(var(--race-tree-dark))" opacity={0.7} />
    </g>
  );
}

interface BuildingProps { x: number; y: number; w: number; h: number; doors?: number; }

function PitBuilding({ x, y, w, h, doors = 4 }: BuildingProps) {
  const doorW = (w - 10) / doors - 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* sombra */}
      <rect x={4} y={5} width={w} height={h} rx={3} fill="hsl(var(--race-grass-shadow))" opacity={0.5} />
      {/* corpo */}
      <rect width={w} height={h} rx={3} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.6} />
      {/* faixa de teto */}
      <rect width={w} height={7} rx={2} fill="hsl(var(--race-curb-b))" />
      <rect y={7} width={w} height={2} fill="hsl(var(--race-checkered-dark))" opacity={0.4} />
      {/* portas de garagem */}
      {Array.from({ length: doors }).map((_, i) => (
        <g key={i} transform={`translate(${7 + i * (doorW + 4)} ${h - doorW - 5})`}>
          <rect width={doorW} height={doorW} fill="hsl(var(--race-asphalt))" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
          {/* divisões horizontais simulando porta basculante */}
          <line x1={0} y1={doorW * 0.33} x2={doorW} y2={doorW * 0.33} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} opacity={0.6} />
          <line x1={0} y1={doorW * 0.66} x2={doorW} y2={doorW * 0.66} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

function ControlTower({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx={3} cy={4} rx={20} ry={5.5} fill="hsl(var(--race-grass-shadow))" opacity={0.55} />
      {/* base */}
      <circle r={18} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.6} />
      {/* anel de vidro */}
      <circle r={11} fill="hsl(205 60% 35%)" stroke="hsl(var(--race-building-edge))" strokeWidth={1.2} />
      {/* janelas */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <rect
            key={deg}
            x={-1.5}
            y={-12.5}
            width={3}
            height={3}
            fill="hsl(var(--race-asphalt-edge))"
            opacity={0.85}
            transform={`rotate(${deg})`}
          />
        );
      })}
      {/* topo */}
      <circle r={4} fill="hsl(var(--race-curb-b))" />
      <circle r={1.5} fill="hsl(var(--race-asphalt-edge))" />
    </g>
  );
}

export function TrackScenery({ layer }: { layer: 'outer' | 'inner' }) {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  if (layer === 'outer') {
    // Árvores ao longo das bordas externas, evitando a área da pista.
    const trees: Array<[number, number, number]> = [
      // topo
      [40, 30, 1.0], [110, 25, 0.85], [W - 40, 35, 1.0], [W - 110, 25, 0.9],
      // base
      [40, H - 35, 1.05], [120, H - 30, 0.9], [W - 40, H - 35, 1.0], [W - 120, H - 30, 0.95],
      // laterais
      [25, 180, 0.9], [25, 320, 0.95], [25, 460, 0.9],
      [W - 25, 180, 0.9], [W - 25, 320, 1.0], [W - 25, 460, 0.95],
      // entre topo e laterais
      [60, 90, 0.7], [W - 60, 90, 0.75],
      [60, H - 90, 0.75], [W - 60, H - 90, 0.7],
    ];
    return (
      <g aria-hidden>
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // Camada interna (infield): construções de pit acima do lago + arbustos.
  return (
    <g aria-hidden>
      {/* prédio de pit no topo do infield */}
      <PitBuilding x={400} y={200} w={200} h={48} doors={5} />
      {/* torre de controle à esquerda do pit */}
      <ControlTower cx={350} cy={224} />
      {/* arbustos espalhados no infield */}
      <Bush cx={420} cy={400} />
      <Bush cx={580} cy={395} />
      <Bush cx={460} cy={425} />
      <Bush cx={540} cy={430} />
      <Bush cx={380} cy={410} />
      <Bush cx={620} cy={420} />
      {/* pequenas árvores no infield */}
      <Tree cx={650} cy={230} scale={0.55} />
      <Tree cx={680} cy={415} scale={0.5} />
    </g>
  );
}
