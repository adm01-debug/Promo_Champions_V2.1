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

import {
  DEAL_RISK_THRESHOLD,
  STUCK_STATUSES,
  extractCompetitorMatches,
  severityFromScore,
  suggestedActionFor,
} from "../_shared/winloss-contract.ts";
import type {
  CompetitorMatch,
  RiskReason,
  RiskSeverity,
} from "../_shared/winloss-contract.ts";

// Re-exporta o contrato compartilhado para manter compat com os consumers que
// importam de "./scoring.ts" (index.ts, testes, _dump_scenarios.ts).
export {
  CANONICAL_PATTERN_TYPES,
  COMPETITOR_KEYWORDS_RE,
  DEAL_RISK_THRESHOLD,
  RISK_REASON_CODES,
  RISK_REASON_LABELS,
  STUCK_STATUSES,
  WIN_OVERRIDE_ACTION,
  extractCompetitorKeywords,
  extractCompetitorMatches,
  severityFromScore,
  suggestedActionFor,
} from "../_shared/winloss-contract.ts";
export type {
  CompetitorMatch,
  RiskReason,
  RiskReasonCode,
  RiskReasonSource,
  RiskSeverity,
} from "../_shared/winloss-contract.ts";

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
  reasons_v2?: RiskReason[];
  // Debug fields (optional for backward compatibility on the client).
  matched_keywords?: string[];
  competitor_matches?: CompetitorMatch[];
  days_stagnant?: number;
  avg_loss_cycle_days?: number | null;
  avg_loss_amount?: number | null;
  raw_score?: number;
  confidence_weight?: number;
  final_score?: number;
  stage_eligible?: boolean;
  severity?: RiskSeverity;
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

export function ensureNonEmpty(value: string | null | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : fallback;
}

/**
 * Compute risk score for a single deal against the pattern set.
 * Returns null when score is below the inclusion threshold (DEAL_RISK_THRESHOLD).
 */
export function computeDealRisk(
  deal: OpenDeal,
  patterns: LossPattern[],
  now: Date,
  threshold = DEAL_RISK_THRESHOLD,
): RiskResult | null {
  const dealAmount = Number(deal.amount) || 0;
  const days = daysBetween(deal.updated_at ?? deal.created_at, now);

  const lossPatterns = patterns.filter(p => p.outcome === "lost" || p.pattern_type === "loss_factor");
  const stuckPatterns = patterns.filter(p => p.pattern_type === "stuck_stage");
  const competitorPatterns = patterns.filter(p => p.pattern_type === "competitor");

  // Pick the loss pattern whose avg_amount is closest to deal amount (best signal).
  let bestLoss: LossPattern | null = null;
  if (lossPatterns.length) {
    bestLoss = lossPatterns.reduce<LossPattern | null>((best, p) => {
      if (!p.avg_amount) return best;
      if (!best || !best.avg_amount) return p;
      const dBest = Math.abs(dealAmount - (best.avg_amount ?? 0));
      const dCur = Math.abs(dealAmount - (p.avg_amount ?? 0));
      return dCur < dBest ? p : best;
    }, lossPatterns[0] ?? null);
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
  const reasonsV2: RiskReason[] = [];
  const avgCycle = Math.round(bestLoss?.avg_cycle_days ?? 0);
  if (stagnation >= 30) {
    const msg = `${days} dias sem atualização (média de loss: ${avgCycle}d)`;
    reasons.push(msg);
    reasonsV2.push({
      code: "STAGNATION_HIGH",
      message: msg,
      params: { days, avgCycle },
      source: "stagnation",
      contribution: stagnation,
    });
  } else if (stagnation > 0) {
    const msg = `${days} dias sem atualização`;
    reasons.push(msg);
    reasonsV2.push({
      code: "STAGNATION_LOW",
      message: msg,
      params: { days },
      source: "stagnation",
      contribution: stagnation,
    });
  }
  if (amountAlign >= 15) {
    const avgAmount = Math.round(bestLoss?.avg_amount ?? 0);
    const msg = `Ticket alinhado ao perfil típico de loss (${avgAmount.toLocaleString("pt-BR")})`;
    reasons.push(msg);
    reasonsV2.push({
      code: "AMOUNT_ALIGNED",
      message: msg,
      params: { dealAmount, avgAmount },
      source: "amount",
      contribution: amountAlign,
    });
  }
  if (stageScore > 0) {
    const stage = deal.status ?? "";
    const msg = `Estágio "${stage}" historicamente travado`;
    reasons.push(msg);
    reasonsV2.push({
      code: "STAGE_STUCK",
      message: msg,
      params: { stage },
      source: "stage",
      contribution: stageScore,
    });
  }
  // Competitor signal (proxy: source contém termos competitivos OU presença de padrão).
  const bestCompetitor = competitorPatterns.reduce<LossPattern | null>((best, p) => {
    if (!best) return p;
    return (p.confidence ?? 0) > (best.confidence ?? 0) ? p : best;
  }, null);
  const competitorConfidence = bestCompetitor?.confidence ?? 0.5;
  const competitorMatches = extractCompetitorMatches(deal.source, competitorConfidence);
  const matchedKeywords = competitorMatches.map(m => m.keyword);
  if (competitorPatterns.length && matchedKeywords.length > 0) {
    const msg = `Possível pressão competitiva detectada (${matchedKeywords.join(", ")})`;
    reasons.push(msg);
    reasonsV2.push({
      code: "COMPETITOR_PRESSURE",
      message: msg,
      params: { keywordCount: matchedKeywords.length, keywords: matchedKeywords.join(",") },
      source: "competitor",
      contribution: matchedKeywords.length,
    });
  }

  // Pick the dominant pattern for the label.
  let dominant: { label: string; type: string; confidence: number; outcome: string | null };
  if (stageScore >= Math.max(stagnation, amountAlign) && bestStuck) {
    dominant = {
      label: bestStuck.label ?? "",
      type: "stuck_stage",
      confidence: bestStuck.confidence ?? 0.5,
      outcome: bestStuck.outcome ?? "lost",
    };
  } else if (bestLoss && (stagnation > 0 || amountAlign > 0)) {
    dominant = {
      label: bestLoss.label ?? "",
      type: "loss_factor",
      confidence: bestLoss.confidence ?? 0.5,
      outcome: bestLoss.outcome ?? "lost",
    };
  } else {
    dominant = { label: "", type: "generic", confidence: 0.5, outcome: "lost" };
  }

  // Final weighted score.
  const raw = stagnation + amountAlign + stageScore;
  const confWeight = Math.max(0.5, Math.min(1, dominant.confidence));
  const finalScore = Math.max(0, Math.min(100, Math.round(raw * confWeight)));

  if (finalScore < threshold) return null;

  const stageEligible = !!deal.status && STUCK_STATUSES.has(deal.status);
  const severity = severityFromScore(finalScore, dominant.confidence);

  // Validations: never empty, never trivially short.
  const labelFallback = `Sinal de risco (${dominant.type})`;
  const matchedPattern = ensureNonEmpty(dominant.label, labelFallback);

  let suggestedAction = ensureNonEmpty(
    suggestedActionFor(dominant.type, deal.status, {
      outcome: dominant.outcome,
      severity,
    }),
    "Confirmar próximo passo do deal com o cliente",
  );
  if (suggestedAction.length < 15) {
    console.warn(
      JSON.stringify({
        fn: "detect-winloss-at-risk",
        event: "suggested_action_too_short",
        sale_id: deal.id,
        action: suggestedAction,
        type: dominant.type,
        severity,
      }),
    );
    suggestedAction = "Revisar abordagem com o cliente nas próximas 48h";
  }

  const finalReasons = reasons.length ? reasons : ["Sinais cruzados de risco"];
  const finalReasonsV2: RiskReason[] = reasonsV2.length
    ? reasonsV2
    : [{
        code: "CROSSED_SIGNALS",
        message: "Sinais cruzados de risco",
        params: {},
        source: "generic",
        contribution: 0,
      }];

  return {
    sale_id: deal.id,
    client_name: deal.client_name,
    amount: dealAmount,
    stage: deal.status,
    risk_score: finalScore,
    matched_pattern: matchedPattern,
    suggested_action: suggestedAction,
    reasons: finalReasons,
    breakdown: {
      stagnation,
      amount_alignment: amountAlign,
      stage_match: stageScore,
      matched_pattern_label: matchedPattern,
      matched_pattern_type: dominant.type,
      matched_confidence: dominant.confidence,
      reasons: finalReasons,
      reasons_v2: finalReasonsV2,
      matched_keywords: matchedKeywords,
      competitor_matches: competitorMatches.length ? competitorMatches : undefined,
      days_stagnant: days,
      avg_loss_cycle_days: bestLoss?.avg_cycle_days ?? null,
      avg_loss_amount: bestLoss?.avg_amount ?? null,
      raw_score: raw,
      confidence_weight: confWeight,
      final_score: finalScore,
      stage_eligible: stageEligible,
      severity,
    },
  };
}

export function computeAtRiskDeals(
  deals: OpenDeal[],
  patterns: LossPattern[],
  now: Date,
  opts: { threshold?: number; limit?: number } = {},
): RiskResult[] {
  const { threshold = DEAL_RISK_THRESHOLD, limit = 20 } = opts;
  const results: RiskResult[] = [];
  for (const d of deals) {
    const r = computeDealRisk(d, patterns, now, threshold);
    if (r) results.push(r);
  }
  results.sort((a, b) => b.risk_score - a.risk_score);
  return results.slice(0, limit);
}
