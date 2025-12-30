import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ChurnPrediction {
  clientId: string;
  clientName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  lastActivity: string | null;
  daysSinceLastPurchase: number;
}

interface ChurnPredictionProps {
  clientId?: string;
  timeframe?: 'month' | 'quarter' | 'year';
  onClientClick?: (clientId: string) => void;
}

export const useChurnPrediction = (options?: { clientId?: string; timeframe?: string }) => {
  return useQuery<ChurnPrediction[]>({
    queryKey: ['churn-prediction', options?.clientId, options?.timeframe],
    queryFn: async (): Promise<ChurnPrediction[]> => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: true })
        .limit(20);
      
      if (error) throw error;
      
      const now = new Date();
      
      return (clients || []).map(client => {
        const lastUpdate = new Date(client.updated_at);
        const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        
        let riskScore = Math.min(100, daysSince * 2);
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        const factors: string[] = [];
        
        if (daysSince > 90) {
          riskLevel = 'high';
          factors.push('Sem atividade há mais de 90 dias');
        } else if (daysSince > 30) {
          riskLevel = 'medium';
          factors.push('Sem atividade há mais de 30 dias');
        }
        
        if (!client.email) {
          riskScore += 10;
          factors.push('Sem email cadastrado');
        }
        
        if (!client.phone) {
          riskScore += 10;
          factors.push('Sem telefone cadastrado');
        }
        
        return {
          clientId: client.id,
          clientName: client.name,
          riskScore: Math.min(100, riskScore),
          riskLevel,
          factors,
          lastActivity: client.updated_at,
          daysSinceLastPurchase: daysSince,
        };
      }).filter(c => c.riskScore > 20);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

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
