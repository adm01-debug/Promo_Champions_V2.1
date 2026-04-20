import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3 } from "lucide-react";
import { useMemo } from "react";
import type { ReasonMatrixCell } from "@/hooks/win-loss/useWinLossAggregations";
import { stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";

interface Props {
  cells: ReasonMatrixCell[];
  onCellClick?: (reason: string, stage: string) => void;
}

export function WinLossReasonMatrix({ cells, onCellClick }: Props) {
  const { reasons, stages, max, lookup } = useMemo(() => {
    const r = Array.from(new Set(cells.map(c => c.reason))).slice(0, 8);
    const s = Array.from(new Set(cells.map(c => c.stage)));
    const map = new Map<string, number>();
    cells.forEach(c => map.set(`${c.reason}||${c.stage}`, c.count));
    const m = Math.max(1, ...cells.map(c => c.count));
    return { reasons: r, stages: s, max: m, lookup: map };
  }, [cells]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3x3 className="h-4 w-4 text-primary" />
          Matriz de Motivos × Estágio (Lost)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!cells.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem perdas no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 text-muted-foreground font-normal">Motivo</th>
                  {stages.map(s => (
                    <th key={s} className="p-2 text-muted-foreground font-normal text-center">{stageLabel(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reasons.map(r => (
                  <tr key={r}>
                    <td className="p-2 font-medium truncate max-w-[160px]" title={r}>{r}</td>
                    {stages.map(s => {
                      const v = lookup.get(`${r}||${s}`) ?? 0;
                      const intensity = v / max;
                      return (
                        <td key={s} className="p-1 text-center">
                          <button
                            type="button"
                            disabled={!v || !onCellClick}
                            onClick={() => onCellClick?.(r, s)}
                            className="w-full rounded-md py-1.5 text-[11px] font-medium tabular-nums transition-transform hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
                            style={{
                              background: v ? `hsl(var(--destructive) / ${0.1 + intensity * 0.6})` : "transparent",
                              color: intensity > 0.5 ? "hsl(var(--destructive-foreground))" : undefined,
                              cursor: v && onCellClick ? "pointer" : "default",
                            }}
                            aria-label={v ? `Ver ${v} deals: ${r} em ${stageLabel(s)}` : undefined}
                          >
                            {v || "—"}
                          </button>
                        </td>
                      );
                    })}
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
