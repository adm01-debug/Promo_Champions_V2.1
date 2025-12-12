import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface SalespersonData {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  goalProgress: number;
}

interface SalesChartProps {
  salespeople: SalespersonData[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass rounded-lg p-3 border border-border/50">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Vendas: <span className="text-foreground font-medium">R$ {data.totalSales.toLocaleString("pt-BR")}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Meta: <span className="text-foreground font-medium">R$ {data.goalAmount.toLocaleString("pt-BR")}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Progresso: <span className={data.goalProgress >= 100 ? "text-success font-medium" : "text-foreground font-medium"}>
            {data.goalProgress.toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function SalesChart({ salespeople }: SalesChartProps) {
  const chartData = salespeople.map((sp) => ({
    ...sp,
    shortName: sp.name.split(" ")[0],
  }));

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Vendas por Vendedor</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Comparativo de vendas vs meta mensal</p>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="shortName" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
            <Bar 
              dataKey="totalSales" 
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.goalProgress >= 100 ? "hsl(var(--success))" : COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm gradient-primary" />
          <span>Vendas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span>Meta atingida</span>
        </div>
      </div>
    </div>
  );
}
