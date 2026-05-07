import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend, ComposedChart, ReferenceLine } from "recharts";
import { BarChart3 } from "lucide-react";

interface GoalComparisonChartProps {
  salespeople: {
    id: string;
    name: string;
    currentSales: number;
    goalAmount: number;
    progress: number;
    projection: number;
  }[];
}

export const GoalComparisonChart: FC<GoalComparisonChartProps> = ({ salespeople }) => {
  const data = salespeople
    .filter(sp => sp.goalAmount > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 8)
    .map(sp => ({
      name: sp.name.split(" ")[0],
      vendido: sp.currentSales,
      meta: sp.goalAmount,
      progress: sp.progress,
      projecao: sp.projection,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Sem dados de metas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Vendido vs Meta por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v: number, name: string) => [
                `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                name === "vendido" ? "Vendido" : "Meta",
              ]}
              contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Bar dataKey="meta" fill="hsl(var(--muted-foreground)/0.2)" radius={[4, 4, 0, 0]} barSize={20} name="meta" />
            <Bar dataKey="vendido" radius={[4, 4, 0, 0]} barSize={20} name="vendido">
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.progress >= 100
                      ? "hsl(var(--success))"
                      : entry.progress >= 70
                      ? "hsl(var(--primary))"
                      : entry.progress >= 40
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
