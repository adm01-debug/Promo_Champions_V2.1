// Pista oval — coordenadas no viewBox 1000x600
// Path elíptico com cantos suaves
export const TRACK_VIEWBOX = { width: 1000, height: 600 };
export const TRACK_CENTER = { x: 500, y: 300 };
export const TRACK_RX_OUTER = 440;
export const TRACK_RY_OUTER = 240;
export const TRACK_RX_INNER = 280;
export const TRACK_RY_INNER = 120;
// Linha central onde o carro corre (média entre outer e inner)
const RX = (TRACK_RX_OUTER + TRACK_RX_INNER) / 2;
const RY = (TRACK_RY_OUTER + TRACK_RY_INNER) / 2;

export interface TrackPosition {
  x: number;
  y: number;
  rotation: number; // graus, tangente
}

/**
 * Mapeia progresso 0..1 para posição na pista oval (sentido anti-horário a partir da linha de chegada à direita).
 * Linha de chegada = ângulo 0 (lado direito).
 */
export function getPositionOnTrack(progress: number, laneOffset = 0): TrackPosition {
  const p = Math.max(0, Math.min(1, progress));
  // Anti-horário: ângulo cresce negativo (ou usar -2π)
  const angle = -p * Math.PI * 2;
  const rx = RX + laneOffset;
  const ry = RY + laneOffset;
  const x = TRACK_CENTER.x + rx * Math.cos(angle);
  const y = TRACK_CENTER.y + ry * Math.sin(angle);
  // tangente de elipse
  const tx = -rx * Math.sin(angle);
  const ty = ry * Math.cos(angle);
  const rotation = (Math.atan2(ty, tx) * 180) / Math.PI;
  return { x, y, rotation };
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
      // subiu de posição — encontrar quem foi ultrapassado
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
