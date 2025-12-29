import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { useChurnPrediction } from '@/hooks/useChurnPrediction';

interface ChurnPredictionProps {
  clientId?: string;
  timeframe?: 'month' | 'quarter' | 'year';
  onClientClick?: (clientId: string) => void;
}

export const ChurnPrediction: FC<ChurnPredictionProps> = ({
  clientId,
  timeframe = 'quarter',
  onClientClick
}) => {
  const { data, isLoading, error } = useChurnPrediction({ clientId, timeframe });
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">Carregando predição...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Erro ao carregar dados</div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Predição de Churn</h3>
      <p className="text-sm text-muted-foreground">Timeframe: {timeframe}</p>
      {data && <div className="mt-4">Dados: {JSON.stringify(data)}</div>}
    </Card>
  );
};
