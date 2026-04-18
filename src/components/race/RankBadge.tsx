import { Crown, Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md';
  className?: string;
}

const RANK_LABELS: Record<number, string> = {
  1: 'Líder',
  2: 'Segundo lugar',
  3: 'Terceiro lugar',
};

/**
 * Hierarquia visual sem depender de cor: cada rank tem forma + ícone próprios.
 * P1=Crown, P2=Trophy, P3=Medal, P4+=número em hexágono.
 * Inclui aria-label semântico.
 */
export function RankBadge({ rank, size = 'sm', className }: RankBadgeProps) {
  const dims = size === 'md' ? 'h-6 w-6 text-xs' : 'h-5 w-5 text-[10px]';
  const iconSize = size === 'md' ? 14 : 11;
  const ariaLabel = RANK_LABELS[rank] ?? `Posição ${rank}`;

  if (rank === 1) {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-warning/20 ring-1 ring-warning/60',
          dims, className,
        )}
      >
        <Crown className="text-warning" strokeWidth={2.5} width={iconSize} height={iconSize} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-center bg-muted/60 ring-1 ring-muted-foreground/40',
          dims, className,
        )}
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      >
        <Trophy className="text-foreground/80" strokeWidth={2.5} width={iconSize} height={iconSize} />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-orange-500/15 ring-1 ring-orange-500/50',
          dims, className,
        )}
      >
        <Medal className="text-orange-500" strokeWidth={2.5} width={iconSize} height={iconSize} />
      </span>
    );
  }
  // P4+: hexágono com número
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center bg-muted/40 font-black tabular-nums text-muted-foreground ring-1 ring-border',
        dims, className,
      )}
      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
    >
      {rank}
    </span>
  );
}
