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

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskReasonCode =
  | "STAGNATION_HIGH"
  | "STAGNATION_LOW"
  | "AMOUNT_ALIGNED"
  | "STAGE_STUCK"
  | "COMPETITOR_PRESSURE"
  | "CROSSED_SIGNALS";

export const RISK_REASON_CODES: readonly RiskReasonCode[] = [
  "STAGNATION_HIGH",
  "STAGNATION_LOW",
  "AMOUNT_ALIGNED",
  "STAGE_STUCK",
  "COMPETITOR_PRESSURE",
  "CROSSED_SIGNALS",
] as const;

export type RiskReasonSource =
  | "stagnation"
  | "amount"
  | "stage"
  | "competitor"
  | "generic";

export interface RiskReason {
  code: RiskReasonCode;
  message: string;
  params: Record<string, string | number>;
  source: RiskReasonSource;
  contribution: number;
}

export interface CompetitorMatch {
  keyword: string;
  matched_substring: string;
  regex: string;
  confidence: number;
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

export const COMPETITOR_KEYWORDS_RE = /concorr\w*|competitor\w*|leila\w*|cota[cç]\w*/gi;

const COMPETITOR_REGEX_LABEL: Array<[string, string]> = [
  ["concorr", "/concorr\\w*/i"],
  ["competitor", "/competitor\\w*/i"],
  ["leila", "/leila\\w*/i"],
  ["cota", "/cota[c\u00e7]\\w*/i"],
];

function attributeRegexSource(hit: string): string {
  const lower = hit.toLowerCase();
  for (const [needle, label] of COMPETITOR_REGEX_LABEL) {
    if (lower.includes(needle)) return label;
  }
  return "/" + COMPETITOR_KEYWORDS_RE.source + "/gi";
}

// CompetitorMatch interface declared at the top of this file (near RiskBreakdown).

/**
 * Detailed competitor matches with original substring and originating regex.
 * Dedup by lowercased keyword preserving first occurrence.
 */
export function extractCompetitorMatches(
  source: string | null | undefined,
  confidence = 0.5,
): CompetitorMatch[] {
  if (!source) return [];
  // Split on commas / whitespace to recover the "token" each match lives in.
  const tokens = source.split(/[\s,;]+/).filter(Boolean);
  const seen = new Set<string>();
  const out: CompetitorMatch[] = [];
  for (const token of tokens) {
    const m = token.match(COMPETITOR_KEYWORDS_RE);
    if (!m) continue;
    for (const hit of m) {
      const key = hit.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        keyword: hit,
        matched_substring: token,
        regex: attributeRegexSource(hit),
        confidence,
      });
    }
  }
  return out;
}

export function extractCompetitorKeywords(source: string | null | undefined): string[] {
  return extractCompetitorMatches(source).map(m => m.keyword);
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

export function severityFromScore(score: number, confidence: number | null | undefined): RiskSeverity {
  const c = Math.max(0, Math.min(1, confidence ?? 0.5));
  if (score >= 80 && c >= 0.7) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function ensureNonEmpty(value: string | null | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : fallback;
}

interface ActionOpts {
  outcome?: string | null;
  severity: RiskSeverity;
}

/**
 * Suggested action coherent with pattern type, outcome and severity.
 * `win_factor` patterns (positive outcome) never produce urgency markers.
 * Critical/high severity on loss-related patterns get urgency markers
 * ("URGENTE", "IMEDIATA", "24h"). Medium/low get measured language.
 */
export function suggestedActionFor(
  patternType: string,
  status: string | null,
  opts: ActionOpts,
): string {
  const sev = opts.severity;
  const outcome = (opts.outcome ?? "").toLowerCase();
  const stage = status ?? "atual";

  // Positive patterns — never urgent, regardless of severity.
  if (patternType === "win_factor" || outcome === "won") {
    return "Reaplicar abordagem consultiva vencedora deste perfil de cliente";
  }

  switch (patternType) {
    case "loss_factor":
      if (sev === "critical")
        return "AÇÃO IMEDIATA: agendar call de resgate em 24h e revisar proposta com condição estratégica";
      if (sev === "high")
        return "Revisar proposta nas próximas 48h com foco em valor percebido e desbloqueio";
      if (sev === "medium")
        return "Reforçar valor percebido e ajustar narrativa de ROI nesta semana";
      return "Revisar abordagem e confirmar interesse do cliente nas próximas semanas";

    case "stuck_stage":
      if (sev === "critical")
        return `URGENTE: desbloquear estágio "${stage}" hoje — escalar para gestor se necessário`;
      if (sev === "high")
        return `Acelerar saída do estágio "${stage}" com próxima ação concreta em 48h`;
      if (sev === "medium")
        return `Definir próxima ação para destravar estágio "${stage}" esta semana`;
      return `Revisar estágio "${stage}" e confirmar critério de avanço`;

    case "competitor":
      if (sev === "critical")
        return "Concorrência ativa detectada — disparar battle card e ligar ao decisor em 24h";
      if (sev === "high")
        return "Reforçar diferenciação competitiva e adicionar prova social em 48h";
      if (sev === "medium")
        return "Revisar posicionamento competitivo e preparar contra-argumentos";
      return "Confirmar se há concorrente no deal e mapear objeções";

    default:
      if (sev === "critical")
        return "Revisar deal urgente com gestor — múltiplos sinais de risco cruzados";
      if (sev === "high")
        return "Revisar abordagem com o cliente nas próximas 48h";
      if (sev === "medium")
        return "Revisar abordagem com o cliente nas próximas 72h";
      return "Confirmar próximo passo do deal com o cliente";
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
  const bestCompetitor = competitorPatterns.reduce<LossPattern | null>((best, p) => {
    if (!best) return p;
    return (p.confidence ?? 0) > (best.confidence ?? 0) ? p : best;
  }, null);
  const competitorConfidence = bestCompetitor?.confidence ?? 0.5;
  const competitorMatches = extractCompetitorMatches(deal.source, competitorConfidence);
  const matchedKeywords = competitorMatches.map(m => m.keyword);
  if (competitorPatterns.length && matchedKeywords.length > 0) {
    reasons.push(`Possível pressão competitiva detectada (${matchedKeywords.join(", ")})`);
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

  return {
    sale_id: deal.id,
    client_name: deal.client_name,
    amount: dealAmount,
    stage: deal.status,
    risk_score: finalScore,
    matched_pattern: matchedPattern,
    suggested_action: suggestedAction,
    reasons: reasons.length ? reasons : ["Sinais cruzados de risco"],
    breakdown: {
      stagnation,
      amount_alignment: amountAlign,
      stage_match: stageScore,
      matched_pattern_label: matchedPattern,
      matched_pattern_type: dominant.type,
      matched_confidence: dominant.confidence,
      reasons,
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
  const { threshold = 40, limit = 20 } = opts;
  const results: RiskResult[] = [];
  for (const d of deals) {
    const r = computeDealRisk(d, patterns, now, threshold);
    if (r) results.push(r);
  }
  results.sort((a, b) => b.risk_score - a.risk_score);
  return results.slice(0, limit);
}
