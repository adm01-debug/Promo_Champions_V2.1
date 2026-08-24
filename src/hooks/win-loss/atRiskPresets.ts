import type { RiskSeverity } from "@/lib/winloss/severityFromScore";

export type AtRiskPresetId = "all" | "low" | "medium" | "high" | "critical";

export interface AtRiskPreset {
  id: AtRiskPresetId;
  label: string;
  threshold: number;
  limit: number;
  description: string;
}

/**
 * Cumulative score-threshold presets ("Alto+" includes critical).
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

// ─────────────────────────────────────────────────────────────────────────────
// Exact-severity presets — pick a single bucket (non-cumulative).
// Drives the `severityFilter` field in `useAtRiskSettings`.
// ─────────────────────────────────────────────────────────────────────────────

export interface AtRiskSeverityPreset {
  id: RiskSeverity;
  label: string;
  description: string;
  /** Tailwind classes for the active state. */
  activeClass: string;
}

export const AT_RISK_SEVERITY_PRESETS: readonly AtRiskSeverityPreset[] = [
  {
    id: "low",
    label: "Só Baixo",
    description: "Apenas deals com severity = low (score 40–49)",
    activeClass: "bg-muted text-foreground border-muted-foreground/30",
  },
  {
    id: "medium",
    label: "Só Médio",
    description: "Apenas deals com severity = medium (score 50–64)",
    activeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  },
  {
    id: "high",
    label: "Só Alto",
    description: "Apenas deals com severity = high (score 65–79)",
    activeClass: "bg-warning/15 text-warning border-warning/40",
  },
  {
    id: "critical",
    label: "Só Crítico",
    description: "Apenas deals com severity = critical (score ≥80)",
    activeClass: "bg-destructive/15 text-destructive border-destructive/40",
  },
] as const;
