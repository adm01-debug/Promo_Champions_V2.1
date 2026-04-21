/**
 * Pure UI mirrors of backend severity + action-matrix logic.
 * Keep in sync with `supabase/functions/detect-winloss-at-risk/scoring.ts`:
 *   - severityFromScore
 *   - suggestedActionFor (branch selection)
 */

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface SeverityRule {
  severity: RiskSeverity;
  label: string;
  /** Plain-text expression of the rule, monospace-friendly. */
  expression: string;
  matches: (final: number, conf: number) => boolean;
}

/**
 * Ordered top→bottom; first match wins (mirrors `severityFromScore`).
 */
export const SEVERITY_RULES: readonly SeverityRule[] = [
  {
    severity: "critical",
    label: "Crítico",
    expression: "final ≥ 80 ∧ conf ≥ 0.7",
    matches: (final, conf) => final >= 80 && conf >= 0.7,
  },
  {
    severity: "high",
    label: "Alto",
    expression: "final ≥ 65",
    matches: (final) => final >= 65,
  },
  {
    severity: "medium",
    label: "Médio",
    expression: "final ≥ 50",
    matches: (final) => final >= 50,
  },
  {
    severity: "low",
    label: "Baixo",
    expression: "final < 50",
    matches: () => true,
  },
] as const;

/** Mirror of backend `severityFromScore(final, confidence)`. */
export function deriveSeverity(
  final: number,
  confidence: number | null | undefined,
): RiskSeverity {
  const c = Math.max(0, Math.min(1, confidence ?? 0.5));
  for (const r of SEVERITY_RULES) {
    if (r.matches(final, c)) return r.severity;
  }
  return "low";
}

const CANONICAL_TYPES = new Set([
  "loss_factor",
  "stuck_stage",
  "competitor",
  "win_factor",
]);

export type ActionMatrixKind = "matrix" | "win-override" | "default-fallback";

export interface ActionMatrixSummary {
  kind: ActionMatrixKind;
  /** e.g. "loss_factor × critical", "outcome=won → frase positiva", "branch default × high". */
  label: string;
  patternType: string;
  severity: RiskSeverity;
}

/**
 * Identifies which branch of `suggestedActionFor` produced the action.
 * Mirrors backend dispatch order: win-override → canonical type → default.
 */
export function summarizeActionMatrix(
  patternType: string | null | undefined,
  severity: RiskSeverity,
  outcome?: string | null,
): ActionMatrixSummary {
  const type = (patternType ?? "").trim();
  const oc = (outcome ?? "").toLowerCase();

  if (type === "win_factor" || oc === "won") {
    return {
      kind: "win-override",
      label: "outcome=won → frase positiva",
      patternType: type || "win_factor",
      severity,
    };
  }
  if (CANONICAL_TYPES.has(type)) {
    return {
      kind: "matrix",
      label: `${type} × ${severity}`,
      patternType: type,
      severity,
    };
  }
  return {
    kind: "default-fallback",
    label: `branch default × ${severity}`,
    patternType: type || "(vazio)",
    severity,
  };
}
