import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, Clock, Zap } from "lucide-react";
import { useLeadAssignments } from "@/hooks/useLeadRoutingEngine";

export function RoutingPerformanceCard() {
  const { data: assignments, isLoading } = useLeadAssignments(200);

  const total = assignments?.length || 0;
  const auto = assignments?.filter((a) => a.strategy_used !== "manual").length || 0;
  const autoPct = total > 0 ? Math.round((auto / total) * 100) : 0;
  const last24h = assignments?.filter(
    (a) => Date.now() - new Date(a.assigned_at).getTime() < 86400000
  ).length || 0;

  const strategies = new Map<string, number>();
  assignments?.forEach((a) => {
    strategies.set(a.strategy_used, (strategies.get(a.strategy_used) || 0) + 1);
  });
  const topStrategy = [...strategies.entries()].sort((a, b) => b[1] - a[1])[0];

  const kpis = [
    { icon: Activity, label: "Total roteado", value: total, tone: "text-primary" },
    { icon: Zap, label: "Automação", value: `${autoPct}%`, tone: "text-status-success" },
    { icon: Clock, label: "Últimas 24h", value: last24h, tone: "text-status-info" },
    {
      icon: Target,
      label: "Estratégia top",
      value: topStrategy ? topStrategy[0] : "—",
      tone: "text-status-warning",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display">Performance de Roteamento</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-lg border bg-card/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <k.icon className={`h-3.5 w-3.5 ${k.tone}`} />
                  <span>{k.label}</span>
                </div>
                <div className="text-xl font-display font-semibold mt-1.5 truncate">
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
