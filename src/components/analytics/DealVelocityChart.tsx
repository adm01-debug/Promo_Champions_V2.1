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
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Velocidade do Deal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/50 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.stages.some(s => s.totalDeals > 0);

  return (
    <Card variant="elevated" className="border-border/40 dark:border-glow hover-lift">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-primary">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Velocidade do Deal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum histórico de etapas registrado</p>
            <p className="text-sm">O tempo médio será calculado conforme deals avançam</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift cursor-pointer">
                <div className="p-2 rounded-lg gradient-primary w-fit mx-auto mb-2">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold gradient-text">{data.totalAvgDays.toFixed(1)}d</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ciclo Total</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift cursor-pointer">
                <div className="p-2 rounded-lg bg-status-success/20 w-fit mx-auto mb-2">
                  <Zap className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success">{data.fastestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mais Rápida</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-status-warning/30 hover-lift cursor-pointer">
                <div className="p-2 rounded-lg bg-status-warning/20 w-fit mx-auto mb-2">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                </div>
                <p className="text-sm font-bold text-status-warning">{data.slowestStage}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gargalo</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
                    {data.stages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.bottleneck ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Detalhes por Etapa</h4>
              <div className="grid grid-cols-5 gap-2">
                {data.stages.map((stage) => (
                  <div 
                    key={stage.stage}
                    className={`p-2 rounded-lg text-center ${
                      stage.bottleneck 
                        ? 'bg-destructive/10 border border-destructive/30' 
                        : 'bg-muted/50 border border-border/50'
                    }`}
                  >
                    <p className="text-xs font-medium truncate">{stage.stage}</p>
                    <p className={`text-lg font-bold ${stage.bottleneck ? 'text-destructive' : 'text-foreground'}`}>
                      {stage.avgDays.toFixed(1)}d
                    </p>
                    <p className="text-xs text-muted-foreground">{stage.totalDeals} deals</p>
                    {stage.bottleneck && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-destructive mt-1">
                        <AlertTriangle className="h-3 w-3" />
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
