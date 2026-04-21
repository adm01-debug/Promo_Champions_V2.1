export type RiskSeverity = "low" | "medium" | "high" | "critical";

/**
 * Derives severity bucket from a 0–100 risk score using the same boundaries
 * as `severityFromScore` in the edge function (40/50/65/80).
 */
export function severityFromScore(score: number): RiskSeverity {
  if (score >= 80) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  return "low";
}
