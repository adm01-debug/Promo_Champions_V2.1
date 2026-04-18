import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart3 } from "lucide-react";
import { useStageBaselines, useRefreshStageBaselines } from "@/hooks/deal-intelligence/useStageBaselines";

export function StageBaselinesPanel() {
  const { data, isLoading } = useStageBaselines();
  const refresh = useRefreshStageBaselines();

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Baselines por estágio
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refresh.isPending ? "animate-spin" : ""}`} />
            Recalcular
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sem baselines calculadas. Clique em recalcular para gerar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/40">
                  <th className="py-2 font-medium">Estágio</th>
                  <th className="py-2 font-medium text-right">Média (d)</th>
                  <th className="py-2 font-medium text-right">Mediana (d)</th>
                  <th className="py-2 font-medium text-right">P75 (d)</th>
                  <th className="py-2 font-medium text-right">Amostras</th>
                </tr>
              </thead>
              <tbody>
                {data.map(b => (
                  <tr key={b.id} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-2 font-medium capitalize">{b.stage}</td>
                    <td className="py-2 text-right tabular-nums">{Number(b.avg_days).toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums">{Number(b.median_days).toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums">{Number(b.p75_days).toFixed(1)}</td>
                    <td className="py-2 text-right">
                      <Badge variant="outline" className="text-[10px]">{b.sample_size}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
