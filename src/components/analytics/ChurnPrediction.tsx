import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { useChurnPrediction } from './useChurnPrediction';

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
  
  const highRisk = data?.filter(c => c.riskLevel === 'high') || [];
  const mediumRisk = data?.filter(c => c.riskLevel === 'medium') || [];
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Predição de Churn</h3>
      <p className="text-sm text-muted-foreground mb-4">Timeframe: {timeframe}</p>
      
      <div className="space-y-4">
        {highRisk.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">Alto Risco ({highRisk.length})</h4>
            <div className="space-y-2">
              {highRisk.slice(0, 5).map(client => (
                <div 
                  key={client.clientId}
                  className="p-2 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/20"
                  onClick={() => onClientClick?.(client.clientId)}
                >
                  <p className="font-medium">{client.clientName}</p>
                  <p className="text-xs text-muted-foreground">{client.daysSinceLastPurchase} dias sem atividade</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {mediumRisk.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-warning mb-2">Risco Médio ({mediumRisk.length})</h4>
            <div className="space-y-2">
              {mediumRisk.slice(0, 5).map(client => (
                <div 
                  key={client.clientId}
                  className="p-2 rounded-lg bg-warning/10 cursor-pointer hover:bg-warning/20"
                  onClick={() => onClientClick?.(client.clientId)}
                >
                  <p className="font-medium">{client.clientName}</p>
                  <p className="text-xs text-muted-foreground">{client.daysSinceLastPurchase} dias sem atividade</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!data || data.length === 0) && (
          <p className="text-muted-foreground text-center py-4">Nenhum cliente em risco detectado</p>
        )}
      </div>
    </Card>
  );
};
