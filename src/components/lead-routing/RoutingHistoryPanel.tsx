import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLeadAssignments } from "@/hooks/useLeadRoutingEngine";
import { formatStrategy, strategyTone } from "./routingHelpers";

export function RoutingHistoryPanel() {
  const { data, isLoading } = useLeadAssignments(30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <History className="h-4 w-4 text-primary" />
          Histórico de Atribuições
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sem atribuições recentes</p>
          </div>
        ) : (
          <div className="divide-y">
            {data.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      Lead <span className="font-mono">{a.sale_id.slice(0, 8)}</span>
                      <ArrowRight className="inline h-3 w-3 mx-1" />
                      <span className="font-mono">{a.salesperson_id.slice(0, 8)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.assigned_at), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${strategyTone(a.strategy_used)}`}>
                  {formatStrategy(a.strategy_used)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
