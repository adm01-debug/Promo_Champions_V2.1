/**
 * Calcula a intensidade da celebração proporcional ao feito da posição.
 * Score 0-100. Quanto maior o salto e mais perto do topo, maior a celebração.
 *
 * Heurística:
 *  - Magnitude do salto (rank ganhos)
 *  - Bônus por chegar ao top-3
 *  - Bônus por takeover (chegar ao P1)
 *  - Bônus extra por overtake direto sobre o líder anterior
 */
export interface CelebrationInput {
  fromRank: number;
  toRank: number;
  isTakeover?: boolean;
  isTop3?: boolean;
}

export interface CelebrationOutput {
  /** 0-100 */
  score: number;
  /** Disparar screen-shake? */
  shake: boolean;
  /** Quantos bursts de fireworks (0-3). */
  fireworks: 0 | 1 | 2 | 3;
  /** Tipo de som a disparar. */
  sound: 'none' | 'pulse' | 'cheer' | 'horn';
  /** Duração total recomendada da celebração em ms. */
  duration: number;
}

export function getCelebrationIntensity(input: CelebrationInput): CelebrationOutput {
  const { fromRank, toRank, isTakeover = false, isTop3 = false } = input;
  const jump = Math.max(0, fromRank - toRank);

  let score = Math.min(60, jump * 8);
  if (isTop3) score += 20;
  if (toRank === 1) score += 15;
  if (isTakeover) score += 25;
  score = Math.max(0, Math.min(100, score));

  if (score >= 80) {
    return { score, shake: true, fireworks: 3, sound: 'horn', duration: 2400 };
  }
  if (score >= 55) {
    return { score, shake: true, fireworks: 2, sound: 'cheer', duration: 1800 };
  }
  if (score >= 30) {
    return { score, shake: false, fireworks: 1, sound: 'cheer', duration: 1200 };
  }
  if (score > 0) {
    return { score, shake: false, fireworks: 0, sound: 'pulse', duration: 600 };
  }
  return { score: 0, shake: false, fireworks: 0, sound: 'none', duration: 0 };
}
