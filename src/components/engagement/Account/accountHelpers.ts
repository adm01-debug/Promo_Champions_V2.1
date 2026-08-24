import { Building2, Crown, Trophy, Star } from "lucide-react";

export type AccountTier = "tier1" | "tier2" | "tier3" | string;

export const ACCOUNT_TIER_META: Record<string, {
  label: string;
  icon: typeof Building2;
  badgeVariant: "won" | "qualified" | "low";
  ringColor: string;
}> = {
  tier1: { label: "Tier 1", icon: Crown, badgeVariant: "won", ringColor: "hsl(var(--success))" },
  tier2: { label: "Tier 2", icon: Trophy, badgeVariant: "qualified", ringColor: "hsl(var(--primary))" },
  tier3: { label: "Tier 3", icon: Star, badgeVariant: "low", ringColor: "hsl(var(--muted-foreground))" },
  strategic: { label: "Estratégica", icon: Crown, badgeVariant: "won", ringColor: "hsl(var(--success))" },
  enterprise: { label: "Enterprise", icon: Trophy, badgeVariant: "qualified", ringColor: "hsl(var(--primary))" },
  mid_market: { label: "Mid Market", icon: Building2, badgeVariant: "qualified", ringColor: "hsl(var(--primary))" },
  smb: { label: "SMB", icon: Star, badgeVariant: "low", ringColor: "hsl(var(--muted-foreground))" },
};

export function getTierMeta(tier: string | null | undefined) {
  return ACCOUNT_TIER_META[tier ?? "tier3"] ?? ACCOUNT_TIER_META.tier3;
}

export function formatCoverage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}
