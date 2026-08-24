import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CohortRow {
  cohort_month: string;
  cohort_size: number;
  month_offset: number;
  retained: number;
  retention_pct: number;
}

interface CohortCell {
  offset: number;
  pct: number;
  retained: number;
}

interface CohortMatrix {
  month: string;
  label: string;
  size: number;
  cells: Map<number, CohortCell>;
}

const OFFSETS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Heat cell background using semantic tokens with opacity.
 * 0% → muted, 100% → primary.
 */
function cellClass(pct: number | undefined): string {
  if (pct === undefined) return "bg-muted/30 text-muted-foreground";
  if (pct >= 80) return "bg-primary text-primary-foreground";
  if (pct >= 60) return "bg-primary/70 text-primary-foreground";
  if (pct >= 40) return "bg-primary/50 text-foreground";
  if (pct >= 20) return "bg-primary/30 text-foreground";
  if (pct > 0) return "bg-primary/15 text-foreground";
  return "bg-muted/30 text-muted-foreground";
}

export function CohortRetentionHeatmap() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cohort-retention", 12],
    queryFn: async (): Promise<CohortRow[]> => {
      const { data, error } = await supabase.rpc("compute_salesperson_retention_cohort", {
        _months_back: 12,
      });
      if (error) throw error;
      return (data ?? []) as CohortRow[];
    },
    staleTime: 5 * 60_000,
  });

  const matrix = useMemo<CohortMatrix[]>(() => {
    if (!data?.length) return [];
    const map = new Map<string, CohortMatrix>();
    for (const row of data) {
      let entry = map.get(row.cohort_month);
      if (!entry) {
        entry = {
          month: row.cohort_month,
          label: format(parseISO(row.cohort_month), "MMM/yy", { locale: ptBR }),
          size: row.cohort_size,
          cells: new Map(),
        };
        map.set(row.cohort_month, entry);
      }
      entry.cells.set(row.month_offset, {
        offset: row.month_offset,
        pct: Number(row.retention_pct) || 0,
        retained: row.retained,
      });
    }
    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [data]);

  const avgRetentionM1 = useMemo(() => {
    const vals = matrix.map((m) => m.cells.get(1)?.pct).filter((v): v is number => v !== undefined);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [matrix]);

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-section-title">Retenção por Cohort de Vendedores</CardTitle>
          </div>
          {avgRetentionM1 !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>
                Média M+1: <strong className="text-foreground">{avgRetentionM1}%</strong>
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          % de vendedores que fecharam ao menos 1 deal em cada mês após o primeiro ganho.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Falha ao carregar cohort. Tente novamente.</p>
        ) : matrix.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados de vendas para calcular cohorts.</p>
        ) : (
          <TooltipProvider delayDuration={100}>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-card text-left font-medium text-muted-foreground pr-2">
                      Cohort
                    </th>
                    <th className="text-muted-foreground font-medium px-2">Vend.</th>
                    {OFFSETS.map((o) => (
                      <th key={o} className="text-muted-foreground font-medium min-w-[42px]">
                        M+{o}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.month}>
                      <td className="sticky left-0 bg-card font-medium text-foreground pr-2 whitespace-nowrap">
                        {row.label}
                      </td>
                      <td className="text-center text-muted-foreground font-mono">{row.size}</td>
                      {OFFSETS.map((offset) => {
                        const cell = row.cells.get(offset);
                        return (
                          <td key={offset}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-8 rounded-md flex items-center justify-center font-mono text-[11px] font-medium transition-transform hover:scale-110 cursor-default ${cellClass(cell?.pct)}`}
                                  aria-label={
                                    cell
                                      ? `Cohort ${row.label}, mês +${offset}: ${cell.pct}% (${cell.retained} de ${row.size})`
                                      : `Cohort ${row.label}, mês +${offset}: sem dado`
                                  }
                                >
                                  {cell ? `${Math.round(cell.pct)}` : "—"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <div className="space-y-0.5">
                                  <div className="font-semibold">
                                    {row.label} · M+{offset}
                                  </div>
                                  {cell ? (
                                    <>
                                      <div>
                                        <strong>{cell.pct}%</strong> de retenção
                                      </div>
                                      <div className="text-muted-foreground">
                                        {cell.retained} de {row.size} vendedores ativos
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-muted-foreground">Sem dados</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Menor</span>
              <div className="flex gap-1">
                <div className="h-3 w-6 rounded bg-muted/30" />
                <div className="h-3 w-6 rounded bg-primary/15" />
                <div className="h-3 w-6 rounded bg-primary/30" />
                <div className="h-3 w-6 rounded bg-primary/50" />
                <div className="h-3 w-6 rounded bg-primary/70" />
                <div className="h-3 w-6 rounded bg-primary" />
              </div>
              <span>Maior</span>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
