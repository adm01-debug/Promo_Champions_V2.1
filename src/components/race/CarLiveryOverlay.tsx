import type { LiveryPattern } from './raceColors';

interface CarLiveryOverlayProps {
  pattern: LiveryPattern;
  bodyW: number;
  bodyH: number;
  bodyR: number;
  primary: string;
  secondary: string;
  accent?: string;
  /** ID único p/ clipPath (evita colisão entre múltiplos carros). */
  uid: string;
}

/**
 * Overlay de livery (pintura) renderizado sobre o chassi do carro.
 * Usa clipPath p/ recortar no formato do corpo. Suporta padrões
 * temáticos (chamas, listras, dots) e bandeiras Pride (rainbow, trans, bi).
 */
export function CarLiveryOverlay({
  pattern,
  bodyW,
  bodyH,
  bodyR,
  primary,
  secondary,
  accent,
  uid,
}: CarLiveryOverlayProps) {
  if (pattern === 'solid') return null;

  const clipId = `livery-clip-${uid}`;
  const x = -bodyW / 2;
  const y = -bodyH / 2;

  return (
    <g pointerEvents="none" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={bodyW} height={bodyH} rx={bodyR} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {pattern === 'pride-rainbow' && <PrideRainbow x={x} y={y} w={bodyW} h={bodyH} />}
        {pattern === 'pride-rainbow-diagonal' && <PrideRainbowDiagonal x={x} y={y} w={bodyW} h={bodyH} />}
        {pattern === 'pride-trans' && <PrideTrans x={x} y={y} w={bodyW} h={bodyH} />}
        {pattern === 'pride-bi' && <PrideBi x={x} y={y} w={bodyW} h={bodyH} />}
        {pattern === 'flames' && <Flames x={x} y={y} w={bodyW} h={bodyH} accent={accent ?? '#fbbf24'} secondary={secondary} />}
        {pattern === 'stripes' && <Stripes x={x} y={y} w={bodyW} h={bodyH} accent={accent ?? secondary} />}
        {pattern === 'checkers' && <Checkers x={x} y={y} w={bodyW} h={bodyH} secondary={secondary} />}
        {pattern === 'dots' && <Dots x={x} y={y} w={bodyW} h={bodyH} accent={accent ?? secondary} />}
      </g>
    </g>
  );
}

/* ===== Padrões ===== */

function PrideRainbow({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const colors = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];
  const stripeH = h / colors.length;
  return (
    <g opacity={0.92}>
      {colors.map((c, i) => (
        <rect key={c} x={x} y={y + i * stripeH} width={w} height={stripeH + 0.3} fill={c} />
      ))}
    </g>
  );
}

function PrideRainbowDiagonal({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const colors = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];
  // Listras diagonais finas e repetidas cobrindo o corpo (rotacionadas -25°)
  const stripeW = 3;
  const gap = 2;
  const period = stripeW + gap;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const totalW = w * 2;
  const count = Math.ceil(totalW / period);
  return (
    <g opacity={0.95} transform={`rotate(-25 ${cx} ${cy})`}>
      {Array.from({ length: count }).map((_, i) => (
        <rect
          key={i}
          x={x - w * 0.5 + i * period}
          y={y - h * 0.5}
          width={stripeW}
          height={h * 2}
          fill={colors[i % colors.length]}
        />
      ))}
    </g>
  );
}

function PrideTrans({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const colors = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'];
  const stripeH = h / colors.length;
  return (
    <g opacity={0.95}>
      {colors.map((c, i) => (
        <rect key={`${c}-${i}`} x={x} y={y + i * stripeH} width={w} height={stripeH + 0.3} fill={c} />
      ))}
    </g>
  );
}

function PrideBi({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const colors = [
    { c: '#D60270', frac: 0.4 },
    { c: '#9B4F96', frac: 0.2 },
    { c: '#0038A8', frac: 0.4 },
  ];
  let cy = y;
  return (
    <g opacity={0.95}>
      {colors.map((s, i) => {
        const sh = h * s.frac;
        const r = <rect key={i} x={x} y={cy} width={w} height={sh + 0.3} fill={s.c} />;
        cy += sh;
        return r;
      })}
    </g>
  );
}

function Flames({ x, y, w, h, accent, secondary }: { x: number; y: number; w: number; h: number; accent: string; secondary: string }) {
  // Chamas saindo da traseira (esquerda)
  const points: string[] = [];
  const flameLen = w * 0.55;
  points.push(`${x},${y + h}`);
  points.push(`${x},${y}`);
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const px = x + flameLen * t;
    const py = y + (i % 2 === 0 ? h * 0.15 : h * 0.45);
    points.push(`${px},${py}`);
  }
  points.push(`${x + flameLen},${y + h * 0.5}`);
  for (let i = 6; i >= 0; i--) {
    const t = i / 6;
    const px = x + flameLen * t;
    const py = y + h - (i % 2 === 0 ? h * 0.15 : h * 0.45);
    points.push(`${px},${py}`);
  }
  return (
    <g>
      <polygon points={points.join(' ')} fill={accent} opacity={0.9} />
      <polygon
        points={`${x},${y + h * 0.3} ${x + flameLen * 0.6},${y + h * 0.4} ${x + flameLen * 0.4},${y + h * 0.5} ${x + flameLen * 0.6},${y + h * 0.6} ${x},${y + h * 0.7}`}
        fill={secondary}
        opacity={0.55}
      />
    </g>
  );
}

function Stripes({ x, y, w, h, accent }: { x: number; y: number; w: number; h: number; accent: string }) {
  const stripeW = 2.2;
  const gap = w * 0.18;
  return (
    <g opacity={0.85}>
      <rect x={x + gap} y={y} width={stripeW} height={h} fill={accent} />
      <rect x={x + gap + stripeW + 1.2} y={y} width={stripeW} height={h} fill={accent} />
    </g>
  );
}

function Checkers({ x, y, w, h, secondary }: { x: number; y: number; w: number; h: number; secondary: string }) {
  const cell = 3;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const tiles = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if ((i + j) % 2 === 0) {
        tiles.push(
          <rect key={`${i}-${j}`} x={x + i * cell} y={y + j * cell} width={cell} height={cell} fill={secondary} opacity={0.85} />,
        );
      }
    }
  }
  return <g>{tiles}</g>;
}

function Dots({ x, y, w, h, accent }: { x: number; y: number; w: number; h: number; accent: string }) {
  const dots = [];
  const r = 1.6;
  const stepX = 5;
  const stepY = 4.5;
  for (let i = 0; i * stepX < w; i++) {
    for (let j = 0; j * stepY < h; j++) {
      const cx = x + 3 + i * stepX + (j % 2 === 0 ? 0 : stepX / 2);
      const cy = y + 3 + j * stepY;
      if (cx < x + w - 2 && cy < y + h - 1) {
        dots.push(<circle key={`${i}-${j}`} cx={cx} cy={cy} r={r} fill={accent} opacity={0.9} />);
      }
    }
  }
  return <g>{dots}</g>;
}
