import React, { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, AlertTriangle, Filter, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFunnelData } from '@/hooks/dashboard/useFunnelData';

interface ConversionFunnelProps {
  stages?: string[];
  showPercentages?: boolean;
  timeframe?: number;
}

const stageColors = [
  'bg-primary/80',
  'bg-primary/60',
  'bg-accent/60',
  'bg-streak/60',
  'bg-success/60',
];

export const ConversionFunnel: FC<ConversionFunnelProps> = ({
  timeframe = 30,
}) => {
  const { data, isLoading } = useFunnelData(timeframe);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />
      </Card>
    );
  }

  if (!data || data.stages.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Funil de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Filter className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Sem dados de funil no período</p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.stages.map(s => s.count), 1);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Funil de Conversão
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {data.overallConversion}% conversão
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              R$ {data.totalValue.toLocaleString('pt-BR')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Visual funnel */}
        <div className="space-y-2">
          {data.stages.map((stage, i) => {
            const widthPercent = Math.max(20, (stage.count / maxCount) * 100);
            const isBottleneck = stage.stage === data.topDropOffStage && stage.dropOffRate > 50;
            return (
              <div key={stage.stage} className="group relative">
                <div className="flex items-center gap-3">
                  {/* Funnel bar */}
                  <div className="flex-1 relative">
                    <div
                      className={cn(
                        'h-10 rounded-lg flex items-center justify-between px-3 transition-all duration-500',
                        stageColors[i % stageColors.length],
                        isBottleneck && 'ring-2 ring-destructive/50'
                      )}
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-xs font-semibold text-primary-foreground truncate">{stage.stage}</span>
                      <span className="text-xs font-bold text-primary-foreground">{stage.count}</span>
                    </div>
                  </div>
                  {/* Drop-off indicator */}
                  <div className="w-20 text-right shrink-0">
                    {i > 0 && (
                      <div className={cn('flex items-center justify-end gap-1 text-xs', isBottleneck ? 'text-destructive font-bold' : 'text-muted-foreground')}>
                        {isBottleneck && <AlertTriangle className="h-3 w-3" />}
                        <TrendingDown className="h-3 w-3" />
                        <span>{stage.dropOffRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Conversion rate between stages */}
                {i < data.stages.length - 1 && (
                  <div className="ml-4 h-4 border-l-2 border-dashed border-muted-foreground/20 flex items-center">
                    <span className="text-[10px] text-muted-foreground ml-2">{data.stages[i + 1].conversionRate}% →</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold font-display text-foreground">{data.overallConversion}%</p>
            <p className="text-xs text-muted-foreground">Conversão Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-display text-foreground">R$ {data.avgDealSize.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-display text-destructive">{data.topDropOffStage}</p>
            <p className="text-xs text-muted-foreground">Maior Gargalo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
