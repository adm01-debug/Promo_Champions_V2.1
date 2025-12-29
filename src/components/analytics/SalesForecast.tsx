import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface SalesForecastProps {
  period?: 'week' | 'month' | 'quarter';
}

export const SalesForecast: FC<SalesForecastProps> = ({ period = 'month' }) => {
  // Simular estados para demonstração de error handling
  const isLoading = false;
  const error = null;
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">Carregando previsão...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-red-600">Erro ao carregar previsão</div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Previsão de Vendas</h3>
      <p className="text-sm text-muted-foreground">Período: {period}</p>
    </Card>
  );
};
