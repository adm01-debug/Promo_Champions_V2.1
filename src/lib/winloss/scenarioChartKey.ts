/**
 * Builds a deterministic, compact key for the scenario forecast chart.
 *
 * Recharts uses the `key` prop to decide whether to fully reset internal
 * state (scales, axes, tooltip cache). A naive concat-everything key both
 * (a) explodes in size for long horizons and (b) is fragile when the
 * series momentarily contains `undefined`/`NaN` during query rehydration.
 *
 * Three explicit states:
 *   - empty        → constant "scenario-empty"  (no remount churn while empty)
 *   - insufficient → "scenario-insufficient-{fitN}-{firstPeriod}"
 *   - ready        → "scenario-{mode}-z{z}-h{h}-n{N}-fit{fitN}-σ{σ}-{hash}"
 *
 * The signature uses a djb2 hash (32-bit hex) instead of raw concatenation,
 * keeping keys short while preserving anti-collision guarantees.
 */
import type { BandMode } from "@/hooks/win-loss/useWinLossScenarios";

export interface ScenarioChartKeyPoint {
  period?: string;
  realistic: number;
  pessimistic: number;
  optimistic: number;
  isForecast: boolean;
}

export interface ScenarioChartKeyInput {
  data: ScenarioChartKeyPoint[];
  fitN: number;
  bandMode: BandMode;
  confidenceZ: number;
  horizon: number;
  stdDev: number;
  /** Confidence level for PI mode (0.90 / 0.95 / 0.99). Default 0.95. */
  confidenceLevel?: number;
}

const isBadNumber = (n: unknown): boolean =>
  typeof n !== "number" || !Number.isFinite(n);

/** djb2 — small, fast, deterministic, no deps. */
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildScenarioChartKey({
  data,
  fitN,
  bandMode,
  confidenceZ,
  horizon,
  stdDev,
  confidenceLevel = 0.95,
}: ScenarioChartKeyInput): string {
  if (!data || data.length === 0 || fitN === 0) {
    return "scenario-empty";
  }

  if (fitN < 3) {
    const first = data[0]?.period ?? "x";
    return `scenario-insufficient-${fitN}-${first}`;
  }

  let partial = false;
  let payload = "";
  for (const d of data) {
    if (
      !d.period ||
      isBadNumber(d.realistic) ||
      isBadNumber(d.optimistic) ||
      isBadNumber(d.pessimistic)
    ) {
      partial = true;
      continue;
    }
    payload += `${d.period}:${d.realistic}:${d.pessimistic}:${d.optimistic}:${d.isForecast ? 1 : 0}|`;
  }

  const sig = djb2(payload);
  const safeStd = Number.isFinite(stdDev) ? stdDev.toFixed(2) : "0.00";
  const safeZ = Number.isFinite(confidenceZ) ? confidenceZ.toFixed(2) : "1.00";
  const safeLvl = Number.isFinite(confidenceLevel) ? confidenceLevel.toFixed(2) : "0.95";

  return `scenario-${bandMode}-z${safeZ}-l${safeLvl}-h${horizon}-n${data.length}-fit${fitN}-σ${safeStd}-${sig}${partial ? "-partial" : ""}`;
}
