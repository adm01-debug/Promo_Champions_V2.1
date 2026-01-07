import { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar, RefreshCw, Download, Filter } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => (
  <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6", className)}>
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultDateOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'ytd', label: 'Este ano' },
  { value: '12m', label: 'Últimos 12 meses' },
];

export const DateRangeSelector: FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  options = defaultDateOptions,
  className
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={cn("w-[180px]", className)}>
      <Calendar className="h-4 w-4 mr-2" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

interface DashboardActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const DashboardActions: FC<DashboardActionsProps> = ({
  onRefresh,
  onExport,
  onFilter,
  isRefreshing,
  className
}) => (
  <div className={cn("flex items-center gap-2", className)}>
    {onFilter && (
      <Button variant="outline" size="sm" onClick={onFilter}>
        <Filter className="h-4 w-4 mr-2" />
        Filtrar
      </Button>
    )}
    {onExport && (
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    )}
    {onRefresh && (
      <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </Button>
    )}
  </div>
);

interface MetricsSummaryProps {
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  className?: string;
}

export const MetricsSummary: FC<MetricsSummaryProps> = ({ metrics, className }) => (
  <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
    {metrics.map((m, i) => (
      <Card key={i}>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{m.label}</p>
          <p className="text-2xl font-bold">{m.value}</p>
          {m.change !== undefined && (
            <p className={cn(
              "text-xs",
              m.trend === 'up' && "text-green-500",
              m.trend === 'down' && "text-red-500"
            )}>
              {m.change > 0 ? '+' : ''}{m.change}%
            </p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);

interface DashboardTabsProps {
  tabs: Array<{ id: string; label: string; content: ReactNode }>;
  defaultTab?: string;
  className?: string;
}

export const DashboardTabs: FC<DashboardTabsProps> = ({
  tabs,
  defaultTab,
  className
}) => (
  <Tabs defaultValue={defaultTab || tabs[0]?.id} className={className}>
    <TabsList>
      {tabs.map(tab => (
        <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
      ))}
    </TabsList>
    {tabs.map(tab => (
      <TabsContent key={tab.id} value={tab.id}>{tab.content}</TabsContent>
    ))}
  </Tabs>
);

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export const WidgetCard: FC<WidgetCardProps> = ({
  title,
  subtitle,
  action,
  children,
  loading,
  className
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);
