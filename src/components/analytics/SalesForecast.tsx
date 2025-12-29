import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface SalesForecastProps {
  period?: 'week' | 'month' | 'quarter';
}

export const SalesForecast: FC<SalesForecastProps> = ({ period = 'month' }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Previsão de Vendas</h3>
      <p className="text-sm text-muted-foreground">Período: {period}</p>
    </Card>
  );
};
