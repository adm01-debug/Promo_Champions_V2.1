import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface Props {
  clientId?: string;
  timeframe?: 'month' | 'quarter' | 'year';
}

export const ChurnPrediction: FC<Props> = ({ clientId, timeframe = 'quarter' }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Predição de Churn</h3>
      <p className="text-sm text-muted-foreground">Timeframe: {timeframe}</p>
    </Card>
  );
};
