import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RacePrediction } from '@/hooks/race/useRacePredictions';
import { fmtCurrency } from './raceFormatters';

interface Props {
  prediction?: RacePrediction;
  className?: string;
}

const STYLES = {
  up: { Icon: TrendingUp, color: 'text-success', bg: 'bg-success/15' },
  down: { Icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/15' },
  stable: { Icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted/40' },
} as const;

export function PredictedRankBadge({ prediction, className }: Props) {
  if (!prediction) return null;
  const { trend, projectedRank, deltaRanks, paceDaily } = prediction;
  const style = STYLES[trend];
  const Icon = style.Icon;

  const deltaLabel =
    deltaRanks > 0 ? `+${deltaRanks}` : deltaRanks < 0 ? `${deltaRanks}` : '0';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.span
          key={trend}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold tabular-nums',
            style.bg,
            style.color,
            className,
          )}
          aria-label={`Projeção P${projectedRank}, tendência ${trend}`}
        >
          <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
          <span>P{projectedRank}</span>
        </motion.span>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        <p className="font-semibold">Projeção final: P{projectedRank}</p>
        <p className="text-muted-foreground">
          {trend === 'up' && `Subindo ${deltaLabel} posições`}
          {trend === 'down' && `Caindo ${deltaLabel} posições`}
          {trend === 'stable' && 'Mantendo posição'}
        </p>
        <p className="text-muted-foreground tabular-nums">
          Ritmo: {fmtCurrency(paceDaily)}/dia
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
