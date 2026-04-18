// Pista serpenteante — circuito fechado em viewBox 1000x600
// Path SVG cúbico amostrado em uma lookup table para posicionar carros por progresso 0..1.

export const TRACK_VIEWBOX = { width: 1000, height: 600 };

// Oval estendido com 1 chicane suave na reta de baixo — estilo Mario Circuit / kart pro.
// Largura constante, curvas com arcos amplos, sem retornos serpentinos.
// Sentido horário: largada na esquerda da reta superior, indo para a direita.
// viewBox 1000x600. Margens generosas (~110px nas laterais, ~95px topo/base).
export const TRACK_PATH_D = `
M 220 95
L 780 95
C 855 95, 905 145, 905 220
L 905 380
C 905 455, 855 505, 780 505
L 640 505
C 615 505, 600 515, 585 530
C 570 545, 555 555, 530 555
C 505 555, 490 545, 475 530
C 460 515, 445 505, 420 505
L 220 505
C 145 505, 95 455, 95 380
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
    y: a.y + ny * laneOffset,
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

export const CHECKPOINTS = [0.25, 0.5, 0.75];

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
