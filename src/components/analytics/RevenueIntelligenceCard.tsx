import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRevenueIntelligence } from '@/hooks/useRevenueIntelligence';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

const insightIcons = {
  opportunity: Lightbulb,
  risk: AlertTriangle,
  trend: TrendingUp,
};

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export const RevenueIntelligenceCard: FC = () => {
  const { data, isLoading, error } = useRevenueIntelligence();

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Inteligência de Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Inteligência de Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Inteligência de Receita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Receita Atual</p>
            <p className="text-xl font-bold">{formatCurrency(data.currentRevenue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Projeção</p>
            <p className="text-xl font-bold">{formatCurrency(data.projectedRevenue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
            <p className="text-xl font-bold">{formatCurrency(data.avgDealSize)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Crescimento</p>
            <p className={`text-xl font-bold flex items-center justify-center gap-1 ${
              data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.growthRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(data.growthRate).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Insights */}
        {data.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Insights Acionáveis
            </h4>
            {data.insights.map((insight, i) => {
              const Icon = insightIcons[insight.type];
              return (
                <div key={i} className={`p-3 rounded-lg border ${priorityColors[insight.priority]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{insight.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{insight.description}</p>
                      <p className="text-xs mt-2 opacity-80">💡 {insight.actionable}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Top Products & Clients */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Produtos</h4>
            {data.topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            ) : (
              data.topProducts.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm truncate">{p.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Clientes</h4>
            {data.topClients.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            ) : (
              data.topClients.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm truncate">{c.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(c.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
