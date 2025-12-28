import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentProps {
  data?: any[];
  title?: string;
  onAction?: () => void;
}

export const AnalyticsComponent: FC<ComponentProps> = ({ 
  data = [], 
  title = 'Analytics',
  onAction 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
