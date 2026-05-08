import { memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))", "hsl(var(--warning))"];

interface VendedorChartsProps {
  chartData: { day: string; value: number }[];
  categoryData: { name: string; value: number }[];
}

export const VendedorCharts = memo(function VendedorCharts({ chartData, categoryData }: VendedorChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "350ms" }}>
        <h3 className="text-lg font-semibold mb-4">Vendas do Mês</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: any) => [`R$ ${value.toLocaleString("pt-BR")}`, "Vendas"]}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">Nenhuma venda este mês</div>
        )}
      </div>

      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "400ms" }}>
        <h3 className="text-lg font-semibold mb-4">Por Categoria</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: any) => [`R$ ${value.toLocaleString("pt-BR")}`]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">Sem dados</div>
        )}
        <div className="space-y-2 mt-4">
          {categoryData.map((cat, index) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="capitalize">{cat.name}</span>
              </div>
              <span className="font-medium">R$ {cat.value.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
