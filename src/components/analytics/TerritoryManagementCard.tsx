import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTerritoryManagement } from '@/hooks/useTerritoryManagement';
import { MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

export const TerritoryManagementCard: FC = () => {
  const { data, isLoading, error } = useTerritoryManagement();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Territórios</CardTitle>
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
          <CardTitle>Gestão de Territórios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.territories.map(t => t.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Gestão de Territórios
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{data.territories.length} regiões</span>
          <span>{data.totalClients} clientes</span>
          <span className="font-medium text-foreground">{formatCurrency(data.totalRevenue)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Territory */}
        {data.topTerritory && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Top: {data.topTerritory.region}</span>
              </div>
              <Badge>{formatCurrency(data.topTerritory.revenue)}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{data.topTerritory.salespeople} vendedores</span>
              <span>{data.topTerritory.clients} clientes</span>
              <span>{data.topTerritory.winRate.toFixed(0)}% win rate</span>
            </div>
          </div>
        )}

        {/* Territories List */}
        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {data.territories.map((territory) => (
            <div key={territory.region} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{territory.region}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(territory.revenue)}</span>
              </div>
              <Progress 
                value={(territory.revenue / maxRevenue) * 100} 
                className="h-2"
              />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {territory.salespeople}
                </span>
                <span>{territory.clients} clientes</span>
                <span>{territory.deals} deals</span>
                <span className={territory.winRate >= 50 ? 'text-green-600' : 'text-yellow-600'}>
                  {territory.winRate.toFixed(0)}% WR
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Underperforming Alert */}
        {data.underperformingTerritories.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {data.underperformingTerritories.length} território(s) abaixo da média
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.underperformingTerritories.map(t => t.region).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
