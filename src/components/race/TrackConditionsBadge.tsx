import { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TrackConditionsResult } from '@/hooks/race/useTrackConditions';
import { cn } from '@/lib/utils';

interface Props {
  conditions: TrackConditionsResult;
}

const TONE: Record<TrackConditionsResult['condition'], string> = {
  sunny: 'border-warning/40 bg-warning/10 text-warning-foreground',
  cloudy: 'border-muted-foreground/30 bg-muted/40 text-foreground',
  rainy: 'border-info/40 bg-info/10 text-info',
  storm: 'border-destructive/50 bg-destructive/10 text-destructive',
};

export const TrackConditionsBadge: FC<Props> = ({ conditions }) => {
  const reduce = useReducedMotion();
  const animate = !reduce && (conditions.condition === 'sunny' || conditions.condition === 'storm');

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            role="status"
            aria-label={`Condições da pista: ${conditions.label}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-help select-none',
              TONE[conditions.condition],
            )}
            animate={animate ? { scale: [1, 1.05, 1] } : undefined}
            transition={animate ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
          >
            <span aria-hidden className="text-base leading-none">{conditions.emoji}</span>
            <span>{conditions.label}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[240px]">
          <p className="font-semibold">{conditions.emoji} {conditions.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{conditions.description}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {conditions.recentDeals} eventos nas últimas 2h · intensidade {conditions.intensity.toFixed(2)}x
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
