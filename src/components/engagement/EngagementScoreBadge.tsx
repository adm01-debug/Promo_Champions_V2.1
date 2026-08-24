import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TIER_META, formatScore } from "./engagementScoreHelpers";
import type { EngagementTier } from "@/hooks/engagement/useEngagementScore";

interface Props {
  score: number | null | undefined;
  tier: EngagementTier | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function EngagementScoreBadge({
  score,
  tier,
  showLabel = false,
  size = "default",
  className,
}: Props) {
  const meta = TIER_META[tier ?? "cold"];
  const Icon = meta.icon;

  return (
    <Badge
      variant={meta.badgeVariant}
      size={size}
      className={cn("gap-1 font-medium", className)}
      title={`Engajamento: ${formatScore(score)}/100 — ${meta.label}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{formatScore(score)}</span>
      {showLabel && <span className="ml-0.5 hidden sm:inline">{meta.label}</span>}
    </Badge>
  );
}
