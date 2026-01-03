import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesVelocity } from '@/hooks/useSalesVelocity';
import { TrendingUp, Clock, Target, DollarSign, Zap, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}

const MetricItem: FC<MetricItemProps> = ({ icon, label, value, subtitle }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
    <div className="p-2 rounded-md bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold truncate">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

export const SalesVelocityCard: FC = () => {
  const { data, isLoading, error } = useSalesVelocity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Velocidade de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Velocidade de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar métricas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Velocidade de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricItem
            icon={<Zap className="h-4 w-4" />}
            label="Velocidade"
            value={formatCurrency(data.velocity)}
            subtitle="por dia"
          />
          <MetricItem
            icon={<DollarSign className="h-4 w-4" />}
            label="Ticket Médio"
            value={formatCurrency(data.avgDealValue)}
          />
          <MetricItem
            icon={<Target className="h-4 w-4" />}
            label="Win Rate"
            value={`${data.winRate.toFixed(1)}%`}
          />
          <MetricItem
            icon={<Clock className="h-4 w-4" />}
            label="Ciclo Médio"
            value={`${Math.round(data.avgSalesCycle)} dias`}
          />
          <MetricItem
            icon={<BarChart3 className="h-4 w-4" />}
            label="Pipeline"
            value={formatCurrency(data.pipelineValue)}
            subtitle={`${data.dealsInPipeline} deals`}
          />
          <MetricItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="Receita Projetada"
            value={formatCurrency(data.projectedRevenue)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
