import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";
import { useWinLossPatterns } from "@/hooks/deal-intelligence/useWinLoss";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { stageLabel } from "./winLossHelpers";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(var(--destructive))",
  "hsl(25 95% 55%)",
  "hsl(var(--warning))",
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--muted-foreground))",
];

export function LostStageBreakdown() {
  const { data, isLoading } = useWinLossPatterns("stuck_stage");
  const slices = (data ?? []).slice(0, 6).map(p => ({ name: stageLabel(p.label), value: p.frequency }));

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PieIcon className="h-4 w-4 text-rose-500" />
          Onde Mais se Perde
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : slices.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem dados de estágio perdido.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={86} paddingAngle={2}>
                {slices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
