import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTierMeta } from "./accountHelpers";

interface Props {
  tier: string | null | undefined;
  score: number | null | undefined;
  size?: "sm" | "default";
  className?: string;
}

export function AccountScoreBadge({ tier, score, size = "default", className }: Props) {
  const meta = getTierMeta(tier);
  const Icon = meta.icon;
  return (
    <Badge variant={meta.badgeVariant} size={size} className={cn("gap-1 font-medium", className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{meta.label}</span>
      {score !== null && score !== undefined && (
        <>
          <span className="opacity-70">·</span>
          <span>{Math.round(score)}</span>
        </>
      )}
    </Badge>
  );
}
