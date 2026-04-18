import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useDealProbabilityScores } from "@/hooks/revenue/useWinProbabilityCalibration";
import { colorByDelta, confidenceBadgeVariant, confidenceLabel, formatCurrency, formatPercent } from "./calibrationHelpers";
import { Skeleton } from "@/components/ui/skeleton";

export const RecalibratedDealsList: FC = () => {
  const { data, isLoading } = useDealProbabilityScores(200);

  const top = useMemo(() => {
    if (!data) return [];
    // Latest score per sale
    const latest = new Map<string, typeof data[number]>();
    for (const row of data) {
      const prev = latest.get(row.sale_id);
      if (!prev || new Date(row.calculated_at) > new Date(prev.calculated_at)) {
        latest.set(row.sale_id, row);
      }
    }
    return Array.from(latest.values())
      .map((r) => ({ ...r, delta: r.calibrated_probability - r.raw_probability }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 15);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 15 Deals com Maior Shift</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum score recalibrado. Execute uma recalibração.
          </p>
        ) : (
          <ul className="divide-y">
            {top.map((deal) => {
              const sellerName = deal.sales?.salespeople?.name ?? "—";
              return (
                <li key={deal.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {deal.sale_id.slice(0, 8)}…
                      <span className="text-muted-foreground font-normal"> · {sellerName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{formatCurrency(deal.sales?.amount ?? 0)}</span>
                      <span className="capitalize">· {deal.sales?.status}</span>
                      <Badge variant={confidenceBadgeVariant(deal.confidence)} className="text-[10px] h-4">
                        conf. {confidenceLabel(deal.confidence)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                    <span className="text-muted-foreground">{formatPercent(deal.raw_probability, 0)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">{formatPercent(deal.calibrated_probability, 0)}</span>
                    <span className={`font-semibold ml-1 ${colorByDelta(deal.delta)}`}>
                      ({deal.delta >= 0 ? "+" : ""}{deal.delta.toFixed(1)}pp)
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
