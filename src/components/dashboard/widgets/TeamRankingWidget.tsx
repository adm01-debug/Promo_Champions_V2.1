import React from "react";
import { useGoalsDashboard } from "@/hooks/sales/useGoalsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const RANK_COLORS = [
  "hsl(var(--primary))",
  "hsl(262, 70%, 65%)",
  "hsl(262, 60%, 70%)",
  "hsl(262, 50%, 75%)",
  "hsl(262, 40%, 80%)",
];

export const TeamRankingWidget = React.memo(function TeamRankingWidget() {
  const { data, isLoading } = useGoalsDashboard();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const ranked = (data?.salespeople || [])
    .filter(sp => sp.currentSales > 0)
    .slice(0, 5);

  const chartData = ranked.map(sp => ({
    name: sp.name.split(" ")[0],
    value: sp.currentSales,
    full: sp.name,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-rank-gold" />
          Ranking do Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={55}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => [
                  `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                  "Receita",
                ]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={RANK_COLORS[i % RANK_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Sem dados do time</p>
        )}
      </CardContent>
    </Card>
  );
});

TeamRankingWidget.displayName = "TeamRankingWidget";
