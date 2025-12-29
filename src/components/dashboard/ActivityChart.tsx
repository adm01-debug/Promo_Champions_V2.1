import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface ActivityChartProps {
  userId?: string;
  timeRange?: 'week' | 'month' | 'quarter';
}

export const ActivityChart: FC<ActivityChartProps> = ({ 
  userId,
  timeRange = 'month'
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Atividades</h3>
      <p className="text-sm text-muted-foreground">Período: {timeRange}</p>
      {userId && <p className="text-xs">Usuário: {userId}</p>}
    </Card>
  );
};
