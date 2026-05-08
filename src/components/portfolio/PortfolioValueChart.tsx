import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface PortfolioValueChartProps {
  portfolio: Array<{
    salesperson_id: string;
    client?: { total_value?: number; name: string } | null;
  }>;
  salespeople: Array<{ id: string; name: string }>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(262, 60%, 65%)",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(185, 90%, 48%)",
  "hsl(30, 90%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(210, 70%, 55%)",
];

export const PortfolioValueChart: FC<PortfolioValueChartProps> = ({
  portfolio,
  salespeople,
}) => {
  const data = useMemo(() => {
    const values: Record<string, number> = {};
    portfolio.forEach((p) => {
      const sp = salespeople.find((s) => s.id === p.salesperson_id);
      const name = sp?.name?.split(" ")[0] || "N/A";
      values[name] = (values[name] || 0) + (p.client?.total_value || 0);
    });
    return Object.entries(values)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [portfolio, salespeople]);

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Sem valores de carteira</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Valor de Carteira por Closer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
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
              formatter={(v: any) => [
                `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                "Valor Total",
              ]}
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
