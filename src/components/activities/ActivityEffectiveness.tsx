import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityStats } from "@/hooks/useActivities";
import { Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ActivityEffectiveness() {
  const { data: stats } = useActivityStats();

  // Calculation logic
  const total = stats?.total ?? 0;
  const connected = (stats?.byOutcome.connected ?? 0) + (stats?.byOutcome.scheduled ?? 0) + (stats?.byOutcome.qualified ?? 0) + (stats?.byOutcome.callback ?? 0);
  const scheduled = stats?.byOutcome.scheduled ?? 0;
  const qualified = stats?.byOutcome.qualified ?? 0;
  const badTiming = stats?.byOutcome.bad_timing ?? 0;
  const wrongPerson = stats?.byOutcome.wrong_person ?? 0;
  const unsubscribed = stats?.byOutcome.unsubscribed ?? 0;
  const noAnswer = stats?.byOutcome.no_answer ?? 0;
  const voicemail = stats?.byOutcome.voicemail ?? 0;

  const connectionRate = total > 0 ? (connected / total) * 100 : 0;
  const schedulingRate = connected > 0 ? (scheduled / connected) * 100 : 0;
  const qualificationRate = connected > 0 ? (qualified / connected) * 100 : 0;

  const metrics = [
    {
      label: "Taxa de Conexão",
      value: connectionRate,
      icon: Zap,
      description: "Contatos efetivos vs tentativas",
      color: "text-amber-500",
      progressColor: "bg-amber-500"
    },
    {
      label: "Taxa de Agendamento",
      value: schedulingRate,
      icon: Target,
      description: "Agendamentos vs conexões",
      color: "text-blue-500",
      progressColor: "bg-blue-500"
    },
    {
      label: "Taxa de Qualificação",
      value: qualificationRate,
      icon: TrendingUp,
      description: "Leads qualificados vs conexões",
      color: "text-emerald-500",
      progressColor: "bg-emerald-500"
    },
    {
      label: "Taxa de Rejeição",
      value: total > 0 ? ((badTiming + wrongPerson + unsubscribed) / total) * 100 : 0,
      icon: TrendingUp,
      description: "Descarte vs tentativas",
      color: "text-red-500",
      progressColor: "bg-red-500"
    }
  ];

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Efetividade SDR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded bg-muted/50 ${metric.color}`}>
                  <metric.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">{metric.label}</p>
                  <p className="text-[10px] text-muted-foreground">{metric.description}</p>
                </div>
              </div>
              <span className="text-sm font-bold font-display">
                {metric.value.toFixed(1)}%
              </span>
            </div>
            <Progress value={metric.value} className={`h-1.5 ${metric.progressColor}/20`} />
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/40">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversão Final</p>
              <p className="text-lg font-bold font-display gradient-text">
                {total > 0 ? ((scheduled + qualified) / total * 100).toFixed(1) : "0.0"}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média Duração</p>
              <p className="text-lg font-bold font-display">
                {(stats?.avgDuration ?? 0).toFixed(0)} min
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
