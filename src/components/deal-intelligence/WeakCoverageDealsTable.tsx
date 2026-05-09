import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle } from "lucide-react";
import { useWeakCoverageDeals } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import { tierBadgeClass, tierLabel, dmuRoleLabel, type CoverageTier, type DMURole } from "./committeeHelpers";

export function WeakCoverageDealsTable({ onSelectDeal }: { onSelectDeal?: (saleId: string) => void }) {
  const { data, isLoading } = useWeakCoverageDeals();

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          <span className="gradient-text">Deals com cobertura fraca de comitê</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum deal com cobertura fraca. Comitês bem mapeados! 🎯
          </p>
        ) : (
          <div className="space-y-2">
            {data.map((row: any) => (
              <div 
                key={row.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg glass border transition-all cursor-pointer",
                  "border-border/30 hover:border-primary/50"
                )}
                onClick={() => onSelectDeal?.(row.sale_id)}
              >
                <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-muted">
                  <span className="font-display font-bold text-sm tabular-nums">{row.coverage_score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{row.sales?.client_name ?? "—"}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className={tierBadgeClass(row.tier as CoverageTier)}>
                      {tierLabel(row.tier as CoverageTier)}
                    </Badge>
                    {row.gaps?.slice(0, 3).map((g: string) => (
                      <Badge key={g} variant="outline" className="text-[10px]">
                        Falta {dmuRoleLabel(g as DMURole)}
                      </Badge>
                    ))}
                  </div>
                </div>
                {(row.risks?.length ?? 0) > 0 && (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" aria-label="Tem riscos" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
