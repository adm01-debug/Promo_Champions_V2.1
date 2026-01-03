import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerHealthScore } from '@/hooks/useCustomerHealthScore';
import { Heart, AlertTriangle, XCircle, CheckCircle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig = {
  healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Saudável' },
  'at-risk': { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Em Risco' },
  churning: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Churn' },
};

export const CustomerHealthCard: FC = () => {
  const { data, isLoading, error } = useCustomerHealthScore();
  const [filter, setFilter] = useState<'all' | 'churning' | 'at-risk' | 'healthy'>('all');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saúde dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saúde dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  const filteredClients = filter === 'all' 
    ? data.clients 
    : data.clients.filter(c => c.status === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Saúde dos Clientes
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-500/10 gap-1">
            <CheckCircle className="h-3 w-3" />
            {data.healthyCount} saudáveis
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 gap-1">
            <AlertTriangle className="h-3 w-3" />
            {data.atRiskCount} em risco
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 gap-1">
            <XCircle className="h-3 w-3" />
            {data.churningCount} churn
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score médio */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Score Médio de Saúde</p>
          <p className="text-3xl font-bold">{data.avgHealthScore.toFixed(0)}</p>
          <Progress value={data.avgHealthScore} className="mt-2 h-2" />
        </div>

        {/* Filtros */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
            <TabsTrigger value="churning" className="flex-1">Churn</TabsTrigger>
            <TabsTrigger value="at-risk" className="flex-1">Risco</TabsTrigger>
            <TabsTrigger value="healthy" className="flex-1">Saudável</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de clientes */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum cliente nesta categoria
            </p>
          ) : (
            filteredClients.slice(0, 10).map((client) => {
              const config = statusConfig[client.status];
              const StatusIcon = config.icon;

              return (
                <div key={client.clientId} className={`p-3 rounded-lg ${config.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium truncate max-w-[150px]">{client.clientName}</span>
                    </div>
                    <Badge variant="secondary">{client.healthScore}</Badge>
                  </div>
                  <Progress value={client.healthScore} className="h-1.5 mb-2" />
                  <p className="text-xs text-muted-foreground">{client.recommendation}</p>
                  {client.daysSinceLastPurchase > 30 && (
                    <p className="text-xs mt-1 opacity-70">
                      📅 {client.daysSinceLastPurchase} dias sem compra
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
