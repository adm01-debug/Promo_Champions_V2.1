import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Package, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DemandForecast: FC = () => {
  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['demand-forecasts-component'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_forecasts')
        .select('id, forecast_date, predicted_quantity, predicted_revenue, confidence_score')
        .order('forecast_date', { ascending: true })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Previsão de Demanda
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {(forecasts || []).length} previsões
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {(!forecasts || forecasts.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma previsão disponível</p>
            <p className="text-xs">As previsões serão geradas automaticamente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {forecasts.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{f.forecast_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    R$ {(f.predicted_revenue || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((f.confidence_score || 0) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
