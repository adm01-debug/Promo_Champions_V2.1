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
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Análise de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.conversions.some(c => c.totalEntered > 0);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Análise de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum dado de funil disponível</p>
            <p className="text-sm">Registre movimentações no pipeline para análise</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-primary">{data.overallConversion.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Conversão Total</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-3 text-center border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-sm font-bold text-destructive truncate">{data.biggestBottleneck}</p>
                <p className="text-xs text-muted-foreground">Maior Gargalo</p>
              </div>
              <div className="bg-status-success/10 rounded-lg p-3 text-center border border-status-success/20">
                <TrendingUp className="h-5 w-5 text-status-success mx-auto mb-1" />
                <p className="text-sm font-bold text-status-success truncate">{data.bestConversion}</p>
                <p className="text-xs text-muted-foreground">Melhor Conversão</p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Taxa de Conversão por Etapa</h4>
              {data.conversions.map((conv, index) => (
                <div key={index} className={`p-3 rounded-lg ${conv.isBottleneck ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{conv.fromStage}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{conv.toStage}</span>
                      {conv.isBottleneck && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/20 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" />
                          Gargalo
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${conv.isBottleneck ? 'text-destructive' : 'text-primary'}`}>
                      {conv.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={conv.conversionRate} 
                    className={`h-2 ${conv.isBottleneck ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{conv.totalEntered} entraram</span>
                    <span>{conv.totalConverted} converteram</span>
                    <span className="text-destructive">{(conv.totalEntered - conv.totalConverted)} perdidos ({conv.dropoffRate.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Funnel */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-3">Visualização do Funil</h4>
              <div className="space-y-1">
                {data.conversions.map((conv, index) => {
                  const widthPercent = 100 - (index * 15);
                  return (
                    <div
                      key={index}
                      className={`mx-auto h-10 flex items-center justify-center text-xs font-medium rounded transition-all ${
                        conv.isBottleneck 
                          ? 'bg-gradient-to-r from-destructive/80 to-destructive/60 text-destructive-foreground' 
                          : 'bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground'
                      }`}
                      style={{ width: `${widthPercent}%` }}
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
