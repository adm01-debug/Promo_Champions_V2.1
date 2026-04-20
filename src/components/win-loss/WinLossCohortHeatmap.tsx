import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3x3 } from "lucide-react";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";
import { useWinLossCohort } from "@/hooks/win-loss/useWinLossCohort";

interface Props {
  rows: WLAnalysisRow[];
  onCellClick?: (createdMonth: string, closedMonth: string) => void;
}

const cellTone = (winRate: number, total: number): string => {
  if (total === 0) return "bg-muted/30";
  if (winRate >= 70) return "bg-emerald-500/80 text-white";
  if (winRate >= 50) return "bg-emerald-500/50 text-foreground";
  if (winRate >= 30) return "bg-amber-500/50 text-foreground";
  return "bg-rose-500/60 text-white";
};

export function WinLossCohortHeatmap({ rows, onCellClick }: Props) {
  const { cells, createdMonths, closedMonths } = useWinLossCohort(rows);

  const matrix = useMemo(() => {
    const m = new Map<string, { winRate: number; total: number }>();
    cells.forEach(c => m.set(`${c.createdMonth}||${c.closedMonth}`, { winRate: c.winRate, total: c.total }));
    return m;
  }, [cells]);

  if (createdMonths.length === 0 || closedMonths.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Grid3x3 className="h-4 w-4 text-primary" />
            Cohort de Win Rate por safra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados suficientes para cohort.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3x3 className="h-4 w-4 text-primary" />
          Cohort · safra de criação × mês de fechamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={200}>
          <div className="overflow-x-auto">
            <table className="text-[11px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-normal px-1">Criado ↓ / Fechado →</th>
                  {closedMonths.map(cm => (
                    <th key={cm} className="text-muted-foreground font-normal px-1 tabular-nums">{cm}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {createdMonths.map(rm => (
                  <tr key={rm}>
                    <td className="text-muted-foreground tabular-nums px-1 py-0.5">{rm}</td>
                    {closedMonths.map(cm => {
                      const cell = matrix.get(`${rm}||${cm}`);
                      const wr = cell?.winRate ?? 0;
                      const total = cell?.total ?? 0;
                      return (
                        <td key={cm} className="p-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                disabled={total === 0}
                                onClick={() => onCellClick?.(rm, cm)}
                                className={`w-10 h-7 rounded-sm tabular-nums text-[10px] font-medium transition-transform hover:scale-110 ${cellTone(wr, total)} ${total ? "cursor-pointer" : "cursor-default opacity-40"}`}
                                aria-label={`Cohort ${rm} fechado em ${cm}: ${wr.toFixed(0)}% (${total} deals)`}
                              >
                                {total > 0 ? `${wr.toFixed(0)}` : "·"}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Criado: <strong>{rm}</strong> · Fechado: <strong>{cm}</strong></p>
                              <p className="text-xs">Win Rate: <strong>{wr.toFixed(1)}%</strong> ({total} deals)</p>
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
        </TooltipProvider>
        <p className="text-[10px] text-muted-foreground mt-2">
          Verde ≥50% · Âmbar 30-49% · Rosa &lt;30% — clique para drill-down.
        </p>
      </CardContent>
    </Card>
  );
}
