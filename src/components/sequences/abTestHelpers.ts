import type { VariantPerformance } from "@/hooks/sequences/useStepVariants";

export interface WinnerAnalysis {
  winnerLabel: "A" | "B" | null;
  confidence: number; // 0..100
  significant: boolean;
  reason: string;
}

/**
 * 2-proportion z-test for reply rate difference.
 * Threshold: 90% confidence, min 30 sends per variant.
 */
export function analyzeWinner(perf: VariantPerformance[]): WinnerAnalysis {
  const a = perf.find((p) => p.label === "A");
  const b = perf.find((p) => p.label === "B");
  if (!a || !b) {
    return { winnerLabel: null, confidence: 0, significant: false, reason: "Aguardando variantes" };
  }
  const minSamples = 30;
  if (a.sent < minSamples || b.sent < minSamples) {
    return {
      winnerLabel: null,
      confidence: 0,
      significant: false,
      reason: `Aguardando dados (mín. ${minSamples} envios por variante)`,
    };
  }
  const pA = a.replied / a.sent;
  const pB = b.replied / b.sent;
  const pPool = (a.replied + b.replied) / (a.sent + b.sent);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / a.sent + 1 / b.sent));
  if (se === 0) {
    return { winnerLabel: null, confidence: 0, significant: false, reason: "Sem variação" };
  }
  const z = Math.abs(pA - pB) / se;
  // Approx 2-tailed p-value via erf
  const confidence = Math.min(99.9, (1 - 2 * (1 - normCdf(z))) * 100);
  const significant = confidence >= 90;
  const winnerLabel = pA > pB ? "A" : pB > pA ? "B" : null;
  return {
    winnerLabel: significant ? winnerLabel : null,
    confidence: Math.round(confidence * 10) / 10,
    significant,
    reason: significant
      ? `Variante ${winnerLabel} vence com ${confidence.toFixed(1)}% de confiança`
      : `Aguardando significância (${confidence.toFixed(1)}% / 90%)`,
  };
}

function normCdf(z: number): number {
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2);
  const p =
    d *
    t *
    (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}
