import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, Activity, Server, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminSystemStatusProps {
  edgeStatus: {
    bitrixLastSync: { status: string; created_at: string } | null;
    openCircuits: Array<{ circuit_name: string }>;
  } | undefined;
  queryMetrics: {
    totalQueries: number;
    avgDuration: number;
    slowQueries: number;
  };
}

const EDGE_FUNCTIONS = [
  { name: "sdr-consecutive-alerts", schedule: "8h diário" },
  { name: "activity-goal-alerts", schedule: "15h diário" },
  { name: "access-denied-alerts", schedule: "Horário" },
  { name: "auto-reassign-inactive", schedule: "6h diário" },
  { name: "bitrix24-sync", schedule: "Horário" },
  { name: "check-lead-sla", schedule: "Configurável" },
];

export function AdminSystemStatus({ edgeStatus, queryMetrics }: AdminSystemStatusProps) {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-chart-3/20 to-chart-3/5">
            <Server className="h-4 w-4 text-chart-3" />
          </div>
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />Edge Functions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {EDGE_FUNCTIONS.map((fn) => (
              <div key={fn.name} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{fn.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fn.schedule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Bitrix24 Sync</span>
            </div>
            {edgeStatus?.bitrixLastSync ? (
              <Badge variant={edgeStatus.bitrixLastSync.status === "success" ? "default" : "destructive"}>
                {edgeStatus.bitrixLastSync.status === "success" ? "OK" : "Erro"}
              </Badge>
            ) : <Badge variant="secondary">Sem dados</Badge>}
          </div>
          {edgeStatus?.bitrixLastSync && (
            <p className="text-xs text-muted-foreground mt-2">
              Última sync: {format(new Date(edgeStatus.bitrixLastSync.created_at), "dd/MM HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-4" /><span className="text-sm font-medium">Circuit Breakers</span>
            </div>
            {edgeStatus?.openCircuits?.length === 0 ? (
              <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">Todos fechados</Badge>
            ) : (
              <Badge variant="destructive">{edgeStatus?.openCircuits?.length} aberto(s)</Badge>
            )}
          </div>
          {edgeStatus?.openCircuits && edgeStatus.openCircuits.length > 0 && (
            <div className="space-y-1">
              {edgeStatus.openCircuits.map((circuit, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-destructive">
                  <XCircle className="h-3 w-3" />{circuit.circuit_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-5" /><span className="text-sm font-medium">Performance Queries</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-lg font-bold">{queryMetrics.totalQueries}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
            <div><p className="text-lg font-bold">{queryMetrics.avgDuration}ms</p><p className="text-[10px] text-muted-foreground">Média</p></div>
            <div><p className="text-lg font-bold text-warning">{queryMetrics.slowQueries}</p><p className="text-[10px] text-muted-foreground">Lentas</p></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
