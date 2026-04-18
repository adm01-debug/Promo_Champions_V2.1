import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { useWinLossPatterns } from "@/hooks/deal-intelligence/useWinLoss";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { RechartsTooltipProps } from "@/types/recharts";

const TooltipBox = ({ active, payload }: RechartsTooltipProps) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { label: string; frequency: number; avg_cycle_days: number };
  return (
    <div className="rounded-md border border-border bg-popover p-2 shadow text-xs">
      <p className="font-medium">{p.label}</p>
      <p className="text-muted-foreground">{p.frequency} deals · ciclo médio {p.avg_cycle_days.toFixed(1)}d</p>
    </div>
  );
};

export function LossFactorsChart() {
  const { data, isLoading } = useWinLossPatterns("loss_factor");
  const top = (data ?? []).slice(0, 8);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="h-4 w-4 text-rose-500" />
          Top Fatores de Derrota
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem padrões. Execute "Minerar IA".</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<TooltipBox />} />
              <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                {top.map((_, i) => <Cell key={i} fill="hsl(var(--destructive))" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
