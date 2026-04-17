import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Users, TrendingUp } from "lucide-react";
import { useCohortRetention, type CohortMetric } from "@/hooks/reporting/useCohortRetention";
import { getHeatmapColor, avgRetentionAt } from "./cohortHelpers";
import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  embedded?: boolean;
  defaultPeriods?: number;
  defaultMetric?: CohortMetric;
}

export const CohortHeatmap = memo(({ embedded = false, defaultPeriods = 12, defaultMetric = "orders" }: Props) => {
  const [periods, setPeriods] = useState<number>(defaultPeriods);
  const [metric, setMetric] = useState<CohortMetric>(defaultMetric);

  const { data: rows, isLoading, error } = useCohortRetention({ periods, metric });

  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      cohorts: list.length,
      m1: avgRetentionAt(list, 1),
      m3: avgRetentionAt(list, 3),
      m6: avgRetentionAt(list, 6),
    };
  }, [rows]);

  const cohortsCount = useCountUp(stats.cohorts, { duration: 800 });
  const m1 = useCountUp(stats.m1, { duration: 800, decimals: 1 });
  const m3 = useCountUp(stats.m3, { duration: 800, decimals: 1 });
  const m6 = useCountUp(stats.m6, { duration: 800, decimals: 1 });

  const periodLabels = useMemo(
    () => Array.from({ length: periods }, (_, i) => `M${i}`),
    [periods]
  );

  const Wrapper = embedded ? "div" : Card;
  const wrapperProps = embedded ? { className: "space-y-4" } : { className: "glass border-border/50" };

  return (
    <Wrapper {...(wrapperProps as Record<string, unknown>)}>
      {!embedded && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2 font-display">
              <Grid3x3 className="h-5 w-5 text-primary" />
              Cohort Heatmap — Retenção
            </CardTitle>
            <div className="flex gap-2">
              <Select value={String(periods)} onValueChange={(v) => setPeriods(Number(v))}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metric} onValueChange={(v) => setMetric(v as CohortMetric)}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Pedidos</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            % de clientes ativos por mês relativo à aquisição. Cores mais quentes = maior retenção.
          </p>
        </CardHeader>
      )}

      <CardContent className={embedded ? "p-0 space-y-4" : ""}>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Users} label="Cohorts ativas" value={`${cohortsCount}`} />
          <KpiCard icon={TrendingUp} label="Retenção média M1" value={`${m1}%`} accent />
          <KpiCard icon={TrendingUp} label="Retenção média M3" value={`${m3}%`} />
          <KpiCard icon={TrendingUp} label="Retenção média M6" value={`${m6}%`} />
        </div>

        {/* Heatmap */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        ) : error ? (
          <div className="text-sm text-destructive py-6 text-center">
            Erro ao carregar cohort: {(error as Error).message}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border/50 rounded-lg">
            Sem dados de cohort no período selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border/40">
            <TooltipProvider delayDuration={120}>
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10">
                      Cohort
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-muted-foreground">Tam.</th>
                    {periodLabels.map((l) => (
                      <th key={l} className="text-center px-1.5 py-2 font-medium text-muted-foreground min-w-[44px]">
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <motion.tr
                      key={row.cohortKey}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: rIdx * 0.03, ease: "easeOut" }}
                      className="border-t border-border/30"
                    >
                      <td className="px-3 py-1.5 font-medium whitespace-nowrap sticky left-0 bg-card z-10">
                        {row.cohortLabel}
                      </td>
                      <td className="text-center px-2 py-1.5 text-muted-foreground tabular-nums">
                        {row.cohortSize}
                      </td>
                      {periodLabels.map((_, i) => {
                        const val = row.retention[i];
                        const abs = row.absolute[i];
                        if (val === undefined) {
                          return <td key={i} className="px-1 py-1" />;
                        }
                        const { background, text } = getHeatmapColor(val, 100);
                        return (
                          <td key={i} className="px-0.5 py-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="rounded px-1.5 py-1 text-center font-medium tabular-nums transition-transform hover:scale-105 cursor-default"
                                  style={{ background, color: text }}
                                >
                                  {val.toFixed(0)}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <div className="font-semibold">{row.cohortLabel} · M{i}</div>
                                <div className="text-muted-foreground">
                                  {val.toFixed(1)}% · {abs} {metric === "revenue" ? "BRL" : "ativos"}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </TooltipProvider>
          </div>
        )}

        {!isLoading && rows && rows.length > 0 && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground">Menos retido</span>
            <div className="h-2 w-32 rounded-full bg-gradient-to-r from-muted via-primary/40 to-primary" />
            <span className="text-[10px] text-muted-foreground">Mais retido</span>
          </div>
        )}
      </CardContent>
    </Wrapper>
  );
});
CohortHeatmap.displayName = "CohortHeatmap";

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}
function KpiCard({ icon: Icon, label, value, accent }: KpiCardProps) {
  return (
    <div className={`rounded-lg border p-3 transition-colors ${accent ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card/50"}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-display tabular-nums">{value}</div>
    </div>
  );
}
