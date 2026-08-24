import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { fmtBRL, fmtDays, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { SalespersonStat } from "@/hooks/win-loss/useWinLossAggregations";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  stats: SalespersonStat[];
}

const buildRadarData = (stats: SalespersonStat[]) => {
  const maxCycle = Math.max(...stats.map(s => s.avgCycle), 1);
  const maxAmount = Math.max(...stats.map(s => s.avgAmountWon), 1);
  const maxTotal = Math.max(...stats.map(s => s.total), 1);
  const axes = ["Win Rate", "Volume", "Ciclo (inv.)", "Ticket"];
  return axes.map(axis => {
    const row: Record<string, string | number> = { axis };
    stats.forEach(s => {
      let v = 0;
      if (axis === "Win Rate") v = s.winRate;
      else if (axis === "Volume") v = (s.total / maxTotal) * 100;
      else if (axis === "Ciclo (inv.)") v = (1 - s.avgCycle / maxCycle) * 100;
      else v = (s.avgAmountWon / maxAmount) * 100;
      row[s.name] = Number(v.toFixed(1));
    });
    return row;
  });
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent-foreground))"];

export function WinLossCompareModal({ open, onOpenChange, stats }: Props) {
  const data = buildRadarData(stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Comparativo de vendedores</DialogTitle>
        </DialogHeader>

        {!stats.length ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Selecione até 3 vendedores na tabela para comparar.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {stats.map((s, i) => (
                <Badge key={s.salespersonId} variant="outline" style={{ borderColor: COLORS[i] }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i] }} />
                  {s.name}
                </Badge>
              ))}
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="axis" className="text-xs" />
                  {stats.map((s, i) => (
                    <Radar
                      key={s.salespersonId}
                      name={s.name}
                      dataKey={s.name}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.18}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="p-2 text-left font-normal">Vendedor</th>
                    <th className="p-2 text-right font-normal">Win Rate</th>
                    <th className="p-2 text-right font-normal">Total</th>
                    <th className="p-2 text-right font-normal">Ciclo</th>
                    <th className="p-2 text-right font-normal">Ticket Won</th>
                    <th className="p-2 font-normal">Top Win</th>
                    <th className="p-2 font-normal">Top Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, i) => (
                    <tr key={s.salespersonId} className="border-b border-border/30">
                      <td className="p-2 font-medium">
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i] }} />
                        {s.name}
                      </td>
                      <td className="p-2 text-right tabular-nums">{fmtPct(s.winRate)}</td>
                      <td className="p-2 text-right tabular-nums">{s.total}</td>
                      <td className="p-2 text-right tabular-nums">{fmtDays(s.avgCycle)}</td>
                      <td className="p-2 text-right tabular-nums">{fmtBRL(s.avgAmountWon)}</td>
                      <td className="p-2 truncate max-w-[140px]" title={s.topWinReason}>{s.topWinReason}</td>
                      <td className="p-2 truncate max-w-[140px]" title={s.topLossReason}>{s.topLossReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
