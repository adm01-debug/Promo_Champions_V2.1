import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Cenário top-down VERTICAL (viewBox 600x1000) com árvores, paddock,
 * pit lane vertical na lateral esquerda do infield e arquibancadas.
 * - layer 'outer': árvores + arquibancadas + marshal posts FORA da pista
 *                  + Cycle 53-58: motorhomes (faixa topo), pit-lane externa (faixa base),
 *                  drones, telão LED, helicóptero de transmissão e pássaros ambientais.
 * - layer 'inner': pit building, torre, paddock, arbustos NO infield
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
 */
function MarshalPost({
  cx, cy, flagColor = 'hsl(28 95% 55%)', yellowFlag = false, delayMs = 0,
}: { cx: number; cy: number; flagColor?: string; yellowFlag?: boolean; delayMs?: number }) {
  const flag = yellowFlag ? 'hsl(45 95% 55%)' : flagColor;
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden style={{ filter: 'drop-shadow(1.5px 2px 1.5px hsl(var(--race-grass-shadow) / 0.55))' }}>
      <circle r={3.5} fill="hsl(28 95% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
      <circle cx={-1.6} cy={-5.5} r={1.4} fill="hsl(20 35% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.4} />
      <rect x={-2.8} y={-4.2} width={2.4} height={3.5} rx={0.6} fill="hsl(210 70% 45%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.4} />
      <rect x={-0.4} y={-12} width={0.9} height={9} fill="hsl(var(--race-checkered-dark))" />
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

/* ============================================================
   CYCLE 53-58: AMBIENT BROADCAST LIFE
   ============================================================ */

/** Helicóptero de transmissão atravessando a faixa superior em loop. */
function BroadcastHelicopter({
  bodyColor = 'hsl(210 75% 50%)',
  y = 0,
  duration = 18,
  delay = 0,
  reverse = false,
  vertical = false,
}: {
  bodyColor?: string;
  y?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  vertical?: boolean;
}) {
  const animName = vertical
    ? 'race-helicopter-cross-vertical'
    : reverse
      ? 'race-helicopter-fly-reverse'
      : 'race-helicopter-fly';
  return (
    <g
      aria-hidden
      transform={vertical ? undefined : `translate(0 ${y})`}
      style={{
        animation: `${animName} ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* sombra projetada no chão */}
      <ellipse cx={6} cy={70} rx={11} ry={3.5} fill="rgba(0,0,0,0.22)" filter="url(#dustBlur)" />
      <g transform="translate(0, 28)">
        {/* fuselagem */}
        <ellipse cx={3} cy={0} rx={9} ry={4.5} fill={bodyColor} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.7} />
        {/* janela */}
        <ellipse cx={7} cy={-0.6} rx={3} ry={2.5} fill="hsl(200 30% 18%)" opacity={0.85} />
        <ellipse cx={6.5} cy={-1.3} rx={1.2} ry={0.6} fill="hsl(0 0% 100%)" opacity={0.45} />
        {/* cauda */}
        <rect x={-12} y={-1} width={11} height={2} rx={1} fill="hsl(var(--race-building-edge))" />
        <circle cx={-12} cy={0} r={1.6} fill="hsl(var(--race-checkered-dark))" opacity={0.7} />
        {/* skids */}
        <line x1={-2} y1={4} x2={9} y2={4} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.6} />
        {/* rotor principal animado */}
        <g style={{ transformOrigin: '3px 0px', animation: 'race-rotor-spin 0.16s linear infinite' }}>
          <ellipse cx={3} cy={-0.5} rx={16} ry={1} fill="hsl(var(--race-checkered-dark))" opacity={0.55} />
        </g>
      </g>
    </g>
  );
}

/** Motorhome (caminhão de equipe) na faixa superior. */
function Motorhome({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden style={{ filter: 'drop-shadow(2px 3px 2.5px hsl(var(--race-grass-shadow) / 0.5))' }}>
      {/* corpo principal */}
      <rect x={0} y={4} width={56} height={26} rx={2.5} fill={color} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
      {/* faixa superior */}
      <rect x={0} y={4} width={56} height={5} rx={2} fill="hsl(0 0% 100%)" opacity={0.85} />
      {/* janelas */}
      <rect x={4} y={11} width={10} height={4.5} rx={0.8} fill="hsl(200 35% 25%)" opacity={0.85} />
      <rect x={17} y={11} width={10} height={4.5} rx={0.8} fill="hsl(200 35% 25%)" opacity={0.85} />
      <rect x={30} y={11} width={10} height={4.5} rx={0.8} fill="hsl(200 35% 25%)" opacity={0.85} />
      <rect x={43} y={11} width={10} height={4.5} rx={0.8} fill="hsl(200 35% 25%)" opacity={0.85} />
      {/* cabine */}
      <rect x={48} y={18} width={8} height={12} rx={1.2} fill="hsl(0 0% 92%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.6} />
      <rect x={49} y={20} width={6} height={4} rx={0.6} fill="hsl(200 35% 25%)" opacity={0.9} />
      {/* rodas */}
      <circle cx={10} cy={31} r={2.3} fill="hsl(var(--race-checkered-dark))" />
      <circle cx={26} cy={31} r={2.3} fill="hsl(var(--race-checkered-dark))" />
      <circle cx={50} cy={31} r={2.3} fill="hsl(var(--race-checkered-dark))" />
      {/* antena parabólica no teto */}
      <line x1={20} y1={4} x2={20} y2={-2} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.7} />
      <ellipse cx={20} cy={-3} rx={3} ry={1.2} fill="hsl(0 0% 95%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} />
      {/* mini bandeirinha */}
      <line x1={36} y1={4} x2={36} y2={-3} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.6} />
      <path d="M36,-3 L41,-2 L36,-1 Z" fill={color} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.4} />
    </g>
  );
}

/** Faixa superior preenchida com 4 motorhomes de equipes. */
function PaddockMotorhomes() {
  const colors = ['hsl(0 75% 52%)', 'hsl(210 75% 52%)', 'hsl(45 92% 55%)', 'hsl(140 65% 45%)'];
  return (
    <g aria-hidden>
      {colors.map((c, i) => (
        <Motorhome key={i} x={50 + i * 130} y={42} color={c} />
      ))}
    </g>
  );
}

/** Pit lane externa estilizada na faixa inferior (6 boxes). */
function ExternalPitLane() {
  const baseY = 935;
  const colors = [
    'hsl(0 75% 52%)', 'hsl(210 75% 52%)', 'hsl(45 92% 55%)',
    'hsl(140 65% 45%)', 'hsl(280 55% 55%)', 'hsl(28 95% 55%)',
  ];
  return (
    <g aria-hidden style={{ filter: 'drop-shadow(2px 2px 2px hsl(var(--race-grass-shadow) / 0.45))' }}>
      {/* linha do asfalto da pit lane */}
      <rect x={50} y={baseY} width={500} height={6} fill="hsl(var(--race-asphalt))" opacity={0.85} />
      <line x1={50} y1={baseY + 3} x2={550} y2={baseY + 3} stroke="hsl(0 0% 100%)" strokeWidth={0.6} strokeDasharray="5 4" opacity={0.8} />
      {colors.map((c, i) => {
        const bx = 60 + i * 78;
        const by = baseY + 8;
        return (
          <g key={i}>
            {/* faixa colorida (teto do box) */}
            <rect x={bx} y={by} width={60} height={4} fill={c} opacity={0.95} />
            {/* corpo do box */}
            <rect x={bx} y={by + 4} width={60} height={20} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={0.7} />
            {/* placa numerada */}
            <rect x={bx + 2} y={by + 6} width={12} height={8} rx={1} fill="hsl(var(--race-asphalt))" />
            <text x={bx + 8} y={by + 12} textAnchor="middle" fontSize={6.5} fontWeight={900}
              fill="hsl(0 0% 100%)" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {i + 1}
            </text>
            {/* pneus empilhados */}
            <circle cx={bx + 22} cy={by + 14} r={2.2} fill="hsl(var(--race-checkered-dark))" />
            <circle cx={bx + 22} cy={by + 10} r={2.2} fill="hsl(var(--race-checkered-dark))" />
            <circle cx={bx + 27} cy={by + 14} r={2.2} fill="hsl(var(--race-checkered-dark))" />
            {/* mecânicos minimalistas */}
            <circle cx={bx + 38} cy={by + 14} r={1.3} fill="hsl(20 35% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
            <rect x={bx + 36.7} y={by + 15} width={2.6} height={3.5} rx={0.5} fill={c} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
            <circle cx={bx + 46} cy={by + 14} r={1.3} fill="hsl(20 35% 55%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
            <rect x={bx + 44.7} y={by + 15} width={2.6} height={3.5} rx={0.5} fill={c} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
            {/* porta */}
            <rect x={bx + 50} y={by + 8} width={8} height={14} fill="hsl(var(--race-asphalt))" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
}

/** Drone hexacoptero minimalista com luz REC piscante e órbita lenta. */
function FilmingDrone({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden>
      <g style={{ animation: `race-drone-orbit 6s linear infinite ${delay}s`, transformOrigin: '0 0' }}>
        {/* corpo */}
        <circle r={1.6} fill="hsl(var(--race-checkered-dark))" />
        {/* 4 braços */}
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1={0} y1={0} x2={3.5} y2={0} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.5} />
            {/* hélice animada */}
            <ellipse
              cx={3.5} cy={0} rx={2.2} ry={0.4}
              fill="hsl(var(--race-asphalt-edge))"
              opacity={0.7}
              style={{ transformOrigin: '3.5px 0', animation: 'race-rotor-spin 0.12s linear infinite' }}
            />
          </g>
        ))}
        {/* luz REC piscando */}
        <circle cx={0} cy={2.4} r={0.7} fill="hsl(0 90% 55%)" style={{ animation: 'race-led-blink-rec 0.9s ease-in-out infinite' }} />
      </g>
    </g>
  );
}

/** Telão LED na faixa inferior, mostrando líder + gap. */
function LedScoreboard({ leaderName, leaderGap }: { leaderName?: string; leaderGap?: string }) {
  const text = leaderName ? `P1 ${leaderName.split(' ')[0].toUpperCase()}${leaderGap ? `  ${leaderGap}` : ''}` : 'LIVE BROADCAST';
  return (
    <g transform="translate(220 920)" aria-hidden style={{ filter: 'drop-shadow(2px 3px 3px hsl(var(--race-grass-shadow) / 0.55))' }}>
      {/* suportes */}
      <rect x={6}  y={12} width={2.5} height={10} fill="hsl(var(--race-checkered-dark))" />
      <rect x={151} y={12} width={2.5} height={10} fill="hsl(var(--race-checkered-dark))" />
      {/* moldura do telão */}
      <rect x={0} y={0} width={160} height={14} rx={1.5} fill="hsl(var(--race-checkered-dark))" />
      {/* área LED preta */}
      <rect x={2} y={2} width={156} height={10} fill="hsl(0 0% 5%)" />
      {/* matriz de LEDs (pontos sutis para textura) */}
      <pattern id="ledMatrix" x={0} y={0} width={2} height={2} patternUnits="userSpaceOnUse">
        <circle cx={1} cy={1} r={0.18} fill="hsl(140 80% 50%)" opacity={0.18} />
      </pattern>
      <rect x={2} y={2} width={156} height={10} fill="url(#ledMatrix)" />
      {/* texto pixelado */}
      <text
        x={80} y={9.5} textAnchor="middle"
        fontSize={7.2} fontWeight={900}
        fill="hsl(45 100% 60%)"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.12em',
          animation: 'race-led-flicker 4.5s ease-in-out infinite',
        }}
      >
        {text}
      </text>
    </g>
  );
}

/** Bando de pássaros (V-shapes) cruzando a tela em diagonal. */
function BirdFlock({ y, delay = 0, reverse = false }: { y: number; delay?: number; reverse?: boolean }) {
  const flap = (i: number) => ({
    transformOrigin: 'center',
    animation: `race-bird-flap ${0.35 + i * 0.05}s ease-in-out infinite`,
  });
  return (
    <g
      aria-hidden
      style={{
        animation: `race-bird-fly 25s linear infinite ${delay}s`,
        transform: reverse ? 'scaleX(-1) translateX(-600px)' : undefined,
      }}
    >
      <g transform={`translate(0 ${y})`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const bx = i * 14;
          const by = (i % 2) * 4;
          return (
            <g key={i} transform={`translate(${bx} ${by})`} style={flap(i)}>
              <path
                d="M-3,0 L0,-1.5 L3,0"
                fill="none"
                stroke="hsl(var(--race-checkered-dark))"
                strokeWidth={0.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/** Cluster de torcedores na grama, com animação de pulo escalonado (efeito ola). */
function CrowdCluster({
  cx, cy, count = 8, seed = 0,
}: { cx: number; cy: number; count?: number; seed?: number }) {
  const palette = [
    'hsl(0 75% 52%)', 'hsl(210 75% 52%)', 'hsl(45 92% 55%)',
    'hsl(140 65% 45%)', 'hsl(0 0% 98%)', 'hsl(280 55% 55%)',
  ];
  const fans = Array.from({ length: count }).map((_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = col * 7 + ((row % 2) * 3.5);
    const y = row * 9;
    const color = palette[(i + seed) % palette.length];
    const delay = ((i * 137 + seed * 53) % 600) / 1000; // 0-0.6s pseudo-random
    return { x, y, color, delay };
  });
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden style={{ filter: 'drop-shadow(1px 1.5px 1px hsl(var(--race-grass-shadow) / 0.5))' }}>
      {fans.map((f, i) => (
        <g
          key={i}
          transform={`translate(${f.x} ${f.y})`}
          style={{
            animation: `race-crowd-jump 0.6s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
            transformBox: 'fill-box',
            transformOrigin: 'center bottom',
          }}
        >
          {/* corpo (camiseta colorida) */}
          <rect x={-2} y={-1} width={4} height={6} rx={0.8} fill={f.color} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
          {/* cabeça */}
          <circle cx={0} cy={-3} r={1.6} fill="hsl(20 35% 60%)" stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.3} />
        </g>
      ))}
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
            <rect x={laneX + laneW} y={gy + 1} width={4} height={garageH - 2} fill={c} opacity={0.92} />
            <rect x={laneX + laneW + 4} y={gy + 1} width={14} height={garageH - 2} fill="hsl(var(--race-building))" stroke="hsl(var(--race-building-edge))" strokeWidth={0.7} />
            <rect x={laneX + laneW + 7} y={gy + 4} width={9} height={garageH - 8} fill="hsl(var(--race-asphalt))" opacity={0.7} />
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
  leaderName,
  leaderGap,
}: {
  layer: 'outer' | 'inner';
  yellowFlag?: boolean;
  waveTrigger?: number;
  leaderName?: string;
  leaderGap?: string;
}) {
  const W = TRACK_VIEWBOX.width; // 600
  const H = TRACK_VIEWBOX.height; // 1000

  if (layer === 'outer') {
    const trees: Array<[number, number, number]> = [
      [40, 40, 1.05], [W - 40, 40, 1.0],
      [40, H - 40, 1.1], [W - 40, H - 40, 1.0],
      [25, 200, 0.95], [25, 360, 1.0], [25, 520, 0.95], [25, 680, 1.0], [25, 840, 0.9],
      [W - 25, 200, 0.95], [W - 25, 360, 1.05], [W - 25, 520, 0.9], [W - 25, 680, 1.0], [W - 25, 840, 0.95],
    ];
    return (
      <g aria-hidden>
        {/* CICLO 53-58: Motorhomes na faixa superior (paddock de transmissão) */}
        <PaddockMotorhomes />

        <Grandstand x={200} y={30} w={200} h={36} waveTrigger={waveTrigger} />
        <SponsorBunting x={200} y={24} w={200} count={10} />
        <Grandstand x={200} y={H - 66} w={200} h={36} waveTrigger={waveTrigger} />
        <Grandstand x={20} y={420} w={26} h={160} vertical waveTrigger={waveTrigger} />
        <Grandstand x={W - 46} y={420} w={26} h={160} vertical waveTrigger={waveTrigger} />

        {/* CICLO 53-58: Telão LED acima da grandstand inferior */}
        <LedScoreboard leaderName={leaderName} leaderGap={leaderGap} />

        {/* CICLO 53-58: Pit lane externa estilizada na faixa inferior */}
        <ExternalPitLane />

        {/* Marshal posts */}
        <MarshalPost cx={130}     cy={130}     yellowFlag={yellowFlag} delayMs={0}   />
        <MarshalPost cx={W - 130} cy={130}     yellowFlag={yellowFlag} delayMs={120} flagColor="hsl(0 75% 52%)" />
        <MarshalPost cx={130}     cy={H - 130} yellowFlag={yellowFlag} delayMs={240} flagColor="hsl(45 92% 55%)" />
        <MarshalPost cx={W - 130} cy={H - 130} yellowFlag={yellowFlag} delayMs={360} />

        {trees.map(([x, y, s], i) => (
          <Tree key={i} cx={x} cy={y} scale={s} />
        ))}

        {/* CICLO 53-58: Helicóptero superior azul */}
        <BroadcastHelicopter bodyColor="hsl(210 75% 50%)" y={0} duration={18} />

        {/* CICLO 53-58: Bandos de pássaros ambientais */}
        <BirdFlock y={150} delay={0} />
        <BirdFlock y={870} delay={12} reverse />

        {/* Torcedores nas bordas (grama) — 4 clusters */}
        <CrowdCluster cx={60}  cy={300} count={10} seed={1} />
        <CrowdCluster cx={W - 90} cy={600} count={10} seed={3} />
        <CrowdCluster cx={210} cy={90}  count={8}  seed={5} />
        <CrowdCluster cx={330} cy={H - 110} count={8} seed={7} />
      </g>
    );
  }

  // INFIELD
  return (
    <g aria-hidden>
      <PitLane />
      <PitBuilding x={200} y={170} w={200} h={44} doors={6} />
      <ControlTower cx={420} cy={192} />
      <Paddock x={440} y={420} w={20} h={160} slots={6} />

      <Bush cx={200} cy={490} />
      <Bush cx={400} cy={490} />
      <Bush cx={200} cy={640} />
      <Bush cx={400} cy={640} />
      <Bush cx={300} cy={460} />
      <Bush cx={300} cy={680} />

      <Tree cx={180} cy={780} scale={0.55} />
      <Tree cx={420} cy={780} scale={0.55} />
      <Tree cx={180} cy={300} scale={0.55} />
      <Tree cx={420} cy={300} scale={0.55} />

      {/* Helicópteros renderizados por cima da pista */}
      <BroadcastHelicopter bodyColor="hsl(140 70% 45%)" duration={28} delay={2} vertical />
      <BroadcastHelicopter bodyColor="hsl(0 78% 52%)" y={970} duration={22} delay={4} reverse />
    </g>
  );
}
