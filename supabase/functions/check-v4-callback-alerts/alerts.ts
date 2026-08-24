export type AlertKind = "high_failure_rate" | "exhausted_spike" | "pending_backlog";

export interface AlertContext {
  windowMinutes: number;
  minEvents: number;
  failureRateThreshold: number;
  exhaustedThreshold24h: number;
  pendingThreshold: number;
  ok: number;
  failed: number;
  exhausted24h: number;
  pending: number;
}

export function evaluateAlerts(ctx: AlertContext): Array<{ kind: AlertKind; details: Record<string, unknown> }> {
  const alerts: Array<{ kind: AlertKind; details: Record<string, unknown> }> = [];
  const totalEvents = ctx.ok + ctx.failed;
  if (totalEvents >= ctx.minEvents) {
    const rate = (ctx.failed / totalEvents) * 100;
    if (rate >= ctx.failureRateThreshold) {
      alerts.push({
        kind: "high_failure_rate",
        details: { failure_rate_pct: Number(rate.toFixed(2)), ok: ctx.ok, failed: ctx.failed, window_minutes: ctx.windowMinutes, threshold: ctx.failureRateThreshold },
      });
    }
  }
  if (ctx.exhausted24h >= ctx.exhaustedThreshold24h) {
    alerts.push({ kind: "exhausted_spike", details: { exhausted_24h: ctx.exhausted24h, threshold: ctx.exhaustedThreshold24h } });
  }
  if (ctx.pending >= ctx.pendingThreshold) {
    alerts.push({ kind: "pending_backlog", details: { pending: ctx.pending, threshold: ctx.pendingThreshold } });
  }
  return alerts;
}
