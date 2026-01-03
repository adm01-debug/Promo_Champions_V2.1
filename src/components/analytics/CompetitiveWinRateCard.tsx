import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompetitiveWinRate } from '@/hooks/useCompetitiveWinRate';
import { Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

export const CompetitiveWinRateCard: FC = () => {
  const { data, isLoading, error } = useCompetitiveWinRate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Competitiva</CardTitle>
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
          <CardTitle>Análise Competitiva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Análise Competitiva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Win Rate Geral */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Win Rate Geral</p>
          <p className={`text-3xl font-bold ${
            data.overallWinRate >= 50 ? 'text-green-600' : 
            data.overallWinRate >= 30 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {data.overallWinRate.toFixed(1)}%
          </p>
          <Progress value={data.overallWinRate} className="mt-2 h-2" />
        </div>

        {/* Razões */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Por que ganhamos</span>
            </div>
            <p className="text-sm font-medium truncate">{data.topWinReason}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Por que perdemos</span>
            </div>
            <p className="text-sm font-medium truncate">{data.topLossReason}</p>
          </div>
        </div>

        {/* Por Categoria */}
        {Object.keys(data.winsByCategory).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Win Rate por Categoria
            </h4>
            {Object.entries(data.winsByCategory)
              .sort((a, b) => b[1].winRate - a[1].winRate)
              .slice(0, 4)
              .map(([cat, stats]) => (
                <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {stats.won}/{stats.total}
                    </span>
                    <Badge variant={stats.winRate >= 50 ? 'default' : 'secondary'}>
                      {stats.winRate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Competidores */}
        {data.competitors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">vs Competidores</h4>
            {data.competitors.slice(0, 3).map((comp) => (
              <div key={comp.competitor} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm truncate max-w-[120px]">{comp.competitor}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600">{comp.won}W</span>
                  <span className="text-xs text-red-600">{comp.lost}L</span>
                  <Badge variant={comp.winRate >= 50 ? 'default' : 'secondary'}>
                    {comp.winRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.competitors.length === 0 && Object.keys(data.winsByCategory).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Adicione notas em deals com menções a competidores para análise
          </p>
        )}
      </CardContent>
    </Card>
  );
};
