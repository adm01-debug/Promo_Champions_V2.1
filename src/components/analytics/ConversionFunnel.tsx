import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversionAnalysis } from '@/hooks/useConversionAnalysis';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Target, Percent, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ConversionFunnelProps {
  salespersonId?: string;
}

function ChangeIndicator({ change }: { change?: number }) {
  if (change === undefined || change === 0) return null;
  
  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? 'text-status-success' : 'text-status-error';
  
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function ConversionFunnel({ salespersonId }: ConversionFunnelProps) {
  const { data, isLoading } = useConversionAnalysis(salespersonId);

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Análise de Conversão</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/30 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.conversions.some(c => c.totalEntered > 0);
  const bottleneckCount = data?.conversions.filter(c => c.isBottleneck).length || 0;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Análise de Conversão</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {data?.overallChange !== undefined && data.overallChange !== 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                vs mês anterior
                <ChangeIndicator change={data.overallChange} />
              </Badge>
            )}
            {bottleneckCount > 0 && (
              <Badge variant="destructive" className="text-[10px] shadow-sm animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {bottleneckCount} gargalo{bottleneckCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 mb-3 shadow-lg">
              <Filter className="h-10 w-10 opacity-50 animate-pulse" />
            </div>
            <p className="text-sm font-display font-medium gradient-text">Nenhum dado de funil disponível</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Registre movimentações no pipeline para análise</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 ring-1 ring-primary/20 hover-lift transition-all group cursor-default hover-glow">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-md w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold font-display gradient-text group-hover:scale-105 transition-transform">{data.overallConversion.toFixed(1)}%</p>
                  <ChangeIndicator change={data.overallChange} />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display font-medium">Conversão Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift transition-all group cursor-default hover-glow-error animate-fade-in"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2 rounded-lg bg-destructive/10 shadow-md w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm font-bold text-destructive truncate group-hover:scale-105 transition-transform font-display">{data.biggestBottleneck}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display font-medium">Maior Gargalo</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all group cursor-default hover-glow-success animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2 rounded-lg bg-status-success/10 shadow-md w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success truncate group-hover:scale-105 transition-transform font-display">{data.bestConversion}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display font-medium">Melhor Conversão</p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
              <h4 className="text-sm font-display font-medium gradient-text flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Taxa de Conversão por Etapa
              </h4>
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {data.conversions.map((conv, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-xl transition-all hover-lift cursor-default group animate-fade-in",
                        conv.isBottleneck 
                          ? 'glass border border-destructive/30 ring-1 ring-destructive/20 hover:border-destructive/50' 
                          : 'glass border border-border/30 hover:border-primary/40'
                      )}
                      style={{ animationDelay: `${(index + 3) * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-display font-medium group-hover:text-primary transition-colors">{conv.fromStage}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          <span className="text-sm font-display font-medium group-hover:text-primary transition-colors">{conv.toStage}</span>
                          {conv.isBottleneck && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 animate-pulse shadow-sm">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              Gargalo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-lg font-bold font-display group-hover:scale-110 transition-transform",
                            conv.isBottleneck ? 'text-destructive' : 'gradient-text'
                          )}>
                            {conv.conversionRate.toFixed(1)}%
                          </span>
                          <ChangeIndicator change={conv.change} />
                        </div>
                      </div>
                      <Progress 
                        value={conv.conversionRate} 
                        className={cn(
                          "h-2.5 shadow-inner",
                          conv.isBottleneck ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'
                        )}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium">
                        <span className="flex items-center gap-1 group-hover:text-foreground/80 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
                          {conv.totalEntered} entraram
                        </span>
                        <span className="flex items-center gap-1 group-hover:text-foreground/80 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-status-success shadow-sm" />
                          {conv.totalConverted} converteram
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <div className="w-2 h-2 rounded-full bg-destructive shadow-sm" />
                          {(conv.totalEntered - conv.totalConverted)} perdidos ({conv.dropoffRate.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Visual Funnel */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <h4 className="text-sm font-display font-medium gradient-text mb-3">Visualização do Funil</h4>
              <div className="space-y-2">
                {data.conversions.map((conv, index) => {
                  const widthPercent = 100 - (index * 15);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "mx-auto h-11 flex items-center justify-center text-xs font-display font-medium rounded-lg transition-all hover:scale-[1.02] cursor-default animate-fade-in shadow-lg",
                        conv.isBottleneck 
                          ? 'bg-gradient-to-r from-destructive/90 to-destructive/70 text-destructive-foreground shadow-destructive/30 hover:shadow-destructive/50' 
                          : 'bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground shadow-primary/30 hover:shadow-primary/50'
                      )}
                      style={{ 
                        width: `${widthPercent}%`,
                        animationDelay: `${(index + 6) * 50}ms`
                      }}
                    >
                      {conv.fromStage} → {conv.toStage}: {conv.conversionRate.toFixed(0)}%
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
