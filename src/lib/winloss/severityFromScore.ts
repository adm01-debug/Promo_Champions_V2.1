import {
  severityFromScore as contractSeverityFromScore,
} from "../../../supabase/functions/_shared/winloss-contract";
import type { RiskSeverity } from "../../../supabase/functions/_shared/winloss-contract";

export type { RiskSeverity };

/**
 * Derives severity bucket from a 0–100 risk score using the same boundaries
 * as the edge function (40/50/65/80). Thin adapter over the shared contract:
 * score-only semantics = confiança plena (1), então score ≥ 80 → critical.
 */
export function severityFromScore(score: number): RiskSeverity {
  return contractSeverityFromScore(score, 1);
}
