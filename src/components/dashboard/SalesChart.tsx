import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesChartData } from "@/hooks/useSalesChartData";

type Period = "7d" | "30d" | "90d";

const periodLabels: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl border-l-4 border-l-primary">
      <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
        <p className="text-lg font-mono font-black text-primary tracking-tighter tabular-nums">
          R$ {payload[0].value.toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
};

export const SalesChart = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [period, setPeriod] = useState<Period>("90d");
  const { data: liveData, isLoading } = useSalesChartData(period);

  // Fallback to empty if no data
  const data = liveData && liveData.length > 0 ? liveData : [];

  return (
    <Card ref={ref} className="h-full">
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
        {isLoading ? (
          <div className="h-[220px] animate-pulse bg-muted/20 rounded-lg" />
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            Sem dados de vendas no período
          </div>
        ) : (
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
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
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
                activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 3, className: 'drop-shadow-md' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});
SalesChart.displayName = "SalesChart";
