import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadScoringMetrics } from '@/hooks/scoring/useLeadScoringMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

export function LeadScoreDistribution() {
  const { data, isLoading } = useLeadScoringMetrics();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const chartData = data?.distribution || [];

  return (
    <Card variant="modern" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Distribuição de Elite
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">Frequência de pontuação em toda a base</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Saudável</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="range" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 border border-primary/20 p-3 rounded-xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                            Segmento: {payload[0].payload.range}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-display font-black tracking-tighter">
                            {payload[0].value}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Leads Detectados</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => {
                  const range = entry.range;
                  let color = "url(#barGradient)";
                  if (range === '81-100') color = 'hsl(var(--status-error))';
                  if (range === '61-80') color = 'hsl(var(--status-warning))';
                  
                  return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.9} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-error" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">Hot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-warning" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">Warm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">Cold</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <Info className="h-3 w-3" />
            <span className="text-[9px] font-bold italic uppercase tracking-tighter">Engine v4.2 Predictive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
