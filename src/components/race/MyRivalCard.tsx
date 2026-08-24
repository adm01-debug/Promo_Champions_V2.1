import { Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMyRival } from '@/hooks/race/useMyRival';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface Props {
  seasonId?: string;
  myCarId?: string;
  entries: RaceLeaderboardEntry[];
  onHoverRival?: (rivalCarId: string | null) => void;
  className?: string;
}

/**
 * Card persistente de rival nomeado.
 * Onhover, sinaliza o rival na pista para receber contorno tracejado dourado.
 */
export function MyRivalCard({
  seasonId,
  myCarId,
  entries,
  onHoverRival,
  className,
}: Props) {
  const { data: rival } = useMyRival({ seasonId, myCarId, entries });

  if (!rival) return null;

  const ahead = rival.gap_pct >= 0;
  const gapAbs = Math.abs(rival.gap_pct);

  return (
    <Card
      variant="modern"
      className={cn('p-3 border-warning/30 bg-warning/5', className)}
      onMouseEnter={() => onHoverRival?.(rival.rival_car_id)}
      onMouseLeave={() => onHoverRival?.(null)}
      role="region"
      aria-label={`Seu rival é ${rival.rival_name}, gap de ${gapAbs.toFixed(1)}%`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0"
          aria-hidden
        >
          <Swords className="w-5 h-5 text-warning" />
        </motion.div>

        <Avatar className="w-9 h-9 ring-2 ring-warning/40 shrink-0">
          <AvatarImage src={rival.rival_avatar ?? undefined} alt={rival.rival_name} />
          <AvatarFallback className="text-xs font-bold">
            {rival.rival_name?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Seu rival
          </p>
          <p className="text-sm font-bold truncate">{rival.rival_name}</p>
        </div>

        <div className="text-right shrink-0">
          <div
            className={cn(
              'text-sm font-display font-black tabular-nums',
              ahead ? 'text-success' : 'text-destructive',
            )}
            aria-label={ahead ? `Você está ${gapAbs.toFixed(1)}% à frente` : `Você está ${gapAbs.toFixed(1)}% atrás`}
          >
            {ahead ? '+' : '−'}{gapAbs.toFixed(1)}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            #{rival.rival_car_number}
          </div>
        </div>
      </div>
    </Card>
  );
}
