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
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Análise de Conversão</span>
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

  const hasData = data && data.conversions.some(c => c.totalEntered > 0);

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Análise de Conversão</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
            <div className="p-4 rounded-full bg-muted/20 mb-3">
              <TrendingUp className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-sm font-medium">Nenhum dado de funil disponível</p>
            <p className="text-xs text-muted-foreground mt-1">Registre movimentações no pipeline para análise</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift transition-all animate-fade-in group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold font-display gradient-text">{data.overallConversion.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversão Total</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift transition-all animate-fade-in group"
                style={{ animationDelay: '50ms' }}
              >
                <div className="p-2 rounded-lg bg-destructive/10 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm font-bold text-destructive truncate">{data.biggestBottleneck}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Maior Gargalo</p>
              </div>
              <div 
                className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift transition-all animate-fade-in group"
                style={{ animationDelay: '100ms' }}
              >
                <div className="p-2 rounded-lg bg-status-success/10 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                </div>
                <p className="text-sm font-bold text-status-success truncate">{data.bestConversion}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Melhor Conversão</p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
              <h4 className="text-sm font-display font-medium gradient-text">Taxa de Conversão por Etapa</h4>
              {data.conversions.map((conv, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl transition-all hover-lift animate-fade-in ${
                    conv.isBottleneck 
                      ? 'glass border border-destructive/30' 
                      : 'glass border border-border/30'
                  }`}
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{conv.fromStage}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{conv.toStage}</span>
                      {conv.isBottleneck && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Gargalo
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold font-display ${conv.isBottleneck ? 'text-destructive' : 'gradient-text'}`}>
                      {conv.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={conv.conversionRate} 
                    className={`h-2.5 ${conv.isBottleneck ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {conv.totalEntered} entraram
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-status-success" />
                      {conv.totalConverted} converteram
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
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
                      className={`mx-auto h-12 flex items-center justify-center text-xs font-medium rounded-lg transition-all hover:scale-[1.02] animate-fade-in ${
                        conv.isBottleneck 
                          ? 'bg-gradient-to-r from-destructive/80 to-destructive/60 text-destructive-foreground shadow-lg shadow-destructive/20' 
                          : 'bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground shadow-lg shadow-primary/20'
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
