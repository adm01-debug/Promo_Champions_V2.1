import { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const ChartContainer: FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  actions,
  className
}) => (
  <Card className={cn("h-full", className)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: FC<TrendIndicatorProps> = ({
  value,
  suffix = '%',
  showIcon = true,
  size = 'md'
}) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-medium",
      sizeClasses[size],
      isPositive && "text-green-600",
      !isPositive && !isNeutral && "text-red-600",
      isNeutral && "text-muted-foreground"
    )}>
      {showIcon && (
        isPositive ? <TrendingUp size={iconSizes[size]} /> :
        isNeutral ? <Minus size={iconSizes[size]} /> :
        <TrendingDown size={iconSizes[size]} />
      )}
      {isPositive && '+'}{value}{suffix}
    </span>
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  value?: string | number;
}

export const LegendItem: FC<LegendItemProps> = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <div 
      className="w-3 h-3 rounded-full" 
      style={{ backgroundColor: color }}
    />
    <span className="text-sm text-muted-foreground">{label}</span>
    {value !== undefined && (
      <span className="text-sm font-medium ml-auto">{value}</span>
    )}
  </div>
);

interface ChartLegendProps {
  items: LegendItemProps[];
  direction?: 'horizontal' | 'vertical';
}

export const ChartLegend: FC<ChartLegendProps> = ({ 
  items, 
  direction = 'horizontal' 
}) => (
  <div className={cn(
    "flex gap-4",
    direction === 'vertical' && "flex-col gap-2"
  )}>
    {items.map((item, idx) => (
      <LegendItem key={idx} {...item} />
    ))}
  </div>
);

interface NoDataPlaceholderProps {
  message?: string;
  icon?: ReactNode;
}

export const NoDataPlaceholder: FC<NoDataPlaceholderProps> = ({
  message = "Sem dados disponíveis",
  icon
}) => (
  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
    {icon}
    <p className="text-sm mt-2">{message}</p>
  </div>
);
