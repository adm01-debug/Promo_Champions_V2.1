import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConversionAnalysis } from '@/hooks/useConversionAnalysis';
import { TrendingUp, AlertTriangle, ArrowRight, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ConversionFunnelProps {
  salespersonId?: string;
}

export function ConversionFunnel({ salespersonId }: ConversionFunnelProps) {
  const { data, isLoading } = useConversionAnalysis(salespersonId);

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 animate-pulse">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Análise de Conversão</span>
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

  const hasData = data && data.conversions.some(c => c.totalEntered > 0);

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2 group/title">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Análise de Conversão</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner animate-pulse">
              <TrendingUp className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-sm font-display font-medium gradient-text">Nenhum dado de funil disponível</p>
            <p className="text-xs text-muted-foreground mt-1">Registre movimentações no pipeline para análise</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">{data.overallConversion.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Conversão Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2 rounded-lg bg-destructive/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm font-bold text-destructive truncate transition-transform duration-300 group-hover:scale-105">{data.biggestBottleneck}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Maior Gargalo</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all duration-300 animate-fade-in group cursor-pointer"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2 rounded-lg bg-status-success/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-success/20">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success truncate transition-transform duration-300 group-hover:scale-105">{data.bestConversion}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Melhor Conversão</p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
              <h4 className="text-sm font-display font-medium gradient-text">Taxa de Conversão por Etapa</h4>
              {data.conversions.map((conv, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl transition-all duration-300 hover-lift cursor-pointer animate-fade-in group ${
                    conv.isBottleneck 
                      ? 'glass border border-destructive/30 hover:border-destructive/50' 
                      : 'glass border border-border/30 hover:border-primary/40'
                  }`}
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-medium group-hover:text-primary transition-colors">{conv.fromStage}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                      <span className="text-sm font-display font-medium group-hover:text-primary transition-colors">{conv.toStage}</span>
                      {conv.isBottleneck && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/30 animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          Gargalo
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold font-display transition-all duration-300 group-hover:scale-110 ${conv.isBottleneck ? 'text-destructive' : 'gradient-text'}`}>
                      {conv.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={conv.conversionRate} 
                    className={`h-2.5 shadow-inner ${conv.isBottleneck ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                    <span className="flex items-center gap-1 transition-colors group-hover:text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                      {conv.totalEntered} entraram
                    </span>
                    <span className="flex items-center gap-1 transition-colors group-hover:text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-status-success shadow-sm" />
                      {conv.totalConverted} converteram
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-sm" />
                      {(conv.totalEntered - conv.totalConverted)} perdidos ({conv.dropoffRate.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Funnel */}
            <div className="mt-4">
              <h4 className="text-sm font-display font-medium gradient-text mb-3">Visualização do Funil</h4>
              <div className="space-y-1.5">
                {data.conversions.map((conv, index) => {
                  const widthPercent = 100 - (index * 15);
                  return (
                    <div
                      key={index}
                      className={`mx-auto h-12 flex items-center justify-center text-xs font-display font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-fade-in ${
                        conv.isBottleneck 
                          ? 'bg-gradient-to-r from-destructive/80 to-destructive/60 text-destructive-foreground shadow-lg shadow-destructive/30 hover:shadow-destructive/50' 
                          : 'bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50'
                      }`}
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
