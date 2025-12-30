import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, subWeeks, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange, dates: DateRange) => void;
  showCustom?: boolean;
  className?: string;
}

const getDateRange = (range: TimeRange): DateRange => {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case 'week':
      return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { start: subMonths(now, 3), end: now };
    case 'year':
      return { start: subMonths(now, 12), end: now };
    default:
      return { start: startOfMonth(now), end: now };
  }
};

export const TimeRangePicker: FC<TimeRangePickerProps> = ({
  value,
  onChange,
  showCustom = false,
  className,
}) => {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Ano' },
  ];

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {ranges.map(range => (
        <Button
          key={range.value}
          variant={value === range.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(range.value, getDateRange(range.value))}
        >
          {range.label}
        </Button>
      ))}
      {showCustom && (
        <Button variant="outline" size="sm" className="gap-1">
          <Calendar size={14} />
          Personalizado
        </Button>
      )}
    </div>
  );
};

interface ComparisonPeriodProps {
  currentPeriod: string;
  previousPeriod: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canGoNext?: boolean;
  className?: string;
}

export const ComparisonPeriod: FC<ComparisonPeriodProps> = ({
  currentPeriod,
  previousPeriod,
  onNavigate,
  canGoNext = false,
  className,
}) => (
  <div className={cn('flex items-center justify-between', className)}>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onNavigate?.('prev')}
    >
      <ChevronLeft size={16} />
    </Button>
    <div className="text-center">
      <p className="font-medium">{currentPeriod}</p>
      <p className="text-xs text-muted-foreground">vs {previousPeriod}</p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onNavigate?.('next')}
      disabled={!canGoNext}
    >
      <ChevronRight size={16} />
    </Button>
  </div>
);
