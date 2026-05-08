// DealVelocityChart - visualizes deal pipeline velocity
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDealVelocity } from '@/hooks/useDealVelocity';
import { Clock, AlertTriangle, Zap, Timer, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DealVelocityChartProps {
  salespersonId?: string;
}

function ChangeIndicator({ change, inverted = false }: { change?: number; inverted?: boolean }) {
  if (change === undefined || change === 0) return null;
  
  // For velocity, negative change (faster) is good
  const isPositive = inverted ? change < 0 : change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? 'text-status-success' : 'text-status-error';
  
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function DealVelocityChart({ salespersonId }: DealVelocityChartProps) {
  const { data, isLoading } = useDealVelocity(salespersonId);

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 animate-pulse">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="gradient-text">Velocidade do Deal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
            <div className="h-48 bg-muted/50 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.stages.some(s => s.totalDeals > 0);
  const totalDeals = data?.stages.reduce((acc, s) => acc + s.totalDeals, 0) || 0;

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow hover-lift transition-all duration-300 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2 group/title">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40 group-hover/title:rotate-3">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="gradient-text">Velocidade do Deal</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {data?.totalChange !== undefined && data.totalChange !== 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                vs mês anterior
                <ChangeIndicator change={data.totalChange} inverted />
              </Badge>
            )}
            {hasData && (
              <Badge variant="secondary" className="text-xs">
                {totalDeals} deals analisados
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
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
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer hover:border-primary/50">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary/30 group-hover:rotate-3">
                  <Timer className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">{data.totalAvgDays.toFixed(1)}d</p>
                  <ChangeIndicator change={data.totalChange} inverted />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display mt-1">Ciclo Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer hover:border-status-success/50 hover-glow-success"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2.5 rounded-xl bg-status-success/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-success/20">
                  <Zap className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success transition-transform duration-300 group-hover:scale-105 truncate px-1">{data.fastestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display mt-1">Mais Rápida</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-warning/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer hover:border-status-warning/50"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2.5 rounded-xl bg-status-warning/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-warning/20">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                </div>
                <p className="text-sm font-bold text-status-warning transition-transform duration-300 group-hover:scale-105 truncate px-1">{data.slowestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display mt-1">Gargalo</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-52 animate-fade-in glass rounded-xl p-4 border border-border/30" style={{ animationDelay: '150ms' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stages} layout="vertical">
                  <defs>
                    <linearGradient id="velocityBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
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
                    formatter={(value: any) => [`${value.toFixed(2)} dias (${(value * 24).toFixed(0)}h)`, 'Tempo Médio']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  />
                  <Bar dataKey="avgDays" radius={[0, 8, 8, 0]}>
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
            <div className="space-y-3">
              <h4 className="text-sm font-display font-semibold gradient-text flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Detalhes por Etapa
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {data.stages.map((stage, index) => (
                  <div 
                    key={stage.stage}
                    className={`p-3 rounded-xl text-center transition-all duration-300 hover-lift cursor-pointer animate-fade-in group ${
                      stage.bottleneck 
                        ? 'glass border border-destructive/30 hover:border-destructive/50 hover:shadow-destructive/20' 
                        : 'glass border border-border/30 hover:border-primary/40'
                    }`}
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <p className="text-xs font-display font-medium truncate transition-colors group-hover:text-primary">{stage.stage}</p>
                    <div className="flex items-center justify-center gap-1">
                      <p className={`text-lg font-bold font-display transition-transform duration-300 group-hover:scale-110 ${stage.bottleneck ? 'text-destructive' : 'gradient-text'}`}>
                        {stage.avgDays.toFixed(1)}d
                      </p>
                      <ChangeIndicator change={stage.change} inverted />
                    </div>
                    <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/70">{stage.totalDeals} deals</p>
                    {stage.bottleneck && (
                      <Badge variant="destructive" className="text-[10px] mt-1.5 px-1.5 py-0 h-5 animate-pulse">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        Gargalo
                      </Badge>
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
