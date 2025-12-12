import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", vendas: 45000, meta: 50000 },
  { month: "Fev", vendas: 52000, meta: 50000 },
  { month: "Mar", vendas: 48000, meta: 55000 },
  { month: "Abr", vendas: 61000, meta: 55000 },
  { month: "Mai", vendas: 55000, meta: 60000 },
  { month: "Jun", vendas: 67000, meta: 60000 },
  { month: "Jul", vendas: 72000, meta: 65000 },
  { month: "Ago", vendas: 69000, meta: 70000 },
  { month: "Set", vendas: 78000, meta: 70000 },
  { month: "Out", vendas: 85000, meta: 75000 },
  { month: "Nov", vendas: 92000, meta: 80000 },
  { month: "Dez", vendas: 98000, meta: 85000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString("pt-BR")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesChart = () => {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Performance de Vendas</h3>
          <p className="text-sm text-muted-foreground">Vendas vs Meta mensal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Vendas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs text-muted-foreground">Meta</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 30%, 16%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 30%, 16%)" }}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="hsl(24, 100%, 55%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVendas)"
              name="Vendas"
            />
            <Area
              type="monotone"
              dataKey="meta"
              stroke="hsl(280, 80%, 60%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorMeta)"
              name="Meta"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
