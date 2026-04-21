import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtRiskFromPatterns } from "@/hooks/win-loss/useAtRiskFromPatterns";

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

const tone = (score: number) =>
  score >= 75 ? "border-destructive/40 bg-destructive/10 text-destructive" :
  score >= 50 ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
  "border-muted bg-muted text-muted-foreground";

export function AtRiskDealsFromPatterns() {
  const { data = [], isLoading, refresh, isRefreshing } = useAtRiskFromPatterns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
          Deals em risco — padrões de loss
          <Button size="sm" variant="ghost" className="ml-auto h-7 px-2" onClick={() => refresh()} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !data.length ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum deal aberto cruza padrões críticos no momento.</p>
        ) : (
          <ul className="space-y-2" aria-label="Deals em risco identificados">
            {data.slice(0, 8).map(d => (
              <li key={d.sale_id} className={`rounded-md border px-3 py-2 ${tone(d.risk_score)}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.client_name ?? "Cliente"}</p>
                    <p className="text-[11px] opacity-80 truncate">{d.matched_pattern}</p>
                  </div>
                  <Badge variant="outline" className="tabular-nums shrink-0">{d.risk_score}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] opacity-75">{d.suggested_action}</p>
                  <span className="text-[11px] tabular-nums font-medium">{fmtBRL(d.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
