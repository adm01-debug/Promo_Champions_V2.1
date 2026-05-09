import { Badge } from "@/components/ui/badge";
import { Heart, AlertTriangle, AlertCircle, Activity } from "lucide-react";
import type { HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { tierColor, tierLabel } from "./dealHealthHelpers";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  tier: HealthTier;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const tierIcon = (tier: HealthTier) => {
  switch (tier) {
    case "healthy": return Heart;
    case "watch": return Activity;
    case "at_risk": return AlertTriangle;
    case "critical": return AlertCircle;
  }
};

export function DealHealthScoreBadge({ score, tier, size = "sm", showLabel = false, className }: Props) {
  const Icon = tierIcon(tier);
  const isCritical = tier === "critical";
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-display font-semibold border relative",
        tierColor(tier),
        size === "sm" ? "text-[10px] px-1.5 py-0.5 h-5" : "text-xs px-2 py-0.5 h-6",
        isCritical && "animate-pulse border-destructive/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
        className,
      )}
    >
      {isCritical && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </span>
      )}
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span>{Math.round(score)}</span>
      {showLabel && <span className="hidden sm:inline">· {tierLabel(tier)}</span>}
    </Badge>
  );
}
