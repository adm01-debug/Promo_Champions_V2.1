import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trendValue && (
          <p className={cn(
            'text-xs',
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
