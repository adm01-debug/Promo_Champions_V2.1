import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQuotaAttainmentAlerts, useAcknowledgeQuotaAlert } from "@/hooks/revenue/useQuotaAttainment";

export const QuotaAttainmentAlertsPanel: FC = () => {
  const { data: alerts = [], isLoading } = useQuotaAttainmentAlerts();
  const ack = useAcknowledgeQuotaAlert();

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alertas ativos
          <Badge variant="secondary" className="ml-auto">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && alerts.length === 0 && (
          <div className="flex flex-col items-center text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-success mb-2" />
            <p className="text-sm">Nenhum alerta ativo. Time no ritmo.</p>
          </div>
        )}
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={a.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">
                  {a.severity.toUpperCase()}
                </Badge>
                <p className="text-sm font-medium truncate">{a.message}</p>
              </div>
              {a.recommended_action && (
                <p className="text-xs text-muted-foreground">{a.recommended_action}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => ack.mutate(a.id)}
              disabled={ack.isPending}
            >
              Ack
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
