import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Users, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fmtBRL, fmtDays, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { SalespersonStat } from "@/hooks/win-loss/useWinLossAggregations";
import { WinLossCompareModal } from "./WinLossCompareModal";

interface Props {
  stats: SalespersonStat[];
  isLoading?: boolean;
  onRowClick?: (salespersonId: string, name: string) => void;
}

export function SalespersonWinLossTable({ stats, isLoading, onRowClick }: Props) {
  const top = stats[0];
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareStats = stats.filter(s => selected.includes(s.salespersonId));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Comparativo por Vendedor
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          disabled={selected.length < 2}
          onClick={() => setCompareOpen(true)}
          aria-label={`Comparar ${selected.length} vendedores`}
        >
          <GitCompare className="h-3.5 w-3.5 mr-1.5" />
          Comparar ({selected.length})
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : !stats.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem deals analisados no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table" aria-label="Tabela de win/loss por vendedor">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/50">
                  <th className="p-2 font-normal w-8" aria-label="Selecionar"></th>
                  <th className="p-2 font-normal">Vendedor</th>
                  <th className="p-2 font-normal text-right">Win Rate</th>
                  <th className="p-2 font-normal text-right">Total</th>
                  <th className="p-2 font-normal text-right">Ciclo méd.</th>
                  <th className="p-2 font-normal text-right">Ticket Won</th>
                  <th className="p-2 font-normal">Top motivo Win</th>
                  <th className="p-2 font-normal">Top motivo Loss</th>
                  <th className="p-2 font-normal">Concorrente</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => {
                  const isTop = s.salespersonId === top?.salespersonId;
                  const isChecked = selected.includes(s.salespersonId);
                  const disabled = !isChecked && selected.length >= 3;
                  return (
                    <tr
                      key={s.salespersonId}
                      className={`border-b border-border/30 ${isTop ? "bg-primary/5" : ""} ${onRowClick ? "hover:bg-muted/40 transition-colors" : ""}`}
                    >
                      <td className="p-2">
                        <Checkbox
                          checked={isChecked}
                          disabled={disabled}
                          onCheckedChange={() => toggle(s.salespersonId)}
                          aria-label={`Selecionar ${s.name}`}
                        />
                      </td>
                      <td
                        className={`p-2 font-medium ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={() => onRowClick?.(s.salespersonId, s.name)}
                      >
                        <div className="flex items-center gap-1.5">
                          {isTop && <Crown className="h-3.5 w-3.5 text-amber-500" aria-label="Top performer" />}
                          {s.name}
                        </div>
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        <Badge
                          variant="outline"
                          className={s.winRate >= (top?.winRate ?? 0) - 5 ? "border-emerald-500/40 text-emerald-700" : ""}
                        >
                          {fmtPct(s.winRate)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right tabular-nums">{s.total}</td>
                      <td className="p-2 text-right tabular-nums">{fmtDays(s.avgCycle)}</td>
                      <td className="p-2 text-right tabular-nums">{fmtBRL(s.avgAmountWon)}</td>
                      <td className="p-2 truncate max-w-[140px]" title={s.topWinReason}>{s.topWinReason}</td>
                      <td className="p-2 truncate max-w-[140px]" title={s.topLossReason}>{s.topLossReason}</td>
                      <td className="p-2 truncate max-w-[120px]" title={s.topCompetitor}>{s.topCompetitor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <WinLossCompareModal open={compareOpen} onOpenChange={setCompareOpen} stats={compareStats} />
    </Card>
  );
}
