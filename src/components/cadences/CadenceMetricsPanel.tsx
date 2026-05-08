import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MessageSquareReply, Target, ListChecks } from "lucide-react";
import { useCadenceMetrics } from "@/hooks/cadences/useCadenceMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export function CadenceMetricsPanel() {
  const { data: metrics, isLoading } = useCadenceMetrics(undefined, 30);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  return (
    <Card className="glass border-border/40 hover-lift-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Métricas por Cadência (últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(!metrics || metrics.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-6">
            Sem dados suficientes ainda. Inscreva prospects em cadências para começar.
          </p>
        )}
        {metrics?.map((m) => (
          <div key={m.cadence_id} className="rounded-lg border border-border/40 p-3 space-y-2 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{m.cadence_name}</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">{m.total_enrolled} inscritos</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ListChecks className="h-3 w-3" /> Conclusão
                </div>
                <div className="text-sm font-semibold tabular-nums">{m.completion_rate}%</div>
                <Progress value={m.completion_rate} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MessageSquareReply className="h-3 w-3" /> Resposta
                </div>
                <div className="text-sm font-semibold tabular-nums text-status-success">{m.reply_rate}%</div>
                <Progress value={m.reply_rate} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3" /> Cliques
                </div>
                <div className="text-sm font-semibold tabular-nums text-amber-500">{m.click_rate ?? 0}%</div>
                <Progress value={m.click_rate ?? 0} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Target className="h-3 w-3" /> Agendados
                </div>
                <div className="text-sm font-semibold tabular-nums text-blue-500">{m.bookings_count ?? 0}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Target className="h-3 w-3" /> Conversão
                </div>
                <div className="text-sm font-semibold tabular-nums text-primary">{m.conversion_rate}%</div>
                <Progress value={m.conversion_rate} className="h-1" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 flex-wrap">
              <span>● {m.active_count} ativos</span>
              <span>● {m.paused_count} pausados</span>
              {m.auto_paused_count > 0 && <span className="text-status-warning">⚡ {m.auto_paused_count} auto-pausados</span>}
              <span>● {m.tasks_completed}/{m.total_tasks} tarefas</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
