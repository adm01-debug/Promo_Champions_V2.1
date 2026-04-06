import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const mockData7d = [
  { name: "Seg", value: 8500 },
  { name: "Ter", value: 12000 },
  { name: "Qua", value: 9800 },
  { name: "Qui", value: 14200 },
  { name: "Sex", value: 11500 },
  { name: "Sáb", value: 6800 },
  { name: "Dom", value: 3200 },
];

const mockData30d = [
  { name: "Sem 1", value: 45000 },
  { name: "Sem 2", value: 52000 },
  { name: "Sem 3", value: 48000 },
  { name: "Sem 4", value: 61000 },
];

const mockData90d = [
  { name: "Jan", value: 45000 },
  { name: "Fev", value: 52000 },
  { name: "Mar", value: 48000 },
  { name: "Abr", value: 61000 },
  { name: "Mai", value: 55000 },
  { name: "Jun", value: 67000 },
  { name: "Jul", value: 72000 },
];

type Period = "7d" | "30d" | "90d";

const periodData: Record<Period, typeof mockData7d> = {
  "7d": mockData7d,
  "30d": mockData30d,
  "90d": mockData90d,
};

const periodLabels: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-popover/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-bold text-foreground font-display">
        R$ {payload[0].value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
};

export const SalesChart = () => {
  const [period, setPeriod] = useState<Period>("90d");
  const data = periodData[period];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Vendas
          </CardTitle>
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/40">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/20 dark:stroke-border/15" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary) / 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#strokeGradient)"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))', 
                stroke: 'hsl(var(--background))', 
                strokeWidth: 3,
                className: 'drop-shadow-md'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
