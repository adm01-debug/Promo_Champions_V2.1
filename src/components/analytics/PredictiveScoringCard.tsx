import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePredictiveDealScoring } from '@/hooks/usePredictiveDealScoring';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const priorityConfig = {
  high: { color: 'bg-green-500', label: 'Alta', icon: CheckCircle },
  medium: { color: 'bg-yellow-500', label: 'Média', icon: TrendingUp },
  low: { color: 'bg-red-500', label: 'Baixa', icon: AlertCircle },
};

export const PredictiveScoringCard: FC = () => {
  const { data, isLoading, error } = usePredictiveDealScoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Score Preditivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Score Preditivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar scores</p>
        </CardContent>
      </Card>
    );
  }

  const topDeals = data.deals.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Score Preditivo de Deals
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Score Médio: <strong className="text-foreground">{data.avgScore.toFixed(0)}</strong></span>
          <Badge variant="outline" className="bg-green-500/10">
            {data.highPriorityCount} prioridade alta
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {topDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum deal ativo encontrado
          </p>
        ) : (
          <div className="space-y-3">
            {topDeals.map((deal) => {
              const config = priorityConfig[deal.priority];
              const PriorityIcon = config.icon;
              
              return (
                <div key={deal.saleId} className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.color}`} />
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {deal.saleId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {deal.probability}%
                      </Badge>
                      <PriorityIcon className={`h-4 w-4 ${
                        deal.priority === 'high' ? 'text-green-500' :
                        deal.priority === 'medium' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                  </div>
                  <Progress value={deal.score} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{deal.recommendation}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
