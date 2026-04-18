// Pista vertical — circuito fechado em viewBox 600x1000 (retrato).
// Path SVG cúbico amostrado em uma lookup table para posicionar carros por progresso 0..1.

// Viewbox total estendido em ~33% na vertical para que a pista (1000px) ocupe
// apenas ~75% da área renderizada — o restante (333px) é preenchido com grama
// extra acima/abaixo, melhorando legibilidade dos carros sem distorcer o path.
export const TRACK_INNER_HEIGHT = 1000;
export const TRACK_OFFSET_Y = 166; // (1333 - 1000) / 2 ≈ centralizado
export const TRACK_VIEWBOX = { width: 600, height: 1333 };

// Oval estendido VERTICAL com 1 chicane suave na reta da direita — estilo Mario Circuit / kart pro.
// Largura constante, curvas com arcos amplos, sem retornos serpentinos.
// Sentido horário: largada no topo da reta esquerda, descendo. Linha de chegada horizontal no topo.
// viewBox 600x1000. Margens generosas (~95px laterais, ~95px topo/base).
export const TRACK_PATH_D = `
M 220 95
L 380 95
C 455 95, 505 145, 505 220
L 505 420
C 505 445, 515 460, 530 475
C 545 490, 555 505, 555 530
C 555 555, 545 570, 530 585
C 515 600, 505 615, 505 640
L 505 780
C 505 855, 455 905, 380 905
L 220 905
C 145 905, 95 855, 95 780
L 95 220
C 95 145, 145 95, 220 95
Z
`.trim();

export interface TrackPosition {
  x: number;
  y: number;
  rotation: number; // graus, tangente
}

// ---------- Parser mínimo + amostragem De Casteljau ----------
interface Point { x: number; y: number; }

function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const uu = u * u, uuu = uu * u;
  const tt = t * t, ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

function parsePath(d: string): Point[] {
  // tokens: comandos (letras) + números (com sinal/decimal/exp)
  const tokens = d.match(/[MCLZmclz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const cmds: Array<{ cmd: string; args: number[] }> = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[A-Za-z]/.test(t)) {
      const cmd = t;
      i++;
      const argCount = cmd === 'M' || cmd === 'L' ? 2 : cmd === 'C' ? 6 : 0;
      const args: number[] = [];
      for (let k = 0; k < argCount; k++) args.push(parseFloat(tokens[i++]));
      cmds.push({ cmd, args });
    } else {
      i++;
    }
  }

  const pts: Point[] = [];
  let cur: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  const SEG = 40; // amostras por segmento cúbico

  for (const { cmd, args } of cmds) {
    if (cmd === 'M') {
      cur = { x: args[0], y: args[1] };
      start = cur;
      pts.push(cur);
    } else if (cmd === 'L') {
      const next = { x: args[0], y: args[1] };
      for (let s = 1; s <= SEG; s++) {
        const t = s / SEG;
        pts.push({ x: cur.x + (next.x - cur.x) * t, y: cur.y + (next.y - cur.y) * t });
      }
      cur = next;
    } else if (cmd === 'C') {
      const p1 = { x: args[0], y: args[1] };
      const p2 = { x: args[2], y: args[3] };
      const p3 = { x: args[4], y: args[5] };
      for (let s = 1; s <= SEG; s++) {
        pts.push(cubicPoint(cur, p1, p2, p3, s / SEG));
      }
      cur = p3;
    } else if (cmd === 'Z' || cmd === 'z') {
      // fecha: liga cur → start linearmente
      for (let s = 1; s <= SEG; s++) {
        const t = s / SEG;
        pts.push({ x: cur.x + (start.x - cur.x) * t, y: cur.y + (start.y - cur.y) * t });
      }
      cur = start;
    }
  }
  return pts;
}

// Reamostragem por arc-length para velocidade visual constante
function resampleByLength(raw: Point[], n: number): Point[] {
  const cum: number[] = [0];
  for (let k = 1; k < raw.length; k++) {
    const dx = raw[k].x - raw[k - 1].x;
    const dy = raw[k].y - raw[k - 1].y;
    cum.push(cum[k - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1];
  const out: Point[] = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    while (j < cum.length - 1 && cum[j + 1] < target) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const t = (target - cum[j]) / span;
    out.push({
      x: raw[j].x + (raw[j + 1].x - raw[j].x) * t,
      y: raw[j].y + (raw[j + 1].y - raw[j].y) * t,
    });
  }
  return out;
}

const RAW_POINTS = parsePath(TRACK_PATH_D);
const TRACK_POINTS = resampleByLength(RAW_POINTS, 400);

/**
 * Mapeia progresso 0..1 para posição na pista serpenteante.
 * laneOffset desloca perpendicularmente (positivo = "fora", negativo = "dentro").
 */
export function getPositionOnTrack(progress: number, laneOffset = 0): TrackPosition {
  const p = ((progress % 1) + 1) % 1;
  const f = p * TRACK_POINTS.length;
  const idx = Math.floor(f) % TRACK_POINTS.length;
  const next = (idx + 1) % TRACK_POINTS.length;
  const a = TRACK_POINTS[idx];
  const b = TRACK_POINTS[next];

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // normal perpendicular (gira 90°)
  const nx = -dy / len;
  const ny = dx / len;

  return {
    x: a.x + nx * laneOffset,
    y: a.y + ny * laneOffset + TRACK_OFFSET_Y,
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

export const CHECKPOINTS = [0.25, 0.5, 0.75];

/** Curvas nomeadas do circuito, ordenadas por progresso. */
export const CORNERS: Array<{ progress: number; name: string; isChicane?: boolean }> = [
  { progress: 0.05, name: 'Curva 1' },
  { progress: 0.25, name: 'Curva 2' },
  { progress: 0.50, name: 'Chicane', isChicane: true },
  { progress: 0.75, name: 'Curva 3' },
  { progress: 0.95, name: 'Curva 4' },
];

export interface NextCornerInfo {
  name: string;
  isChicane: boolean;
  /** Distância em % até a curva (0..1). */
  distance: number;
  /** Próximo trecho será DRS zone? */
  isDRS: boolean;
}

/** Retorna informações da próxima curva à frente do progresso atual. */
export function getNextCornerInfo(progress: number): NextCornerInfo {
  const p = ((progress % 1) + 1) % 1;
  let next = CORNERS.find((c) => c.progress > p);
  if (!next) next = CORNERS[0]; // wrap-around
  const distance = next.progress > p ? next.progress - p : 1 - p + next.progress;
  // DRS zone vai começar em breve se está dentro de ~5% antes do início de uma DRS_ZONE
  const isDRS = DRS_ZONES.some((z) => {
    const d = z.start > p ? z.start - p : 1 - p + z.start;
    return d < distance + 0.02;
  });
  return { name: next.name, isChicane: !!next.isChicane, distance, isDRS };
}

/** Setores cronometrados estilo F1 (S1, S2, S3). Fronteiras em progress 0..1. */
export const SECTORS: Array<{ name: string; start: number; end: number }> = [
  { name: 'S1', start: 0, end: 1 / 3 },
  { name: 'S2', start: 1 / 3, end: 2 / 3 },
  { name: 'S3', start: 2 / 3, end: 1 },
];
export const SECTOR_BOUNDARIES = [1 / 3, 2 / 3, 0.999];

/** Zonas DRS — trechos retos verticais para ultrapassagem. */
export const DRS_ZONES: Array<{ start: number; end: number }> = [
  { start: 0.05, end: 0.22 },   // reta esquerda (descendo)
  { start: 0.55, end: 0.70 },   // reta direita (subindo, após chicane)
];

export function isInDRSZone(progress: number): boolean {
  const p = ((progress % 1) + 1) % 1;
  return DRS_ZONES.some((z) => p >= z.start && p <= z.end);
}

/** Calcula a volta atual (1-based) e total estimado a partir do progress acumulado. */
export function computeLapInfo(progress: number, totalLaps = 10): { current: number; total: number } {
  const lapsDone = Math.floor(Math.max(0, progress));
  const current = Math.min(totalLaps, lapsDone + 1);
  return { current, total: totalLaps };
}

/** Gera frase de comentarista contextual para overtakes / sectors / final / DRS. */
export function makeCommentaryLine(opts: {
  type: 'overtake' | 'sector' | 'drs' | 'finale' | 'leader';
  attacker?: string;
  defender?: string;
  leader?: string;
  sector?: string;
}): string {
  const a = opts.attacker?.split(' ')[0] ?? 'Piloto';
  const d = opts.defender?.split(' ')[0] ?? 'rival';
  const l = opts.leader?.split(' ')[0] ?? 'líder';
  switch (opts.type) {
    case 'overtake': {
      const variants = [
        `${a} ataca e ultrapassa ${d}!`,
        `Manobra cirúrgica de ${a} sobre ${d}!`,
        `${a} dá o bote em ${d} na curva!`,
        `${d} perde a posição para ${a}!`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    }
    case 'drs':
      return `${a} aciona o DRS e voa em cima de ${d}!`;
    case 'sector':
      return `${l} fecha o setor ${opts.sector ?? ''} na ponta!`;
    case 'leader':
      return `${l} assume a liderança da prova!`;
    case 'finale':
      return `Bandeira quadriculada à vista — ${l} caminha para a vitória!`;
    default:
      return '';
  }
}

/** Detecta ultrapassagens comparando dois snapshots ordenados por progresso desc. */
export function detectOvertakes(
  prev: Array<{ id: string; progress: number }>,
  curr: Array<{ id: string; progress: number }>,
): Array<{ overtaker: string; overtaken: string }> {
  const prevRank = new Map(prev.sort((a, b) => b.progress - a.progress).map((r, i) => [r.id, i]));
  const currRank = new Map(curr.sort((a, b) => b.progress - a.progress).map((r, i) => [r.id, i]));
  const overtakes: Array<{ overtaker: string; overtaken: string }> = [];
  currRank.forEach((newPos, id) => {
    const oldPos = prevRank.get(id);
    if (oldPos === undefined) return;
    if (newPos < oldPos) {
      currRank.forEach((otherNew, otherId) => {
        if (otherId === id) return;
        const otherOld = prevRank.get(otherId);
        if (otherOld !== undefined && otherOld < oldPos && otherNew > newPos) {
          overtakes.push({ overtaker: id, overtaken: otherId });
        }
      });
    }
  });
  return overtakes;
}
