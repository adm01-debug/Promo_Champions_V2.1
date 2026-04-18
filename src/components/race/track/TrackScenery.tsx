import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down com árvores, paddock (boxes) e arquibancadas.
 * Layout calibrado para o NOVO oval estendido (margens ~95px).
 * - layer 'outer': árvores + arquibancadas nas bordas externas (fora da pista)
 * - layer 'inner': pit building, torre, paddock e arbustos no infield
 */

interface TreeProps { cx: number; cy: number; scale?: number; }

function Tree({ cx, cy, scale = 1 }: TreeProps) {
  // Árvore com sombra suave via filter (não elipse dura).
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} style={{ filter: 'drop-shadow(2px 3px 2px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <circle r={16} fill="hsl(var(--race-tree-mid))" />
      <circle cx={-11} cy={-4} r={11} fill="hsl(var(--race-tree-dark))" />
      <circle cx={11} cy={-2} r={12} fill="hsl(var(--race-tree-light))" />
      <circle cx={-7} cy={9} r={10} fill="hsl(var(--race-tree-dark))" />
      <circle cx={9} cy={8} r={11} fill="hsl(var(--race-tree-light))" />
      <circle cx={0} cy={-11} r={10} fill="hsl(var(--race-tree-mid))" />
      {/* highlight superior */}
      <circle cx={-4} cy={-6} r={4.5} fill="hsl(var(--race-tree-light))" opacity={0.8} />
      <circle cx={3} cy={-9} r={2.3} fill="hsl(var(--race-asphalt-edge))" opacity={0.28} />
    </g>
  );
}

function Bush({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} style={{ filter: 'drop-shadow(1px 2px 1.5px hsl(var(--race-grass-shadow) / 0.5))' }}>
      <circle r={6} fill="hsl(var(--race-tree-mid))" />
      <circle cx={-3} cy={-1} r={4} fill="hsl(var(--race-tree-light))" opacity={0.9} />
      <circle cx={3} cy={1} r={4} fill="hsl(var(--race-tree-dark))" opacity={0.7} />
    </g>
  );
}

interface BuildingProps { x: number; y: number; w: number; h: number; doors?: number; }

function PitBuilding({ x, y, w, h, doors = 5 }: BuildingProps) {
  const doorW = (w - 14) / doors - 4;
  return (
    <g transform={`translate(${x} ${y})`} style={{ filter: 'drop-shadow(3px 4px 3px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <rect width={w} height={h} rx={4} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.6} />
      {/* faixa de teto */}
      <rect width={w} height={8} rx={3} fill="hsl(var(--race-curb-b))" />
      <rect y={8} width={w} height={2} fill="hsl(var(--race-checkered-dark))" opacity={0.4} />
      {/* portas de garagem */}
      {Array.from({ length: doors }).map((_, i) => (
        <g key={i} transform={`translate(${9 + i * (doorW + 4)} ${h - doorW - 6})`}>
          <rect width={doorW} height={doorW} fill="hsl(var(--race-asphalt))" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
          <line x1={0} y1={doorW * 0.33} x2={doorW} y2={doorW * 0.33} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} opacity={0.6} />
          <line x1={0} y1={doorW * 0.66} x2={doorW} y2={doorW * 0.66} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

function ControlTower({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} style={{ filter: 'drop-shadow(3px 4px 3px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <circle r={18} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.6} />
      <circle r={11} fill="hsl(205 60% 35%)" stroke="hsl(var(--race-building-edge))" strokeWidth={1.2} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <rect key={deg} x={-1.5} y={-12.5} width={3} height={3}
          fill="hsl(var(--race-asphalt-edge))" opacity={0.85} transform={`rotate(${deg})`} />
      ))}
      <circle r={4} fill="hsl(var(--race-curb-b))" />
      <circle r={1.5} fill="hsl(var(--race-asphalt-edge))" />
    </g>
  );
}

/** Paddock: boxes alinhados embaixo do pit building. */
function Paddock({ x, y, w, h, slots = 6 }: { x: number; y: number; w: number; h: number; slots?: number }) {
  const slotW = w / slots;
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <rect width={w} height={h} fill="hsl(var(--race-asphalt))" opacity={0.85} stroke="hsl(var(--race-asphalt-edge))" strokeWidth={0.8} />
      {Array.from({ length: slots - 1 }).map((_, i) => (
        <line key={i} x1={(i + 1) * slotW} y1={2} x2={(i + 1) * slotW} y2={h - 2}
          stroke="hsl(var(--race-asphalt-edge))" strokeWidth={1} opacity={0.85} strokeDasharray="2 2" />
      ))}
      {/* numeração */}
      {Array.from({ length: slots }).map((_, i) => (
        <text key={`n${i}`} x={i * slotW + slotW / 2} y={h / 2 + 2} textAnchor="middle"
          fontSize={6} fontWeight={800} fill="hsl(var(--race-asphalt-edge))" opacity={0.7}
          style={{ fontFamily: 'system-ui, sans-serif' }}>{i + 1}</text>
      ))}
    </g>
  );
}

/** Marshal post: poste laranja com bandeirinha (fiscal de pista). */
function MarshalPost({ cx, cy, flagColor = 'hsl(28 95% 55%)' }: { cx: number; cy: number; flagColor?: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden style={{ filter: 'drop-shadow(1.5px 2px 1.5px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <circle r={3.5} fill="hsl(28 95% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
      <rect x={-0.6} y={-12} width={1.2} height={9} fill="hsl(var(--race-checkered-dark))" />
      <path d="M0.6,-12 L7,-9.5 L0.6,-7 Z" fill={flagColor} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} />
      <circle r={1} fill="hsl(0 0% 100%)" opacity={0.6} />
    </g>
  );
}

/** Bandeiras triangulares de patrocinador (estilo F1) penduradas em linha. */
function SponsorBunting({ x, y, w, count = 8 }: { x: number; y: number; w: number; count?: number }) {
  const step = w / count;
  const palette = ['hsl(0 75% 52%)', 'hsl(0 0% 98%)', 'hsl(210 75% 52%)', 'hsl(45 92% 55%)'];
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <line x1={0} y1={0} x2={w} y2={0} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.6} opacity={0.85} />
      {Array.from({ length: count }).map((_, i) => {
        const px = i * step + step / 2;
        const c = palette[i % palette.length];
        return (
          <path
            key={i}
            d={`M${px - 2.5},0 L${px + 2.5},0 L${px},5.5 Z`}
            fill={c}
            stroke="hsl(var(--race-checkered-dark))"
            strokeWidth={0.4}
            opacity={0.95}
          />
        );
      })}
    </g>
  );
}

/** Arquibancada: barras coloridas pixeladas representando público. */
function Grandstand({ x, y, w, h, vertical = false }: { x: number; y: number; w: number; h: number; vertical?: boolean }) {
  const stripes = vertical ? Math.floor(h / 4) : Math.floor(w / 4);
  const palette = ['hsl(0 70% 55%)', 'hsl(45 90% 58%)', 'hsl(210 70% 55%)', 'hsl(280 50% 58%)', 'hsl(0 0% 95%)'];
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden style={{ filter: 'drop-shadow(2px 2px 2px hsl(var(--race-grass-shadow) / 0.5))' }}>
      {/* base estrutura */}
      <rect width={w} height={h} rx={3} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1} />
      {/* faixa de cobertura colorida */}
      <rect width={w} height={vertical ? h : 4} fill="hsl(var(--race-curb-b))" rx={2} />
      {/* "público" pixelado */}
      {Array.from({ length: stripes }).map((_, i) => {
        const c = palette[i % palette.length];
        return vertical ? (
          <rect key={i} x={2} y={6 + i * 4} width={w - 4} height={2.5} fill={c} opacity={0.85} />
        ) : (
          <rect key={i} x={2 + i * 4} y={6} width={2.5} height={h - 10} fill={c} opacity={0.85} />
        );
      })}
    </g>
  );
}

export function TrackScenery({ layer }: { layer: 'outer' | 'inner' }) {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  if (layer === 'outer') {
    // Árvores nos cantos e bordas externas, evitando a pista (margem ~95px).
    const trees: Array<[number, number, number]> = [
      [40, 30, 1.05], [110, 22, 0.85], [W - 40, 35, 1.0], [W - 110, 22, 0.9],
      [40, H - 35, 1.1], [120, H - 28, 0.9], [W - 40, H - 35, 1.0], [W - 120, H - 28, 0.95],
      [25, 180, 0.95], [25, 320, 1.0], [25, 460, 0.9],
      [W - 25, 180, 0.95], [W - 25, 320, 1.05], [W - 25, 460, 0.9],
      [60, 70, 0.7], [W - 60, 70, 0.75],
      [60, H - 70, 0.75], [W - 60, H - 70, 0.7],
    ];
    return (
      <g aria-hidden>
        {/* Arquibancada superior (atrás da reta de cima, fora da pista) */}
        <Grandstand x={300} y={30} w={400} h={36} />
        {/* Bandeiras de patrocinador penduradas acima da arquibancada */}
        <SponsorBunting x={300} y={24} w={400} count={12} />
        {/* Arquibancadas laterais menores */}
        <Grandstand x={20} y={250} w={26} h={120} vertical />
        <Grandstand x={W - 46} y={250} w={26} h={120} vertical />
        {/* Marshal posts nas 4 curvas principais */}
        <MarshalPost cx={95} cy={130} />
        <MarshalPost cx={W - 95} cy={130} flagColor="hsl(0 75% 52%)" />
        <MarshalPost cx={95} cy={H - 130} flagColor="hsl(45 92% 55%)" />
        <MarshalPost cx={W - 95} cy={H - 130} />
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // INFIELD: pit building + torre + paddock + arbustos + árvores pequenas
  return (
    <g aria-hidden>
      {/* Pit building no topo do infield, alinhado horizontalmente */}
      <PitBuilding x={380} y={170} w={240} h={50} doors={6} />
      {/* Torre de controle à esquerda do pit */}
      <ControlTower cx={345} cy={195} />
      {/* Paddock logo abaixo do pit (faixa de boxes) */}
      <Paddock x={380} y={228} w={240} h={20} slots={6} />

      {/* Arbustos espalhados ao redor do lago */}
      <Bush cx={400} cy={310} />
      <Bush cx={620} cy={310} />
      <Bush cx={380} cy={440} />
      <Bush cx={620} cy={440} />
      <Bush cx={300} cy={400} />
      <Bush cx={700} cy={400} />

      {/* Árvores pequenas decorativas */}
      <Tree cx={250} cy={250} scale={0.55} />
      <Tree cx={760} cy={250} scale={0.55} />
      <Tree cx={250} cy={460} scale={0.6} />
      <Tree cx={760} cy={460} scale={0.6} />
    </g>
  );
}
