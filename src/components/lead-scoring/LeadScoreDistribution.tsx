import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadScoringMetrics } from '@/hooks/scoring/useLeadScoringMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export function LeadScoreDistribution() {
  const { data, isLoading } = useLeadScoringMetrics();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const chartData = data?.distribution || [];

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/40 border-border/20 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">
          Distribuição de Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="range" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/90 border border-border/50 p-2 rounded-lg shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Range: {payload[0].payload.range}
                        </p>
                        <p className="text-lg font-display font-black">
                          {payload[0].value} Leads
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                  const range = entry.range;
                  let color = '#3b82f6'; // default blue
                  if (range === '81-100') color = '#ef4444'; // hot red
                  if (range === '61-80' || range === '41-60') color = '#f59e0b'; // warm amber
                  
                  return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
