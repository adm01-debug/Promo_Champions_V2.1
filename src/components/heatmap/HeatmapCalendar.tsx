import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface HeatmapCalendarProps {
  data: DataPoint[];
  startDate?: Date;
  endDate?: Date;
  colorScale?: string[];
  emptyColor?: string;
  cellSize?: number;
  gap?: number;
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  className?: string;
}

const defaultColorScale = [
  'bg-muted',
  'bg-green-200 dark:bg-green-900',
  'bg-green-300 dark:bg-green-800',
  'bg-green-400 dark:bg-green-700',
  'bg-green-500 dark:bg-green-600',
  'bg-green-600 dark:bg-green-500',
];

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  data,
  startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  endDate = new Date(),
  colorScale = defaultColorScale,
  cellSize = 12,
  gap = 2,
  showMonthLabels = true,
  showDayLabels = true,
  className,
}) => {
  const dataMap = new Map(data.map(d => [d.date, d]));
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getColorIndex = (value: number): number => {
    if (value === 0) return 0;
    const normalized = value / maxValue;
    return Math.min(Math.ceil(normalized * (colorScale.length - 1)), colorScale.length - 1);
  };

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const current = new Date(startDate);

  // Fill initial empty days
  const startDay = current.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null as any);
  }

  while (current <= endDate) {
    currentWeek.push(new Date(current));
    if (current.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="flex gap-1">
        {showDayLabels && (
          <div
            className="flex flex-col justify-around text-xs text-muted-foreground pr-2"
            style={{ marginTop: showMonthLabels ? 20 : 0 }}
          >
            {[1, 3, 5].map(i => (
              <span key={i} style={{ height: cellSize, lineHeight: `${cellSize}px` }}>
                {dayLabels[i]}
              </span>
            ))}
          </div>
        )}

        <div>
          {showMonthLabels && (
            <div className="flex text-xs text-muted-foreground mb-1" style={{ height: 16 }}>
              {weeks.map((week, weekIndex) => {
                const firstDay = week.find(d => d);
                if (!firstDay) return null;
                const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                if (!isFirstWeekOfMonth) return null;
                return (
                  <span
                    key={weekIndex}
                    style={{
                      position: 'absolute',
                      left: weekIndex * (cellSize + gap) + (showDayLabels ? 30 : 0),
                    }}
                  >
                    {monthLabels[firstDay.getMonth()]}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex" style={{ gap }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap }}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return (
                      <div
                        key={dayIndex}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  }

                  const dateStr = formatDate(date);
                  const point = dataMap.get(dateStr);
                  const value = point?.value || 0;
                  const colorIndex = getColorIndex(value);

                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                          className={cn(
                            'rounded-sm cursor-pointer transition-transform hover:scale-125',
                            colorScale[colorIndex]
                          )}
                          style={{ width: cellSize, height: cellSize }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{point?.label || value}</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('pt-BR')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 text-xs text-muted-foreground">
        <span>Menos</span>
        {colorScale.map((color, i) => (
          <div
            key={i}
            className={cn('rounded-sm', color)}
            style={{ width: cellSize, height: cellSize }}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
};
