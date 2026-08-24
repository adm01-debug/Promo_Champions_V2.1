/**
 * Public barrel for win-loss at-risk utilities used by the UI.
 * Re-exports the canonical fixtures + dominant-pattern catalog and the
 * shared risk reason codes / labels.
 */
export * from "./atRiskFixtures";
export * from "./riskReasons";
export {
  SEVERITY_RULES,
  deriveSeverity,
  summarizeActionMatrix,
  explainSeverity,
  type SeverityRule,
  type ActionMatrixKind,
  type ActionMatrixSummary,
  type SeverityDistance,
  type SeverityExplanation,
} from "./riskSeverity";
