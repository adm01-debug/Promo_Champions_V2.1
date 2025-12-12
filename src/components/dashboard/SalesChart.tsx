import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { month: "Jan", vendas: 45000, meta: 50000 },
  { month: "Fev", vendas: 52000, meta: 50000 },
  { month: "Mar", vendas: 48000, meta: 55000 },
  { month: "Abr", vendas: 61000, meta: 55000 },
  { month: "Mai", vendas: 55000, meta: 60000 },
  { month: "Jun", vendas: 67000, meta: 60000 },
  { month: "Jul", vendas: 72000, meta: 65000 },
  { month: "Ago", vendas: 68000, meta: 70000 },
  { month: "Set", vendas: 79000, meta: 75000 },
  { month: "Out", vendas: 85000, meta: 80000 },
  { month: "Nov", vendas: 91000, meta: 85000 },
  { month: "Dez", vendas: 98000, meta: 90000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-card/95 backdrop-blur-sm p-4 shadow-lg border border-border">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2" />
            Vendas:{" "}
            <span className="font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payload[0].value)}
            </span>
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/30 mr-2" />
            Meta:{" "}
            <span className="font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payload[1].value)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  return (
    <Card className="p-6 shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Desempenho de Vendas</h3>
        <p className="text-sm text-muted-foreground">Comparativo vendas x meta mensal</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(252 100% 65%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(252 100% 65%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220 9% 46%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(220 9% 46%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="meta"
              stroke="hsl(220 9% 70%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorMeta)"
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="hsl(252 100% 65%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVendas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Vendas Realizadas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
          <span className="text-sm text-muted-foreground">Meta</span>
        </div>
      </div>
    </Card>
  );
}