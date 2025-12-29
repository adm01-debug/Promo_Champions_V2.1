import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { useMetrics } from '@/hooks/useMetrics';

interface MetricsOverviewProps {
  userId?: string;
  period?: 'day' | 'week' | 'month';
}

export const MetricsOverview: FC<MetricsOverviewProps> = ({ userId, period = 'month' }) => {
  const { data: metrics, isLoading, error } = useMetrics({ userId, period });
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">Carregando métricas...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-red-600">Erro ao carregar métricas</div>
        <p className="text-sm text-muted-foreground mt-2">
          Tente novamente em alguns instantes
        </p>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Métricas Gerais</h3>
      <p className="text-sm text-muted-foreground">Período: {period}</p>
      {metrics && <div className="mt-4">Dados carregados</div>}
    </Card>
  );
};
