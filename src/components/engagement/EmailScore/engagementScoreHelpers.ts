import { Snowflake, Sun, Flame, Trophy, type LucideIcon } from "lucide-react";

export type EngagementTier = "cold" | "warm" | "hot" | "champion";

export interface TierMeta {
  label: string;
  icon: LucideIcon;
  badgeVariant: "info" | "warning" | "high" | "destructive";
  ringClass: string;
  textClass: string;
  bgClass: string;
}

export const TIER_META: Record<EngagementTier, TierMeta> = {
  cold: {
    label: "Cold",
    icon: Snowflake,
    badgeVariant: "info",
    ringClass: "ring-info/40",
    textClass: "text-info",
    bgClass: "bg-info/10",
  },
  warm: {
    label: "Warm",
    icon: Sun,
    badgeVariant: "warning",
    ringClass: "ring-warning/40",
    textClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  hot: {
    label: "Hot",
    icon: Flame,
    badgeVariant: "high",
    ringClass: "ring-orange-500/40",
    textClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
  },
  champion: {
    label: "Champion",
    icon: Trophy,
    badgeVariant: "destructive",
    ringClass: "ring-destructive/40",
    textClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
};

export function tierForScore(score: number): EngagementTier {
  if (score >= 75) return "champion";
  if (score >= 50) return "hot";
  if (score >= 25) return "warm";
  return "cold";
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}
