import { Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  swapCount: number;
  rivalName?: string;
}

/**
 * Badge visual de rivalidade. Usa tokens semânticos.
 */
export function RivalryBadge({ swapCount, rivalName }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 px-1.5 py-0 h-5 border-destructive/40 text-destructive text-[10px] font-bold">
            <Swords className="w-2.5 h-2.5" aria-hidden />
            {swapCount}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            Rivalidade {rivalName ? `com ${rivalName}` : ''} · {swapCount} ultrapassagens
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
