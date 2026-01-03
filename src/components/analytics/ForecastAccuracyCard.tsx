import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';
import { Target, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

const formatMonth = (period: string) => {
  const [year, month] = period.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
};

export const ForecastAccuracyCard: FC = () => {
  const { data, isLoading, error } = useForecastAccuracy();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Precisão de Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Precisão de Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = data.trend === 'improving' ? TrendingUp : 
                    data.trend === 'declining' ? TrendingDown : Minus;

  const trendColor = data.trend === 'improving' ? 'text-green-500' :
                     data.trend === 'declining' ? 'text-red-500' : 'text-yellow-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Precisão de Forecast
          </div>
          <Badge variant={data.trend === 'improving' ? 'default' : 'secondary'} className="gap-1">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            {data.trend === 'improving' ? 'Melhorando' : 
             data.trend === 'declining' ? 'Piorando' : 'Estável'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Accuracy */}
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground mb-1">Precisão Geral</p>
          <p className="text-3xl font-bold">{data.overallAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">
            Variância média: {data.avgVariance.toFixed(1)}%
          </p>
        </div>

        {/* Monthly Breakdown */}
        {data.monthlyData.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Por Mês
            </h4>
            {data.monthlyData.slice(-4).map((month) => (
              <div key={month.period} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatMonth(month.period)}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(month.actual)} / {formatCurrency(month.forecasted)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={month.accuracy} 
                    className="h-2 flex-1" 
                  />
                  <span className={`text-xs font-medium w-12 text-right ${
                    month.accuracy >= 80 ? 'text-green-500' :
                    month.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {month.accuracy.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sem dados históricos de forecast
          </p>
        )}

        {/* Best/Worst */}
        {data.bestMonth && data.worstMonth && data.bestMonth !== data.worstMonth && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-green-500/10">
              <p className="text-muted-foreground">Melhor</p>
              <p className="font-medium">{formatMonth(data.bestMonth.period)}</p>
              <p className="text-green-600">{data.bestMonth.accuracy.toFixed(0)}%</p>
            </div>
            <div className="p-2 rounded bg-red-500/10">
              <p className="text-muted-foreground">Pior</p>
              <p className="font-medium">{formatMonth(data.worstMonth.period)}</p>
              <p className="text-red-600">{data.worstMonth.accuracy.toFixed(0)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
