import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useSeasonComparison } from "@/hooks/win-loss/useSeasonComparison";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";
import { cn } from "@/lib/utils";

interface Props {
  rows: WLAnalysisRow[];
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

const Delta = ({ value, suffix = "", invert = false }: { value: number; suffix?: string; invert?: boolean }) => {
  const positive = invert ? value < 0 : value > 0;
  const stable = Math.abs(value) < 0.01;
  const Icon = stable ? Minus : positive ? ArrowUpRight : ArrowDownRight;
  const tone = stable ? "text-muted-foreground" : positive ? "text-emerald-500" : "text-destructive";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", tone)}>
      <Icon className="h-3 w-3" aria-hidden />
      {value > 0 ? "+" : ""}{value.toFixed(1)}{suffix}
    </span>
  );
};

export const SeasonComparisonPanel = memo(function SeasonComparisonPanel({ rows }: Props) {
  const { current, previous, deltas } = useSeasonComparison(rows);
  if (!current.total && !previous.total) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" aria-hidden />
          Safra atual vs. anterior
          <span className="text-xs text-muted-foreground font-normal ml-auto">{previous.label} → {current.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Win rate</p>
            <p className="text-lg font-semibold tabular-nums">{current.winRate.toFixed(0)}%</p>
            <Delta value={deltas.winRate} suffix="pp" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume</p>
            <p className="text-lg font-semibold tabular-nums">{current.total}</p>
            <Delta value={deltas.total} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Receita</p>
            <p className="text-lg font-semibold tabular-nums">{fmtBRL(current.totalAmount)}</p>
            <Delta value={(deltas.totalAmount / Math.max(1, previous.totalAmount)) * 100} suffix="%" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ciclo médio</p>
            <p className="text-lg font-semibold tabular-nums">{current.avgCycle.toFixed(0)}d</p>
            <Delta value={deltas.avgCycle} suffix="d" invert />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
