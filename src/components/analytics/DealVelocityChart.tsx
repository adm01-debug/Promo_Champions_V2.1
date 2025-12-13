import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDealVelocity } from '@/hooks/useDealVelocity';
import { Clock, AlertTriangle, Zap, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DealVelocityChartProps {
  salespersonId?: string;
}

export function DealVelocityChart({ salespersonId }: DealVelocityChartProps) {
  const { data, isLoading } = useDealVelocity(salespersonId);

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Velocidade do Deal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/50 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.stages.some(s => s.totalDeals > 0);

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Velocidade do Deal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
            <div className="p-4 rounded-full bg-muted/20 mb-3">
              <Clock className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-sm font-medium">Nenhum histórico de etapas registrado</p>
            <p className="text-xs text-muted-foreground mt-1">O tempo médio será calculado conforme deals avançam</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift transition-all animate-fade-in group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold font-display gradient-text">{data.totalAvgDays.toFixed(1)}d</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ciclo Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all animate-fade-in group"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2 rounded-lg bg-status-success/10 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Zap className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success">{data.fastestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mais Rápida</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-warning/30 hover-lift transition-all animate-fade-in group"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2 rounded-lg bg-status-warning/10 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                </div>
                <p className="text-sm font-bold text-status-warning">{data.slowestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gargalo</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-48 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stages} layout="vertical">
                  <defs>
                    <linearGradient id="velocityBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="bottleneckBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `${v.toFixed(1)}d`} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="stage" 
                    width={90} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} dias (${(value * 24).toFixed(0)}h)`, 'Tempo Médio']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="avgDays" radius={[0, 6, 6, 0]}>
                    {data.stages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.bottleneck ? 'url(#bottleneckBarGradient)' : 'url(#velocityBarGradient)'}
                        style={{
                          filter: entry.bottleneck 
                            ? 'drop-shadow(0 4px 8px hsl(var(--destructive) / 0.3))' 
                            : 'drop-shadow(0 4px 8px hsl(var(--primary) / 0.2))'
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-display font-medium gradient-text">Detalhes por Etapa</h4>
              <div className="grid grid-cols-5 gap-2">
                {data.stages.map((stage, index) => (
                  <div 
                    key={stage.stage}
                    className={`p-3 rounded-xl text-center transition-all hover-lift animate-fade-in ${
                      stage.bottleneck 
                        ? 'glass border border-destructive/30 hover-glow' 
                        : 'glass border border-border/30'
                    }`}
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <p className="text-xs font-medium truncate">{stage.stage}</p>
                    <p className={`text-lg font-bold font-display ${stage.bottleneck ? 'text-destructive' : 'gradient-text'}`}>
                      {stage.avgDays.toFixed(1)}d
                    </p>
                    <p className="text-xs text-muted-foreground">{stage.totalDeals} deals</p>
                    {stage.bottleneck && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive mt-1 bg-destructive/10 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Gargalo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
