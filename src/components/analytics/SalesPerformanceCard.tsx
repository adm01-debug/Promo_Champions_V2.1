import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp, TrendingDown, Target, DollarSign, Users, Phone, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface SalespersonPerformance {
  id: string;
  name: string;
  avatar?: string;
  revenue: number;
  target: number;
  deals: number;
  conversionRate: number;
  activitiesCount: number;
  trend: 'up' | 'down' | 'stable';
  rank?: number;
}

interface SalesPerformanceCardProps {
  salesperson: SalespersonPerformance;
  showRank?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SalesPerformanceCard: FC<SalesPerformanceCardProps> = ({
  salesperson,
  showRank = true,
  onClick,
  className,
}) => {
  const percentageOfTarget = (salesperson.revenue / salesperson.target) * 100;
  const isTopPerformer = salesperson.rank && salesperson.rank <= 3;

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card
        className={cn(
          'p-4 cursor-pointer transition-all',
          isTopPerformer && 'border-primary/30',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          {showRank && salesperson.rank && (
            <div className="flex flex-col items-center">
              {salesperson.rank === 1 && (
                <Trophy size={20} className="text-yellow-500 mb-1" />
              )}
              <span className={cn(
                'text-lg font-bold',
                salesperson.rank === 1 && 'text-yellow-500',
                salesperson.rank === 2 && 'text-gray-400',
                salesperson.rank === 3 && 'text-amber-600'
              )}>
                #{salesperson.rank}
              </span>
            </div>
          )}

          <Avatar className="h-12 w-12">
            <AvatarImage src={salesperson.avatar} alt={salesperson.name} />
            <AvatarFallback>{salesperson.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{salesperson.name}</h4>
              {salesperson.trend === 'up' && (
                <TrendingUp size={16} className="text-green-500" />
              )}
              {salesperson.trend === 'down' && (
                <TrendingDown size={16} className="text-red-500" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-medium">
                  R$ {salesperson.revenue.toLocaleString()} / R$ {salesperson.target.toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(percentageOfTarget, 100)} className="h-2" />
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target size={12} />
                {salesperson.deals} negócios
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} />
                {salesperson.conversionRate}% conversão
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {salesperson.activitiesCount} atividades
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface TeamPerformanceTableProps {
  salespeople: SalespersonPerformance[];
  onRowClick?: (salesperson: SalespersonPerformance) => void;
}

export const TeamPerformanceTable: FC<TeamPerformanceTableProps> = ({
  salespeople,
  onRowClick,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b text-left">
          <th className="pb-3 text-sm font-medium text-muted-foreground">#</th>
          <th className="pb-3 text-sm font-medium text-muted-foreground">Vendedor</th>
          <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Receita</th>
          <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Meta</th>
          <th className="pb-3 text-sm font-medium text-muted-foreground text-right">%</th>
          <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Negócios</th>
        </tr>
      </thead>
      <tbody>
        {salespeople.map((person, index) => {
          const percentage = (person.revenue / person.target) * 100;
          return (
            <tr
              key={person.id}
              className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick?.(person)}
            >
              <td className="py-3 text-sm font-medium">{index + 1}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback className="text-xs">
                      {person.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{person.name}</span>
                </div>
              </td>
              <td className="py-3 text-sm text-right font-medium">
                R$ {person.revenue.toLocaleString()}
              </td>
              <td className="py-3 text-sm text-right text-muted-foreground">
                R$ {person.target.toLocaleString()}
              </td>
              <td className="py-3 text-right">
                <Badge variant={percentage >= 100 ? 'default' : percentage >= 75 ? 'secondary' : 'destructive'}>
                  {percentage.toFixed(0)}%
                </Badge>
              </td>
              <td className="py-3 text-sm text-right">{person.deals}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
