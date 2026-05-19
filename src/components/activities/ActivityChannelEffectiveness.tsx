import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityStats, ActivityType } from "@/hooks/activities/useActivities";
import { activityIcons, activityLabels } from "./activityConstants";
import { BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ActivityChannelEffectiveness() {
  const { data: stats } = useActivityStats();

  if (!stats) return null;

  const channelMetrics = Object.entries(stats.byTypeOutcome).map(([type, outcomes]) => {
    const total = stats.byType[type as ActivityType] || 0;
    const meaningful = (outcomes.connected || 0) + (outcomes.scheduled || 0) + (outcomes.qualified || 0);
    const rate = total > 0 ? (meaningful / total) * 100 : 0;
    
    return {
      type: type as ActivityType,
      total,
      rate,
      icon: activityIcons[type as ActivityType],
      label: activityLabels[type as ActivityType]
    };
  }).filter(m => m.total > 0).sort((a, b) => b.rate - a.rate);

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          Efetividade por Canal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channelMetrics.length > 0 ? (
          channelMetrics.map((metric) => (
            <div key={metric.type} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{metric.total} atividades</span>
                  <span className="text-xs font-bold font-display">{metric.rate.toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={metric.rate} className="h-1 bg-muted/30" />
            </div>
          ))
        ) : (
          <p className="text-[10px] text-center text-muted-foreground py-4">
            Aguardando dados suficientes...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
