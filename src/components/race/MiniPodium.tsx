import { FC, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { fmtCompact } from './raceFormatters';
import { cn } from '@/lib/utils';

interface Props {
  entries: RaceLeaderboardEntry[];
  className?: string;
}

type SlotMeta = {
  position: 1 | 2 | 3;
  label: string;
  Icon: typeof Crown;
  ringClass: string;
  bgClass: string;
  emoji: string;
  size: 'lg' | 'md';
};

const META: Record<1 | 2 | 3, SlotMeta> = {
  1: {
    position: 1,
    label: '1º',
    Icon: Crown,
    ringClass: 'ring-warning shadow-[0_0_24px_hsl(var(--warning)/0.45)]',
    bgClass: 'bg-warning/15 text-warning',
    emoji: '🥇',
    size: 'lg',
  },
  2: {
    position: 2,
    label: '2º',
    Icon: Medal,
    ringClass: 'ring-muted-foreground/60',
    bgClass: 'bg-muted text-muted-foreground',
    emoji: '🥈',
    size: 'md',
  },
  3: {
    position: 3,
    label: '3º',
    Icon: Award,
    ringClass: 'ring-accent/70',
    bgClass: 'bg-accent/20 text-accent-foreground',
    emoji: '🥉',
    size: 'md',
  },
};

interface SlotProps {
  entry: RaceLeaderboardEntry;
  meta: SlotMeta;
  reducedMotion: boolean;
}

const PodiumSlot: FC<SlotProps> = ({ entry, meta, reducedMotion }) => {
  const isLeader = meta.position === 1;
  const avatarSize = meta.size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';

  return (
    <motion.div
      role="listitem"
      layoutId={`podium-${entry.car_id}`}
      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      className={cn(
        'relative flex flex-1 min-w-0 items-center gap-2.5 rounded-lg border bg-card/60 px-3 py-2 backdrop-blur',
        'border-border hover:border-primary/30 transition-colors',
        isLeader && 'sm:-translate-y-1 sm:px-3.5 sm:py-2.5',
      )}
      aria-label={`${meta.label}: ${entry.salesperson_name}`}
    >
      {isLeader && (
        <motion.div
          aria-hidden
          className="absolute -top-3.5 left-1/2 -translate-x-1/2"
          animate={reducedMotion ? undefined : { y: [0, -2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Crown className="h-4 w-4 text-warning drop-shadow-[0_0_6px_hsl(var(--warning)/0.6)]" />
        </motion.div>
      )}

      <div className="relative shrink-0">
        <Avatar className={cn(avatarSize, 'ring-2 ring-offset-2 ring-offset-background', meta.ringClass)}>
          <AvatarImage src={entry.avatar_url ?? undefined} alt={entry.salesperson_name} />
          <AvatarFallback>{entry.salesperson_name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black border-2 border-background',
            meta.bgClass,
          )}
          aria-hidden
        >
          {meta.position}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span aria-hidden className="text-xs">{meta.emoji}</span>
          <p className={cn('truncate font-semibold', meta.size === 'lg' ? 'text-sm' : 'text-xs')}>
            {entry.salesperson_name}
          </p>
        </div>
        <p
          className={cn(
            'font-display font-black tabular-nums leading-tight',
            meta.size === 'lg' ? 'text-base text-foreground' : 'text-sm text-muted-foreground',
          )}
        >
          {fmtCompact(Number(entry.total_sales))}
        </p>
      </div>

      <div
        className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black border-2"
        style={{
          background: entry.primary_color,
          color: entry.secondary_color,
          borderColor: entry.secondary_color,
        }}
        aria-label={`Carro número ${entry.car_number}`}
      >
        #{entry.car_number}
      </div>
    </motion.div>
  );
};

/**
 * Mini-pódium horizontal do top 3 da temporada.
 * Ordem visual: 2º · 1º (centro, elevado) · 3º.
 */
export const MiniPodium: FC<Props> = ({ entries, className }) => {
  const reducedMotion = useReducedMotion() ?? false;

  const ordered = useMemo(() => {
    const [first, second, third] = entries;
    return [
      second ? { entry: second, meta: META[2] } : null,
      first ? { entry: first, meta: META[1] } : null,
      third ? { entry: third, meta: META[3] } : null,
    ].filter((x): x is { entry: RaceLeaderboardEntry; meta: SlotMeta } => x !== null);
  }, [entries]);

  if (ordered.length === 0) return null;

  return (
    <motion.div
      role="list"
      aria-label="Top 3 da temporada"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      }}
      className={cn(
        'flex flex-col sm:flex-row items-stretch gap-2 pt-3',
        className,
      )}
    >
      {ordered.map(({ entry, meta }) => (
        <motion.div
          key={entry.car_id}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
          }}
          className="flex-1 min-w-0"
        >
          <PodiumSlot entry={entry} meta={meta} reducedMotion={reducedMotion} />
        </motion.div>
      ))}
    </motion.div>
  );
};
