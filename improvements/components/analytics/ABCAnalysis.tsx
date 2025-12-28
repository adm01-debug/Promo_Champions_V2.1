import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  revenue: number;
  deals_count: number;
}

interface ABCAnalysisProps {
  onClientClick?: (clientId: string) => void;
  showDetails?: boolean;
}

export const ABCAnalysis: FC<ABCAnalysisProps> = ({ 
  onClientClick,
  showDetails = true 
}) => {
  const { data, isLoading } = useABCAnalysis();
  
  if (isLoading) {
    return <div className="animate-pulse">Carregando análise ABC...</div>;
  }
  
  if (!data) return null;
  
  const getCategoryColor = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-blue-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise ABC de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.categories.map(cat => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat.category)}`} />
                  <span className="font-semibold">Categoria {cat.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ({cat.clients.length} clientes)
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {cat.percentage.toFixed(1)}% do faturamento
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">{cat.description}</p>
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  R$ {cat.totalRevenue.toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cat.clients.length} clientes
                </div>
              </div>
              
              {showDetails && cat.clients.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium">Top 3:</p>
                  {cat.clients.slice(0, 3).map(client => (
                    <div 
                      key={client.id}
                      className="text-xs flex justify-between cursor-pointer hover:bg-accent p-1 rounded"
                      onClick={() => onClientClick?.(client.id)}
                    >
                      <span>{client.name}</span>
                      <span className="text-muted-foreground">
                        R$ {client.total_revenue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Total</span>
              <div className="flex gap-4">
                <span>{data.totalClients} clientes</span>
                <span className="font-semibold">
                  R$ {data.totalRevenue.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
