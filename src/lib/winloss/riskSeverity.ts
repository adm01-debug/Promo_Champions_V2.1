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

export interface SeverityDistance {
  /** "score" = needs more pts; "confidence" = score qualifies, only conf is missing. */
  kind: "score" | "confidence";
  /** Pts (0-100) or confidence delta (0-1) needed to reach `target`. */
  delta: number;
  target: RiskSeverity;
}

export interface SeverityExplanation {
  applied: RiskSeverity;
  /** Plain-language reason: "final=85 ≥ 80 ∧ conf=0.82 ≥ 0.70 → critical" */
  reason: string;
  /** True when score qualified for critical but conf < 0.7 demoted to high. */
  demoted: boolean;
  /** Distance to the next level up; null if already critical. */
  distanceToNext: SeverityDistance | null;
  /** Distance below current threshold (pts of margin); null if already low. */
  distanceToPrev: { delta: number; target: RiskSeverity } | null;
}

const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(2));

/**
 * Narrative explanation of why `(final, confidence)` resolves to a severity.
 * Mirrors backend `severityFromScore` and exposes the gaps to neighbouring levels.
 */
export function explainSeverity(
  final: number,
  confidence: number | null | undefined,
): SeverityExplanation {
  const conf = Math.max(0, Math.min(1, confidence ?? 0.5));
  const applied = deriveSeverity(final, conf);

  const demoted = final >= 80 && conf < 0.7;

  let reason: string;
  if (applied === "critical") {
    reason = `final=${fmt(final)} ≥ 80 ∧ conf=${conf.toFixed(2)} ≥ 0.70 → critical`;
  } else if (demoted) {
    reason = `final=${fmt(final)} ≥ 80, mas conf=${conf.toFixed(2)} < 0.70 → demovido para high`;
  } else if (applied === "high") {
    reason = `final=${fmt(final)} ∈ [65, 80) → high`;
  } else if (applied === "medium") {
    reason = `final=${fmt(final)} ∈ [50, 65) → medium`;
  } else {
    reason = `final=${fmt(final)} < 50 → low`;
  }

  let distanceToNext: SeverityDistance | null = null;
  if (applied === "low") {
    distanceToNext = { kind: "score", delta: 50 - final, target: "medium" };
  } else if (applied === "medium") {
    distanceToNext = { kind: "score", delta: 65 - final, target: "high" };
  } else if (applied === "high") {
    if (final >= 80 && conf < 0.7) {
      distanceToNext = { kind: "confidence", delta: +(0.7 - conf).toFixed(2), target: "critical" };
    } else {
      distanceToNext = { kind: "score", delta: 80 - final, target: "critical" };
    }
  }

  let distanceToPrev: SeverityExplanation["distanceToPrev"] = null;
  if (applied === "critical") {
    distanceToPrev = { delta: final - 80 + 1, target: "high" }; // pts above the boundary (inclusive)
    distanceToPrev = { delta: final - 79, target: "high" };
  } else if (applied === "high") {
    distanceToPrev = { delta: final - 64, target: "medium" };
  } else if (applied === "medium") {
    distanceToPrev = { delta: final - 49, target: "low" };
  }

  return { applied, reason, demoted, distanceToNext, distanceToPrev };
}
