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
    <div className="rounded-lg border border-white/10 bg-black/95 backdrop-blur-2xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-l-4 border-l-primary">
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
    <Card ref={ref} className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            Sales Dynamics
          </CardTitle>
          <div className="flex gap-1 p-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                  period === p
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6 relative z-10">
        {/* Futuristic grid background for the chart area */}
        <div className="absolute inset-x-6 top-0 bottom-6 opacity-[0.03] pointer-events-none border border-white/10 rounded-xl"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: "20px 20px"
             }} />

        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center">
             <div className="relative flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-primary/60 animate-pulse">Syncing Telemetry</span>
             </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] flex flex-col items-center justify-center space-y-2 opacity-40">
            <div className="h-10 w-10 border border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest">No spectral data detected</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
                dy={10} 
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} 
                width={50} 
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'rgba(14, 165, 233, 0.3)', strokeWidth: 1, strokeDasharray: '5 5' }} 
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={1500}
                dot={{ r: 0 }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))', 
                  stroke: 'white', 
                  strokeWidth: 2,
                  filter: 'url(#glow)'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});
SalesChart.displayName = "SalesChart";
