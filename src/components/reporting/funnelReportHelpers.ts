/**
 * Helpers for FunnelReportView — pure functions, easily testable.
 */

export interface FunnelStageBasic {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface StageDelta {
  stage: string;
  countDelta: number;
  countDeltaPct: number;
  valueDelta: number;
  conversionDelta: number;
}

export const computeStageDeltas = (
  current: FunnelStageBasic[],
  previous: FunnelStageBasic[],
): StageDelta[] => {
  const prevMap = new Map(previous.map((p) => [p.stage, p]));
  return current.map((c) => {
    const p = prevMap.get(c.stage);
    const prevCount = p?.count ?? 0;
    const countDelta = c.count - prevCount;
    const countDeltaPct = prevCount > 0 ? (countDelta / prevCount) * 100 : c.count > 0 ? 100 : 0;
    return {
      stage: c.stage,
      countDelta,
      countDeltaPct: Math.round(countDeltaPct * 10) / 10,
      valueDelta: c.value - (p?.value ?? 0),
      conversionDelta: Math.round((c.conversionRate - (p?.conversionRate ?? 0)) * 10) / 10,
    };
  });
};

export const formatDelta = (n: number, type: "pct" | "abs" | "currency" = "abs"): string => {
  const sign = n > 0 ? "+" : "";
  if (type === "pct") return `${sign}${n.toFixed(1)}%`;
  if (type === "currency") {
    return `${sign}${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(n)}`;
  }
  return `${sign}${n.toLocaleString("pt-BR")}`;
};

/**
 * Returns an HSL color from primary toward accent based on stage position.
 * Uses semantic tokens via hsl(var(--primary)) variations.
 */
export const getStageColor = (index: number, total: number): string => {
  if (total <= 1) return "hsl(var(--primary))";
  // Interpolate alpha/lightness across primary
  const opacity = 1 - (index / total) * 0.45;
  return `hsl(var(--primary) / ${opacity.toFixed(2)})`;
};

/**
 * Width percentage proportional to count vs first (largest) stage.
 */
export const getStageWidth = (count: number, maxCount: number): number => {
  if (maxCount <= 0) return 0;
  return Math.max(15, Math.round((count / maxCount) * 100));
};
