import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface PortfolioDistributionChartProps {
  portfolio: Array<{
    salesperson_id: string;
    salesperson?: { name: string } | null;
    status: string;
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

export const PortfolioDistributionChart: FC<PortfolioDistributionChartProps> = ({
  portfolio,
  salespeople,
}) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    portfolio.forEach((p) => {
      const sp = salespeople.find((s) => s.id === p.salesperson_id);
      const name = sp?.name?.split(" ")[0] || "N/A";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [portfolio, salespeople]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Sem dados de portfólio</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          Distribuição por Closer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any) => [`${v} clientes`, "Carteira"]}
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
