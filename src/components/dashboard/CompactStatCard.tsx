import React, { FC } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type CardVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface CompactStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: CardVariant;
  subtitle?: string;
  className?: string;
}

const variantStyles: Record<CardVariant, { bg: string; text: string; iconBg: string }> = {
  primary: {
    bg: 'bg-primary/5 border-primary/20',
    text: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  success: {
    bg: 'bg-success/5 border-success/20',
    text: 'text-success',
    iconBg: 'bg-success/10',
  },
  warning: {
    bg: 'bg-warning/5 border-warning/20',
    text: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  danger: {
    bg: 'bg-destructive/5 border-destructive/20',
    text: 'text-destructive',
    iconBg: 'bg-destructive/10',
  },
  info: {
    bg: 'bg-info/5 border-info/20',
    text: 'text-info',
    iconBg: 'bg-info/10',
  },
};

export const CompactStatCard: FC<CompactStatCardProps> = React.memo(({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  subtitle,
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-3 border transition-all hover:shadow-md',
      styles.bg,
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <motion.p 
            className={cn('text-xl font-bold truncate', styles.text)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-lg shrink-0', styles.iconBg)}>
            <Icon className={cn('h-4 w-4', styles.text)} />
          </div>
        )}
      </div>
    </Card>
  );
};
