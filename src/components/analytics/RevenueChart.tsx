import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface RevenueChartProps {
  period?: 'day' | 'week' | 'month' | 'year';
  showProjection?: boolean;
}

export const RevenueChart: FC<RevenueChartProps> = ({
  period = 'month',
  showProjection = false
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Receita por Período</h3>
      <p className="text-sm text-muted-foreground">Período: {period}</p>
      {showProjection && <p className="text-xs mt-2">Com projeção</p>}
    </Card>
  );
};
