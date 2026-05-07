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
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/80 px-5 py-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <p className="text-xl font-black text-white tracking-tight">
        R$ {payload[0].value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
};

export const SalesChart = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [period, setPeriod] = useState<Period>("90d");
  const { data: liveData, isLoading } = useSalesChartData(period);

  const data = liveData && liveData.length > 0 ? liveData : [];

  return (
    <Card ref={ref} className="h-full border-none bg-transparent shadow-none">
      <CardHeader className="pb-8 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-black uppercase tracking-tightest text-white/90">
                Performance Velocity
              </CardTitle>
            </div>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest ml-11">Evolução estratégica de volume</p>
          </div>
          <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8 px-2">
        {isLoading ? (
          <div className="h-[250px] animate-pulse bg-white/[0.02] rounded-3xl mx-4" />
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-white/10">
            No trajectory data available
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={15} 
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9, fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} 
                  width={45} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#strokeGradient)"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: '#02040a', strokeWidth: 4, className: 'drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
SalesChart.displayName = "SalesChart";
