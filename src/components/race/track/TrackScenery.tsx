import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down VERTICAL (viewBox 600x1000) com árvores, paddock,
 * pit lane vertical na lateral esquerda do infield e arquibancadas.
 * - layer 'outer': árvores + arquibancadas + marshal posts FORA da pista
 * - layer 'inner': pit building, torre, paddock, arbustos e helicóptero NO infield
 */

interface TreeProps { cx: number; cy: number; scale?: number; }

function Tree({ cx, cy, scale = 1 }: TreeProps) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} style={{ filter: 'drop-shadow(2px 3px 2px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <circle r={16} fill="hsl(var(--race-tree-mid))" />
      <circle cx={-11} cy={-4} r={11} fill="hsl(var(--race-tree-dark))" />
      <circle cx={11} cy={-2} r={12} fill="hsl(var(--race-tree-light))" />
      <circle cx={-7} cy={9} r={10} fill="hsl(var(--race-tree-dark))" />
      <circle cx={9} cy={8} r={11} fill="hsl(var(--race-tree-light))" />
      <circle cx={0} cy={-11} r={10} fill="hsl(var(--race-tree-mid))" />
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

function PitBuilding({ x, y, w, h, doors = 5 }: { x: number; y: number; w: number; h: number; doors?: number }) {
  const doorW = (w - 14) / doors - 4;
  return (
    <g transform={`translate(${x} ${y})`} style={{ filter: 'drop-shadow(3px 4px 3px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <rect width={w} height={h} rx={4} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1.6} />
      <rect width={w} height={8} rx={3} fill="hsl(var(--race-curb-b))" />
      <rect y={8} width={w} height={2} fill="hsl(var(--race-checkered-dark))" opacity={0.4} />
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

/** Paddock vertical: boxes empilhados verticalmente. */
function Paddock({ x, y, w, h, slots = 6 }: { x: number; y: number; w: number; h: number; slots?: number }) {
  const slotH = h / slots;
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <rect width={w} height={h} fill="hsl(var(--race-asphalt))" opacity={0.85} stroke="hsl(var(--race-asphalt-edge))" strokeWidth={0.8} />
      {Array.from({ length: slots - 1 }).map((_, i) => (
        <line key={i} x1={2} y1={(i + 1) * slotH} x2={w - 2} y2={(i + 1) * slotH}
          stroke="hsl(var(--race-asphalt-edge))" strokeWidth={1} opacity={0.85} strokeDasharray="2 2" />
      ))}
      {Array.from({ length: slots }).map((_, i) => (
        <text key={`n${i}`} x={w / 2} y={i * slotH + slotH / 2 + 2} textAnchor="middle"
          fontSize={6} fontWeight={800} fill="hsl(var(--race-asphalt-edge))" opacity={0.7}
          style={{ fontFamily: 'system-ui, sans-serif' }}>{i + 1}</text>
      ))}
    </g>
  );
}

/**
 * Marshal humanoide minimalista segurando bandeira que se agita.
 * Quando `yellowFlag` true, troca a cor da bandeira para amarelo F1.
 * Cada marshal tem `delayMs` para dessincronizar levemente a onda das bandeiras.
 */
function MarshalPost({
  cx, cy, flagColor = 'hsl(28 95% 55%)', yellowFlag = false, delayMs = 0,
}: { cx: number; cy: number; flagColor?: string; yellowFlag?: boolean; delayMs?: number }) {
  const flag = yellowFlag ? 'hsl(45 95% 55%)' : flagColor;
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden style={{ filter: 'drop-shadow(1.5px 2px 1.5px hsl(var(--race-grass-shadow) / 0.55))' }}>
      {/* base/post pintado */}
      <circle r={3.5} fill="hsl(28 95% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
      {/* humanoide minimalista (3px): cabeça + tronco */}
      <circle cx={-1.6} cy={-5.5} r={1.4} fill="hsl(20 35% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.4} />
      <rect x={-2.8} y={-4.2} width={2.4} height={3.5} rx={0.6} fill="hsl(210 70% 45%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.4} />
      {/* mastro */}
      <rect x={-0.4} y={-12} width={0.9} height={9} fill="hsl(var(--race-checkered-dark))" />
      {/* bandeira animada (origem na ponta superior do mastro) */}
      <g
        style={{
          transformOrigin: '0px -12px',
          transformBox: 'fill-box',
          animation: `race-marshal-flag-wave 0.9s ease-in-out infinite ${delayMs}ms`,
        }}
      >
        <path
          d="M0.6,-12 L7.5,-10 L6.4,-8.2 L7.6,-6.4 L0.6,-7.5 Z"
          fill={flag}
          stroke="hsl(var(--race-checkered-dark))"
          strokeWidth={0.5}
        />
      </g>
      <circle r={1} fill="hsl(0 0% 100%)" opacity={0.6} />
    </g>
  );
}

/** Bandeiras de patrocinador horizontais (acima da arquibancada superior). */
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

function Grandstand({
  x, y, w, h, vertical = false, waveTrigger = 0,
}: { x: number; y: number; w: number; h: number; vertical?: boolean; waveTrigger?: number }) {
  const stripes = vertical ? Math.floor(h / 4) : Math.floor(w / 4);
  const palette = ['hsl(0 70% 55%)', 'hsl(45 90% 58%)', 'hsl(210 70% 55%)', 'hsl(280 50% 58%)', 'hsl(0 0% 95%)'];
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden style={{ filter: 'drop-shadow(2px 2px 2px hsl(var(--race-grass-shadow) / 0.5))' }}>
      <rect width={w} height={h} rx={3} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={1} />
      <rect width={vertical ? 4 : w} height={vertical ? h : 4} fill="hsl(var(--race-curb-b))" rx={2} />
      {Array.from({ length: stripes }).map((_, i) => {
        const c = palette[i % palette.length];
        // La Ola: cada faixa anima sequencialmente da esquerda para a direita
        const delay = (i / Math.max(1, stripes)) * 1.2;
        const animStyle = waveTrigger > 0
          ? { animation: `race-la-ola-wave 1.2s ease-in-out ${delay}s 1`, transformBox: 'fill-box' as const, transformOrigin: 'center bottom' }
          : undefined;
        return vertical ? (
          <rect key={`${waveTrigger}-${i}`} x={6} y={2 + i * 4} width={w - 10} height={2.5} fill={c} opacity={0.85} style={animStyle} />
        ) : (
          <rect key={`${waveTrigger}-${i}`} x={2 + i * 4} y={6} width={2.5} height={h - 10} fill={c} opacity={0.85} style={animStyle} />
        );
      })}
    </g>
  );
}

/** Helicóptero de transmissão sobrevoando o circuito em loop lento. Centro em (300, 500). */
function BroadcastHelicopter() {
  return (
    <g aria-hidden>
      <g style={{ animation: 'race-heli-orbit 28s linear infinite', transformOrigin: '300px 500px' }}>
        <g transform="translate(220 0)">
          <ellipse cx={6} cy={20} rx={9} ry={3} fill="rgba(0,0,0,0.22)" filter="url(#dustBlur)" />
        </g>
      </g>
      <g style={{ animation: 'race-heli-orbit 28s linear infinite', transformOrigin: '300px 500px' }}>
        <g transform="translate(220 0)">
          <rect x={-12} y={-1.2} width={14} height={2.4} rx={1} fill="hsl(var(--race-building-edge))" />
          <ellipse cx={3} cy={0} rx={9} ry={5} fill="hsl(210 75% 50%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
          <ellipse cx={7} cy={-0.8} rx={3.5} ry={3} fill="hsl(200 30% 18%)" opacity={0.85} />
          <ellipse cx={6.5} cy={-1.5} rx={1.5} ry={0.7} fill="hsl(0 0% 100%)" opacity={0.45} />
          <line x1={-2} y1={4.5} x2={9} y2={4.5} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.7} />
          <g style={{ animation: 'race-heli-rotor 0.18s linear infinite', transformOrigin: '3px 0px' }}>
            <ellipse cx={3} cy={0} rx={18} ry={1.2} fill="hsl(var(--race-checkered-dark))" opacity={0.55} />
            <ellipse cx={3} cy={0} rx={1.2} ry={18} fill="hsl(var(--race-checkered-dark))" opacity={0.25} />
          </g>
          <circle cx={-12} cy={0} r={1.8} fill="hsl(var(--race-checkered-dark))" opacity={0.6} />
        </g>
      </g>
    </g>
  );
}

/** Pit Lane VERTICAL: faixa cinza paralela à reta esquerda, com 6 garagens empilhadas. */
function PitLane() {
  const startY = 240, endY = 760, laneX = 130, laneW = 16;
  const h = endY - startY;
  const garageColors = [
    'hsl(0 75% 52%)', 'hsl(210 75% 52%)', 'hsl(45 92% 55%)',
    'hsl(140 65% 45%)', 'hsl(280 55% 55%)', 'hsl(28 95% 55%)',
  ];
  const garages = 6;
  const garageH = h / garages;
  return (
    <g aria-hidden style={{ filter: 'drop-shadow(2px 3px 2px hsl(var(--race-grass-shadow) / 0.4))' }}>
      <rect x={laneX} y={startY} width={laneW} height={h} fill="url(#pitLaneGrad)" stroke="hsl(var(--race-asphalt-edge))" strokeWidth={0.6} opacity={0.92} />
      <line x1={laneX} y1={startY} x2={laneX} y2={endY} stroke="hsl(var(--race-asphalt-edge))" strokeWidth={1.2} strokeDasharray="6 5" opacity={0.85} />
      {Array.from({ length: garages }).map((_, i) => {
        const gy = startY + i * garageH;
        const c = garageColors[i];
        return (
          <g key={i}>
            {/* faixa colorida (teto da garagem) à direita da pit lane */}
            <rect x={laneX + laneW} y={gy + 1} width={4} height={garageH - 2} fill={c} opacity={0.92} />
            {/* corpo da garagem */}
            <rect x={laneX + laneW + 4} y={gy + 1} width={14} height={garageH - 2} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={0.7} />
            {/* porta */}
            <rect x={laneX + laneW + 7} y={gy + 4} width={9} height={garageH - 8} fill="hsl(var(--race-asphalt))" opacity={0.7} />
            {/* número */}
            <text
              x={laneX + laneW + 11.5}
              y={gy + garageH / 2 + 2}
              textAnchor="middle"
              fontSize={6.5}
              fontWeight={900}
              fill="hsl(var(--race-asphalt-edge))"
              opacity={0.95}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              P{i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function TrackScenery({
  layer,
  yellowFlag = false,
  waveTrigger = 0,
}: { layer: 'outer' | 'inner'; yellowFlag?: boolean; waveTrigger?: number }) {
  const W = TRACK_VIEWBOX.width; // 600
  const H = TRACK_VIEWBOX.height; // 1000

  if (layer === 'outer') {
    const trees: Array<[number, number, number]> = [
      [40, 40, 1.05], [120, 25, 0.85], [W - 40, 40, 1.0], [W - 120, 25, 0.9],
      [40, H - 40, 1.1], [120, H - 28, 0.9], [W - 40, H - 40, 1.0], [W - 120, H - 28, 0.95],
      [25, 200, 0.95], [25, 360, 1.0], [25, 520, 0.95], [25, 680, 1.0], [25, 840, 0.9],
      [W - 25, 200, 0.95], [W - 25, 360, 1.05], [W - 25, 520, 0.9], [W - 25, 680, 1.0], [W - 25, 840, 0.95],
      [60, 75, 0.7], [W - 60, 75, 0.75],
      [60, H - 75, 0.75], [W - 60, H - 75, 0.7],
    ];
    return (
      <g aria-hidden>
        <Grandstand x={200} y={30} w={200} h={36} waveTrigger={waveTrigger} />
        <SponsorBunting x={200} y={24} w={200} count={10} />
        <Grandstand x={200} y={H - 66} w={200} h={36} waveTrigger={waveTrigger} />
        <Grandstand x={20} y={420} w={26} h={160} vertical waveTrigger={waveTrigger} />
        <Grandstand x={W - 46} y={420} w={26} h={160} vertical waveTrigger={waveTrigger} />
        {/* Marshal posts: trocam para amarelo durante yellowFlag, com delays escalonados */}
        <MarshalPost cx={130}     cy={130}     yellowFlag={yellowFlag} delayMs={0}   />
        <MarshalPost cx={W - 130} cy={130}     yellowFlag={yellowFlag} delayMs={120} flagColor="hsl(0 75% 52%)" />
        <MarshalPost cx={130}     cy={H - 130} yellowFlag={yellowFlag} delayMs={240} flagColor="hsl(45 92% 55%)" />
        <MarshalPost cx={W - 130} cy={H - 130} yellowFlag={yellowFlag} delayMs={360} />
        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}
      </g>
    );
  }

  // INFIELD: pit lane vertical (lateral esquerda) + pit building + torre + paddock + arbustos + helicóptero
  return (
    <g aria-hidden>
      {/* Pit lane vertical na lateral esquerda do infield */}
      <PitLane />
      {/* Pit building horizontal no topo do infield */}
      <PitBuilding x={200} y={170} w={200} h={44} doors={6} />
      {/* Torre de controle à direita do pit */}
      <ControlTower cx={420} cy={192} />
      {/* Paddock vertical à direita do infield (boxes empilhados) */}
      <Paddock x={440} y={420} w={20} h={160} slots={6} />

      {/* Arbustos espalhados ao redor do lago */}
      <Bush cx={200} cy={490} />
      <Bush cx={400} cy={490} />
      <Bush cx={200} cy={640} />
      <Bush cx={400} cy={640} />
      <Bush cx={300} cy={460} />
      <Bush cx={300} cy={680} />

      {/* Árvores pequenas decorativas */}
      <Tree cx={180} cy={780} scale={0.55} />
      <Tree cx={420} cy={780} scale={0.55} />
      <Tree cx={180} cy={300} scale={0.55} />
      <Tree cx={420} cy={300} scale={0.55} />

      {/* Helicóptero de transmissão sobrevoando o circuito */}
      <BroadcastHelicopter />
    </g>
  );
}
