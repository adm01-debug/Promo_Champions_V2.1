import { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SalesForecastProps {
  period?: 'week' | 'month' | 'quarter';
}

interface ForecastItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  predicted_demand_30d: number;
  predicted_demand_60d: number;
  predicted_demand_90d: number;
  reorder_recommendation: string;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

const trendIcons: Record<string, JSX.Element> = {
  increasing: <TrendingUp className="h-4 w-4 text-success" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  decreasing: <TrendingDown className="h-4 w-4 text-destructive" />,
};

const _riskStyles: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-accent text-accent-foreground border-border',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive text-destructive-foreground',
};

const _riskLabels: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
};

export const SalesForecast: FC<SalesForecastProps> = () => {
  const queryClient = useQueryClient();

  // Fetch existing forecasts from database
  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['demand-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_forecasts')
        .select('*')
        .order('predicted_revenue', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Generate new forecasts via edge function
  const generateForecast = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('demand-forecast', {
        body: { action: 'generate' },
      });
      if (error) throw error;
      return data as { forecasts: ForecastItem[] };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['demand-forecasts'] });
      toast.success(`${data?.forecasts?.length || 0} previsões geradas!`);
    },
    onError: () => toast.error('Erro ao gerar previsões'),
  });

  // Summary from DB forecasts
  const summary = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return null;
    const totalRevenue = forecasts.reduce((sum, f) => sum + (f.predicted_revenue || 0), 0);
    const avgConfidence = forecasts.reduce((sum, f) => sum + (f.confidence_score || 0), 0) / forecasts.length;
    return { totalRevenue, avgConfidence, count: forecasts.length };
  }, [forecasts]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            Previsão de Demanda
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateForecast.mutate()}
            disabled={generateForecast.isPending}
            className="gap-1.5"
          >
            {generateForecast.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Gerar Previsão
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Receita Prevista</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(summary.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Produtos</p>
              <p className="text-lg font-bold">{summary.count}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Confiança Média</p>
              <p className="text-lg font-bold">{(summary.avgConfidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}

        {/* Forecast items from DB */}
        {(!forecasts || forecasts.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma previsão disponível.</p>
            <p className="text-xs">Clique em "Gerar Previsão" para analisar.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {forecasts.slice(0, 10).map((forecast) => (
              <div
                key={forecast.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {forecast.product_id ? `Produto ${forecast.product_id.slice(0, 8)}` : 'Geral'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {forecast.confidence_score ? `${(forecast.confidence_score * 100).toFixed(0)}%` : '—'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Previsão: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(forecast.predicted_revenue)}
                    {' · '}
                    Qtd: {forecast.predicted_quantity}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(forecast.forecast_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
