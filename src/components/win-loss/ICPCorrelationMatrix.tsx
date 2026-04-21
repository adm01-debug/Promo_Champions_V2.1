import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useICPCorrelation } from "@/hooks/win-loss/useICPCorrelation";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";

interface Props {
  rows: WLAnalysisRow[];
}

const cellShade = (rate: number, total: number) => {
  if (total < 2) return "hsl(var(--muted) / 0.4)";
  const opacity = Math.min(0.85, 0.15 + rate / 120);
  return `hsl(var(--primary) / ${opacity.toFixed(2)})`;
};

export const ICPCorrelationMatrix = memo(function ICPCorrelationMatrix({ rows }: Props) {
  const { cells, segments, buckets, bestCell } = useICPCorrelation(rows);

  if (!segments.length) return null;

  const lookup = new Map(cells.map(c => [`${c.segment}::${c.bucket}`, c]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" aria-hidden />
          Correlação ICP × Win Rate
          {bestCell && (
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              Sweet-spot: <span className="text-foreground font-medium">{bestCell.segment} · {bestCell.bucket}</span> ({bestCell.winRate.toFixed(0)}%)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="grid" aria-label="Matriz de correlação ICP por win rate">
            <thead>
              <tr>
                <th className="text-left p-1.5 text-muted-foreground font-normal">Segmento</th>
                {buckets.map(b => (
                  <th key={b} className="p-1.5 text-muted-foreground font-normal text-center">{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => (
                <tr key={seg}>
                  <td className="p-1.5 font-medium truncate max-w-[120px]">{seg}</td>
                  {buckets.map(b => {
                    const cell = lookup.get(`${seg}::${b}`);
                    const rate = cell?.winRate ?? 0;
                    const total = cell?.total ?? 0;
                    return (
                      <td
                        key={b}
                        role="gridcell"
                        className="p-1.5 text-center rounded transition-all"
                        style={{ background: cellShade(rate, total) }}
                        title={`${seg} · ${b}: ${total} deals, ${rate.toFixed(0)}% win rate`}
                      >
                        <span className="font-semibold tabular-nums">{total ? `${rate.toFixed(0)}%` : "—"}</span>
                        <div className="text-[10px] text-muted-foreground tabular-nums">{total || ""}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
