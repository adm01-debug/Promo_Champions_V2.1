import { Progress } from "@/components/ui/progress";
import type { ConversationMetrics } from "./metricsHelpers";
import { formatPct } from "./metricsHelpers";

interface Props { metrics: ConversationMetrics; }

export function EngagementBreakdown({ metrics }: Props) {
  const balance = 1 - Math.abs(metrics.seller_talk_ratio - 0.5) * 2;
  const silenceOk = 1 - Math.min(1, metrics.silence_ratio / 0.3);
  const interruptOk = 1 - Math.min(1, metrics.interruptions_count / 8);
  const monologueOk = 1 - Math.min(1, metrics.longest_monologue_seconds / 180);

  const rows = [
    { label: "Balanço de fala", value: balance, hint: `Vendedor ${formatPct(metrics.seller_talk_ratio)}` },
    { label: "Baixo silêncio", value: silenceOk, hint: `Silêncio ${formatPct(metrics.silence_ratio)}` },
    { label: "Sem interrupções", value: interruptOk, hint: `${metrics.interruptions_count} interrupções` },
    { label: "Monólogos curtos", value: monologueOk, hint: `Maior ${metrics.longest_monologue_seconds}s` },
  ];

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = Math.round(r.value * 100);
        const color = pct >= 75 ? "bg-success" : pct >= 50 ? "bg-info" : pct >= 25 ? "bg-warning" : "bg-destructive";
        return (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{r.label}</span>
              <span className="text-muted-foreground">{r.hint}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
