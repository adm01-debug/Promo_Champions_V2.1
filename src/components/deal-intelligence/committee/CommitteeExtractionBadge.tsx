import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  evidenceQuote?: string | null;
  confidence?: number | null;
}

export function CommitteeExtractionBadge({ evidenceQuote, confidence }: Props) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 text-[10px] border-primary/30 text-primary cursor-help">
            <Sparkles className="h-2.5 w-2.5" />
            IA
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="text-[11px] font-medium">Extraído de call por IA</div>
            {typeof confidence === "number" && (
              <div className="text-[10px] text-muted-foreground">Confiança: {(confidence * 100).toFixed(0)}%</div>
            )}
            {evidenceQuote && (
              <div className="text-[11px] italic border-l-2 border-primary/40 pl-2 mt-1">"{evidenceQuote}"</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
