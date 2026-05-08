import { useCommitteeCoverageHistory } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  saleId: string;
}

export function CommitteeCoverageSparkline({ saleId }: Props) {
  const { data, isLoading } = useCommitteeCoverageHistory(saleId);

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (!data || data.length < 2) {
    return (
      <div className="text-xs text-muted-foreground py-3 text-center">
        Sem histórico suficiente para tendência (mín. 2 snapshots).
      </div>
    );
  }

  const first = data[0].coverage_score;
  const last = data[data.length - 1].coverage_score;
  const delta = last - first;
  const Icon = delta > 2 ? TrendingUp : delta < -2 ? TrendingDown : Minus;
  const color = delta > 2 ? "text-emerald-500" : delta < -2 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Evolução 30d</span>
        <span className={`flex items-center gap-1 font-medium ${color}`}>
          <Icon className="h-3 w-3" />
          {delta > 0 ? "+" : ""}{delta.toFixed(0)} pts
        </span>
      </div>
      <div className="h-12 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
              labelFormatter={(v) => new Date(v as string).toLocaleDateString("pt-BR")}
              formatter={(v: any) => [`${v.toFixed(0)} pts`, "Cobertura"]}
            />
            <Line type="monotone" dataKey="coverage_score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
