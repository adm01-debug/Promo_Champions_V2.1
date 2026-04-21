export type AtRiskPresetId = "all" | "low" | "medium" | "high" | "critical";

export interface AtRiskPreset {
  id: AtRiskPresetId;
  label: string;
  threshold: number;
  limit: number;
  description: string;
}

/**
 * Quick presets to toggle (threshold, limit) in the AtRisk panel.
 * Thresholds align with `severityFromScore` boundaries (40/50/65/80).
 */
export const AT_RISK_PRESETS: readonly AtRiskPreset[] = [
  { id: "all",      label: "Tudo",    threshold: 0,  limit: 50, description: "Threshold ≥0 · até 50 deals" },
  { id: "low",      label: "Baixo+",  threshold: 40, limit: 20, description: "Threshold ≥40 · até 20 deals" },
  { id: "medium",   label: "Médio+",  threshold: 50, limit: 20, description: "Threshold ≥50 · até 20 deals" },
  { id: "high",     label: "Alto+",   threshold: 65, limit: 15, description: "Threshold ≥65 · até 15 deals" },
  { id: "critical", label: "Crítico", threshold: 80, limit: 10, description: "Threshold ≥80 · até 10 deals" },
] as const;

/** Returns the preset id whose (threshold, limit) match exactly; null otherwise. */
export function detectActivePreset(
  threshold: number,
  limit: number,
): AtRiskPresetId | null {
  return (
    AT_RISK_PRESETS.find((p) => p.threshold === threshold && p.limit === limit)?.id ?? null
  );
}

export function getPresetById(id: AtRiskPresetId): AtRiskPreset | undefined {
  return AT_RISK_PRESETS.find((p) => p.id === id);
}
