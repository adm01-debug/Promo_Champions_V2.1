import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCw, Lightbulb } from "lucide-react";
import { useDealStageVelocity, useDetectStuckDeals } from "@/hooks/deal-intelligence/useStageVelocity";
import {
  formatHours,
  severityBarColor,
  severityClasses,
  severityLabel,
  stageLabel,
} from "./velocityHelpers";
import { StageTransitionsTimeline } from "./StageTransitionsTimeline";

interface Props {
  saleId: string;
}

export function StageVelocityCard({ saleId }: Props) {
  const { data, isLoading } = useDealStageVelocity(saleId);
  const detect = useDetectStuckDeals();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const alert = data?.alert;
  const transitions = data?.transitions || [];

  const ratio =
    alert && alert.baseline_p75 > 0
      ? Math.min(2, alert.hours_in_stage / alert.baseline_p75)
      : 0;
  const ratioPct = Math.min(100, (ratio / 2) * 100);

  return (
    <Card variant="elevated" className="glass border-border/40 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="gradient-text">Velocidade do Estágio</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => detect.mutate()}
            disabled={detect.isPending}
            className="h-7 w-7 p-0"
            aria-label="Recalcular alertas"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${detect.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alert ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Estágio: </span>
                  <span className="font-medium">{stageLabel(alert.current_stage)}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${severityClasses(alert.severity)}`}>
                  {severityLabel(alert.severity)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                  <div className="text-muted-foreground">No estágio</div>
                  <div className="text-base font-semibold tabular-nums">
                    {formatHours(alert.hours_in_stage)}
                  </div>
                </div>
                <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                  <div className="text-muted-foreground">Baseline p75</div>
                  <div className="text-base font-semibold tabular-nums">
                    {formatHours(alert.baseline_p75)}
                  </div>
                </div>
              </div>
              {alert.baseline_p75 > 0 && (
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${severityBarColor(alert.severity)} transition-all duration-500`}
                      style={{ width: `${ratioPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0</span>
                    <span>p75</span>
                    <span>2× p75</span>
                  </div>
                </div>
              )}
            </div>

            {alert.recommendation && (
              <div className="p-2 rounded-md border border-primary/20 bg-primary/5 flex gap-2">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/90 leading-snug">{alert.recommendation}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sem alerta ativo. Esse deal está dentro do tempo esperado.
          </p>
        )}

        {transitions.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Linha do tempo
            </div>
            <StageTransitionsTimeline transitions={transitions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
