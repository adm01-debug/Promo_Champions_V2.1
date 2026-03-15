import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDemandForecast } from '@/hooks/useDemandForecast';
import { TrendingUp, Package, AlertTriangle, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DemandForecast: FC = () => {
  const { data, isLoading } = useDemandForecast();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    );
  }

  const forecasts = data?.forecasts || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  return (
    <div className="space-y-4">
      <Card className="glass border-border/40 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Previsão de Demanda
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {forecasts.length} previsões
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {forecasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhuma previsão disponível</p>
              <p className="text-xs">As previsões serão geradas automaticamente</p>
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecasts.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="forecast_date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="predicted_revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    name="Receita Prevista"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {lowStockAlerts.length > 0 && (
        <Card className="glass border-border/40 border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockAlerts.slice(0, 5).map((alert: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{alert.productName || 'Produto'}</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Estoque: {alert.currentStock}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
