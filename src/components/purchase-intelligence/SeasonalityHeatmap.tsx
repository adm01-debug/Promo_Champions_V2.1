import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays } from "lucide-react";
import { useGlobalSeasonality } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import { DOW_LABELS_PT, MONTH_LABELS_PT, formatBRL, intensityColor } from "./purchaseIntelligenceHelpers";

export function SeasonalityHeatmap() {
  const { data, isLoading } = useGlobalSeasonality();

  const matrix = useMemo(() => {
    const grid: Record<string, { revenue: number; deals: number }> = {};
    let max = 0;
    for (const r of data ?? []) {
      const k = `${r.month_of_year}-${r.day_of_week}`;
      const cur = grid[k] ?? { revenue: 0, deals: 0 };
      cur.revenue += Number(r.total_revenue);
      cur.deals += Number(r.deal_count);
      if (cur.revenue > max) max = cur.revenue;
      grid[k] = cur;
    }
    return { grid, max };
  }, [data]);

  if (isLoading) return <Skeleton className="h-80 rounded-xl" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Sazonalidade Global (Mês × Dia da semana)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-xs font-medium text-muted-foreground pr-2"></th>
                  {DOW_LABELS_PT.map((d) => (
                    <th key={d} className="text-xs font-medium text-muted-foreground px-1 min-w-[44px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTH_LABELS_PT.map((mLabel, mIdx) => (
                  <tr key={mLabel}>
                    <td className="text-xs font-medium text-muted-foreground pr-2">{mLabel}</td>
                    {DOW_LABELS_PT.map((_, dIdx) => {
                      const k = `${mIdx + 1}-${dIdx}`;
                      const cell = matrix.grid[k];
                      const bg = cell ? intensityColor(cell.revenue, matrix.max) : "hsl(var(--muted) / 0.25)";
                      return (
                        <td key={k} className="p-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="h-8 w-11 rounded-sm border border-border/30 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: bg }}
                              />
                            </TooltipTrigger>
                            {cell && (
                              <TooltipContent>
                                <div className="text-xs space-y-0.5">
                                  <div className="font-semibold">
                                    {mLabel} · {DOW_LABELS_PT[dIdx]}
                                  </div>
                                  <div>{formatBRL(cell.revenue)} · {cell.deals} vendas</div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
