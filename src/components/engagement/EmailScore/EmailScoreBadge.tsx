import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TIER_META, formatPct, type EngagementTier } from "./engagementScoreHelpers";

interface Props {
  score: number | null | undefined;
  tier: EngagementTier | null | undefined;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
  size?: "sm" | "default";
  className?: string;
}

export function EmailScoreBadge({
  score,
  tier,
  openRate,
  clickRate,
  replyRate,
  size = "default",
  className,
}: Props) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" size={size} className={cn("gap-1 text-muted-foreground", className)}>
        Sem dados
      </Badge>
    );
  }
  const meta = TIER_META[tier ?? "cold"];
  const Icon = meta.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={meta.badgeVariant}
            size={size}
            className={cn("gap-1 font-medium cursor-help", className)}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span>{meta.label}</span>
            <span className="opacity-70">·</span>
            <span>{Math.round(score)}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs space-y-1">
          <div className="font-semibold">Engajamento por e-mail</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-muted-foreground">Abertura</span><span>{formatPct(openRate)}</span>
            <span className="text-muted-foreground">Cliques</span><span>{formatPct(clickRate)}</span>
            <span className="text-muted-foreground">Respostas</span><span>{formatPct(replyRate)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
