import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { GhostCarResult } from '@/hooks/race/useGhostCar';

interface Props {
  ghost: GhostCarResult;
}

/**
 * Badge que mostra delta vs. PR pessoal (best previous season).
 */
export function GhostStatusBadge({ ghost }: Props) {
  if (ghost.status === 'no-data') return null;

  const sign = ghost.delta >= 0 ? '+' : '';
  const formatted = `${sign}${ghost.delta.toFixed(1)}pp`;

  const variantClasses =
    ghost.status === 'ahead'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
      : ghost.status === 'behind'
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80';

  const label =
    ghost.status === 'ahead'
      ? `Acima do seu PR`
      : ghost.status === 'behind'
        ? `Abaixo do seu PR`
        : `Empate com seu PR`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('gap-1.5 cursor-help', variantClasses)}>
            <span aria-hidden>👻</span>
            <span className="text-xs font-semibold tabular-nums">{formatted}</span>
            <span className="hidden sm:inline text-xs opacity-80">vs PR</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            Comparando seu ritmo atual com sua melhor season anterior
            {ghost.bestSeasonName && ` ("${ghost.bestSeasonName}")`}.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ghost: {(ghost.ghostProgress * 100).toFixed(1)}% · Você: {(ghost.myProgress * 100).toFixed(1)}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
