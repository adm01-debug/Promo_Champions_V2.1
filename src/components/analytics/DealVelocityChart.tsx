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
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 animate-pulse">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Velocidade do Deal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/50 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.stages.some(s => s.totalDeals > 0);

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2 group/title">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Velocidade do Deal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner animate-pulse">
              <Clock className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-sm font-display font-medium gradient-text">Nenhum histórico de etapas registrado</p>
            <p className="text-xs text-muted-foreground mt-1">O tempo médio será calculado conforme deals avançam</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary/30">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">{data.totalAvgDays.toFixed(1)}d</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Ciclo Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2 rounded-lg bg-status-success/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-success/20">
                  <Zap className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success transition-transform duration-300 group-hover:scale-105">{data.fastestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Mais Rápida</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-warning/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2 rounded-lg bg-status-warning/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-warning/20">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                </div>
                <p className="text-sm font-bold text-status-warning transition-transform duration-300 group-hover:scale-105">{data.slowestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Gargalo</p>
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
                    className={`p-3 rounded-xl text-center transition-all duration-300 hover-lift cursor-pointer animate-fade-in group ${
                      stage.bottleneck 
                        ? 'glass border border-destructive/30 hover:border-destructive/50' 
                        : 'glass border border-border/30 hover:border-primary/40'
                    }`}
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <p className="text-xs font-display font-medium truncate transition-colors group-hover:text-primary">{stage.stage}</p>
                    <p className={`text-lg font-bold font-display transition-transform duration-300 group-hover:scale-110 ${stage.bottleneck ? 'text-destructive' : 'gradient-text'}`}>
                      {stage.avgDays.toFixed(1)}d
                    </p>
                    <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/70">{stage.totalDeals} deals</p>
                    {stage.bottleneck && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive mt-1 bg-destructive/10 px-1.5 py-0.5 rounded-full border border-destructive/30 animate-pulse">
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
