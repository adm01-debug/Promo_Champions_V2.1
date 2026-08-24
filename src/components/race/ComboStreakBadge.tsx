import { motion, useReducedMotion } from 'framer-motion';
import { Flame, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRaceStreak } from '@/hooks/race/useRaceStreak';

interface Props {
  salespersonId?: string;
  seasonStart?: string;
  seasonEnd?: string;
  className?: string;
  compact?: boolean;
}

type Tier = {
  Icon: typeof Flame;
  bg: string;
  ring: string;
  iconClass: string;
  label: string;
};

function getTier(days: number): Tier | null {
  if (days >= 14) {
    return {
      Icon: Crown,
      bg: 'bg-gradient-to-br from-destructive via-warning to-primary',
      ring: 'ring-2 ring-warning/60 shadow-[0_0_18px_-2px_hsl(var(--warning)/0.7)]',
      iconClass: 'text-warning-foreground drop-shadow',
      label: 'LENDÁRIO',
    };
  }
  if (days >= 7) {
    return {
      Icon: Zap,
      bg: 'bg-gradient-to-br from-warning to-destructive',
      ring: 'ring-1 ring-destructive/40 shadow-[0_0_12px_-3px_hsl(var(--destructive)/0.6)]',
      iconClass: 'text-warning-foreground',
      label: 'EM CHAMAS',
    };
  }
  if (days >= 3) {
    return {
      Icon: Flame,
      bg: 'bg-gradient-to-br from-warning/90 to-warning',
      ring: 'ring-1 ring-warning/40',
      iconClass: 'text-warning-foreground',
      label: 'AQUECENDO',
    };
  }
  return null;
}

export function ComboStreakBadge({
  salespersonId,
  seasonStart,
  seasonEnd,
  className,
  compact,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { streakDays, isOnFire, isLegendary, isLoading } = useRaceStreak({
    salespersonId,
    seasonStart,
    seasonEnd,
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          'h-6 w-16 rounded-full bg-muted/50 animate-pulse',
          className,
        )}
        aria-hidden
      />
    );
  }

  const tier = getTier(streakDays);

  if (!tier) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground',
          className,
        )}
        aria-label="Sem sequência ativa"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        {!compact && <span>Comece sua sequência</span>}
      </div>
    );
  }

  const { Icon, bg, ring, iconClass, label } = tier;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        reduceMotion
          ? { scale: 1, opacity: 1 }
          : isOnFire
            ? { scale: [1, 1.04, 1], opacity: 1 }
            : { scale: 1, opacity: 1 }
      }
      transition={
        isOnFire && !reduceMotion
          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 280, damping: 22 }
      }
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 overflow-hidden',
        bg,
        ring,
        className,
      )}
      role="status"
      aria-label={`Sequência de ${streakDays} dias consecutivos com vendas`}
      title={`${streakDays} dias seguidos vendendo — ${label}`}
    >
      {/* Shimmer for legendary */}
      {isLegendary && !reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 -inset-x-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <Icon className={cn('relative w-3 h-3', iconClass)} aria-hidden />
      <span className="relative font-display text-[11px] font-black leading-none text-warning-foreground tabular-nums">
        {streakDays}
      </span>
      {!compact && (
        <span className="relative text-[9px] font-bold uppercase tracking-wider text-warning-foreground/90 leading-none">
          dias
        </span>
      )}
    </motion.div>
  );
}
