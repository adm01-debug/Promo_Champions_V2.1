import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { useStuckDeals, useDetectStuckDeals } from "@/hooks/deal-intelligence/useStageVelocity";
import {
  formatHours,
  severityClasses,
  severityLabel,
  stageLabel,
  type StageSeverity,
} from "./velocityHelpers";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function StuckDealsPanel() {
  const { data, isLoading } = useStuckDeals(15);
  const detect = useDetectStuckDeals();

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>Deals Presos</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => detect.mutate()}
            disabled={detect.isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${detect.isPending ? "animate-spin" : ""}`} />
            Detectar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum deal preso identificado.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Detectar" para rodar a análise.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {data.map((row: any) => {
              const sale = row.sales;
              const severity = row.severity as StageSeverity;
              return (
                <div
                  key={row.id}
                  className="p-3 rounded-lg border border-border/40 bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{sale?.client_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {sale?.product_name || "—"} · {formatBRL(Number(sale?.amount || 0))}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${severityClasses(severity)}`}>
                      {severityLabel(severity)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] mb-2">
                    <div>
                      <div className="text-muted-foreground">Estágio</div>
                      <div className="font-medium">{stageLabel(row.current_stage)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">No estágio</div>
                      <div className="font-medium tabular-nums">{formatHours(row.hours_in_stage)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Baseline p75</div>
                      <div className="font-medium tabular-nums">{formatHours(row.baseline_p75)}</div>
                    </div>
                  </div>
                  {row.recommendation && (
                    <p className="text-[11px] text-foreground/80 leading-snug border-t border-border/30 pt-2">
                      💡 {row.recommendation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
