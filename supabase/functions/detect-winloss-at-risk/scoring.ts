/**
 * Pure scoring functions for at-risk deal detection.
 * Extracted for unit testing — no Deno-specific imports.
 *
 * Score philosophy (0-100):
 *  - Stagnation contributes up to 50 pts (linear vs avg cycle of loss patterns).
 *  - Amount alignment vs avg_amount of loss patterns contributes up to 25 pts.
 *  - Stuck-stage match contributes up to 25 pts (weighted by pattern confidence).
 *  - Final score is multiplied by the confidence of the matched pattern (floor 0.5)
 *    so low-confidence patterns can't push deals into "critical" territory.
 *  - Result is clamped to [0, 100].
 */

export interface LossPattern {
  pattern_type: string | null;
  label: string | null;
  outcome: string | null;
  frequency: number | null;
  win_rate: number | null;
  avg_cycle_days: number | null;
  avg_amount: number | null;
  confidence: number | null;
}

export interface OpenDeal {
  id: string;
  client_name: string | null;
  amount: number | null;
  status: string | null;
  category: string | null;
  source: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface RiskBreakdown {
  stagnation: number;
  amount_alignment: number;
  stage_match: number;
  matched_pattern_label: string;
  matched_pattern_type: string;
  matched_confidence: number;
  reasons: string[];
  // Debug fields (optional for backward compatibility on the client).
  matched_keywords?: string[];
  days_stagnant?: number;
  avg_loss_cycle_days?: number | null;
  avg_loss_amount?: number | null;
  raw_score?: number;
  confidence_weight?: number;
  final_score?: number;
  stage_eligible?: boolean;
}

export const COMPETITOR_KEYWORDS_RE = /concorr\w*|competitor\w*|leila\w*|cota[cç]\w*/gi;

export function extractCompetitorKeywords(source: string | null | undefined): string[] {
  if (!source) return [];
  const matches = source.match(COMPETITOR_KEYWORDS_RE);
  if (!matches) return [];
  // Dedupe (case-insensitive) preserving order.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const k = m.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(m);
    }
  }
  return out;
}

export interface RiskResult {
  sale_id: string;
  client_name: string | null;
  amount: number;
  stage: string | null;
  risk_score: number;
  matched_pattern: string;
  suggested_action: string;
  reasons: string[];
  breakdown: RiskBreakdown;
}

export const STUCK_STATUSES = new Set([
  "negotiation",
  "proposal",
  "qualified",
  "pending",
]);

export function daysBetween(fromIso: string | null, now: Date): number {
  if (!fromIso) return 0;
  const t = new Date(fromIso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

/**
 * Stagnation score 0-50.
 * Reaches 50 when days_stagnant >= avg_cycle_days of the worst loss pattern.
 */
export function stagnationScore(daysStagnant: number, avgLossCycleDays: number | null): number {
  if (!avgLossCycleDays || avgLossCycleDays <= 0) {
    // Fallback: 30 days = 50 pts.
    return Math.min(50, Math.round((daysStagnant / 30) * 50));
  }
  const ratio = daysStagnant / avgLossCycleDays;
  return Math.min(50, Math.round(ratio * 50));
}

/**
 * Amount alignment score 0-25.
 * Peaks (25) when deal amount is within ±20% of loss-pattern avg amount.
 * Decays linearly to 0 at ±100% deviation.
 */
export function amountAlignmentScore(dealAmount: number, avgLossAmount: number | null): number {
  if (!avgLossAmount || avgLossAmount <= 0 || dealAmount <= 0) return 0;
  const deviation = Math.abs(dealAmount - avgLossAmount) / avgLossAmount;
  if (deviation <= 0.2) return 25;
  if (deviation >= 1.0) return 0;
  // Linear decay from 25 (at 0.2 deviation) to 0 (at 1.0 deviation).
  return Math.round(25 * (1 - (deviation - 0.2) / 0.8));
}

/**
 * Stage-match score 0-25, weighted by pattern confidence.
 * Returns 25 * confidence when status is one of STUCK_STATUSES and a stuck_stage
 * pattern exists; 0 otherwise.
 */
export function stageMatchScore(status: string | null, stuckPattern: LossPattern | null): number {
  if (!status || !stuckPattern) return 0;
  if (!STUCK_STATUSES.has(status)) return 0;
  const conf = Math.max(0, Math.min(1, stuckPattern.confidence ?? 0.5));
  return Math.round(25 * conf);
}

export function suggestedActionFor(patternType: string, status: string | null): string {
  switch (patternType) {
    case "loss_factor":
      return "Revisar proposta com foco em valor percebido e desbloqueio rápido";
    case "stuck_stage":
      return `Acelerar saída do estágio "${status ?? "atual"}" com próxima ação concreta`;
    case "competitor":
      return "Reforçar diferenciação competitiva e adicionar prova social";
    case "win_factor":
      return "Reaplicar abordagem consultiva que tem alta taxa de vitória";
    default:
      return "Revisar abordagem com o cliente nas próximas 48h";
  }
}

/**
 * Compute risk score for a single deal against the pattern set.
 * Returns null when score is below the inclusion threshold (40).
 */
export function computeDealRisk(
  deal: OpenDeal,
  patterns: LossPattern[],
  now: Date,
  threshold = 40,
): RiskResult | null {
  const dealAmount = Number(deal.amount) || 0;
  const days = daysBetween(deal.updated_at ?? deal.created_at, now);

  const lossPatterns = patterns.filter(p => p.outcome === "lost" || p.pattern_type === "loss_factor");
  const stuckPatterns = patterns.filter(p => p.pattern_type === "stuck_stage");
  const competitorPatterns = patterns.filter(p => p.pattern_type === "competitor");

  // Pick the loss pattern whose avg_amount is closest to deal amount (best signal).
  let bestLoss: LossPattern | null = null;
  if (lossPatterns.length) {
    bestLoss = lossPatterns.reduce((best, p) => {
      if (!p.avg_amount) return best;
      if (!best || !best.avg_amount) return p;
      const dBest = Math.abs(dealAmount - (best.avg_amount ?? 0));
      const dCur = Math.abs(dealAmount - (p.avg_amount ?? 0));
      return dCur < dBest ? p : best;
    }, lossPatterns[0]);
  }

  // Pick highest-confidence stuck pattern.
  const bestStuck = stuckPatterns.reduce<LossPattern | null>((best, p) => {
    if (!best) return p;
    return (p.confidence ?? 0) > (best.confidence ?? 0) ? p : best;
  }, null);

  const stagnation = stagnationScore(days, bestLoss?.avg_cycle_days ?? null);
  const amountAlign = amountAlignmentScore(dealAmount, bestLoss?.avg_amount ?? null);
  const stageScore = stageMatchScore(deal.status, bestStuck);

  const reasons: string[] = [];
  if (stagnation >= 30) {
    reasons.push(`${days} dias sem atualização (média de loss: ${Math.round(bestLoss?.avg_cycle_days ?? 0)}d)`);
  } else if (stagnation > 0) {
    reasons.push(`${days} dias sem atualização`);
  }
  if (amountAlign >= 15) {
    reasons.push(`Ticket alinhado ao perfil típico de loss (${Math.round(bestLoss?.avg_amount ?? 0).toLocaleString("pt-BR")})`);
  }
  if (stageScore > 0) {
    reasons.push(`Estágio "${deal.status}" historicamente travado`);
  }
  // Competitor signal (proxy: source contém termos competitivos OU presença de padrão).
  if (competitorPatterns.length && deal.source && /concorr|competitor|leilao|cotac/i.test(deal.source)) {
    reasons.push("Possível pressão competitiva detectada");
  }

  // Pick the dominant pattern for the label.
  let dominant: { label: string; type: string; confidence: number };
  if (stageScore >= Math.max(stagnation, amountAlign) && bestStuck) {
    dominant = {
      label: bestStuck.label ?? "Estágio travado",
      type: "stuck_stage",
      confidence: bestStuck.confidence ?? 0.5,
    };
  } else if (bestLoss && (stagnation > 0 || amountAlign > 0)) {
    dominant = {
      label: bestLoss.label ?? "Padrão de loss",
      type: "loss_factor",
      confidence: bestLoss.confidence ?? 0.5,
    };
  } else {
    dominant = { label: "Sinal genérico de risco", type: "generic", confidence: 0.5 };
  }

  // Final weighted score.
  const raw = stagnation + amountAlign + stageScore;
  const confWeight = Math.max(0.5, Math.min(1, dominant.confidence));
  const finalScore = Math.max(0, Math.min(100, Math.round(raw * confWeight)));

  if (finalScore < threshold) return null;

  return {
    sale_id: deal.id,
    client_name: deal.client_name,
    amount: dealAmount,
    stage: deal.status,
    risk_score: finalScore,
    matched_pattern: dominant.label,
    suggested_action: suggestedActionFor(dominant.type, deal.status),
    reasons: reasons.length ? reasons : ["Sinais cruzados de risco"],
    breakdown: {
      stagnation,
      amount_alignment: amountAlign,
      stage_match: stageScore,
      matched_pattern_label: dominant.label,
      matched_pattern_type: dominant.type,
      matched_confidence: dominant.confidence,
      reasons,
    },
  };
}

export function computeAtRiskDeals(
  deals: OpenDeal[],
  patterns: LossPattern[],
  now: Date,
  opts: { threshold?: number; limit?: number } = {},
): RiskResult[] {
  const { threshold = 40, limit = 20 } = opts;
  const results: RiskResult[] = [];
  for (const d of deals) {
    const r = computeDealRisk(d, patterns, now, threshold);
    if (r) results.push(r);
  }
  results.sort((a, b) => b.risk_score - a.risk_score);
  return results.slice(0, limit);
}
