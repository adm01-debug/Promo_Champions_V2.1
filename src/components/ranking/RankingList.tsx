import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RankItem {
  id: string;
  name: string;
  value: number;
  avatar?: string;
  subtitle?: string;
  change?: number;
}

interface RankingListProps {
  items: RankItem[];
  valueFormatter?: (value: number) => string;
  showMedals?: boolean;
  showChange?: boolean;
  maxItems?: number;
  className?: string;
}

const medals = ['🥇', '🥈', '🥉'];

export const RankingList: React.FC<RankingListProps> = ({
  items,
  valueFormatter = v => v.toLocaleString(),
  showMedals = true,
  showChange = true,
  maxItems = 10,
  className,
}) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className={cn('space-y-2', className)}>
      {displayItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-colors',
            index < 3 ? 'bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'
          )}
        >
          <div className="w-8 text-center flex-shrink-0">
            {showMedals && index < 3 ? (
              <span className="text-xl">{medals[index]}</span>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {index + 1}º
              </span>
            )}
          </div>

          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
              {item.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {item.subtitle}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="font-semibold">{valueFormatter(item.value)}</p>
            {showChange && item.change !== undefined && (
              <p
                className={cn(
                  'text-xs',
                  item.change > 0
                    ? 'text-green-500'
                    : item.change < 0
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                )}
              >
                {item.change > 0 ? '↑' : item.change < 0 ? '↓' : '–'}{' '}
                {Math.abs(item.change)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface LeaderboardCardProps {
  title: string;
  items: RankItem[];
  period?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  items,
  period,
  valueFormatter,
  className,
}) => {
  return (
    <div className={cn('bg-card rounded-xl border p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        {period && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {period}
          </span>
        )}
      </div>
      <RankingList items={items} valueFormatter={valueFormatter} maxItems={5} />
    </div>
  );
};
