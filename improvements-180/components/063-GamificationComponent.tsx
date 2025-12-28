import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface GamificationProps {
  userId?: string;
  value?: number;
}

export const GamificationComponent: FC<GamificationProps> = ({ 
  userId, 
  value = 0 
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <span className="font-semibold">{value}</span>
      </div>
    </Card>
  );
};
