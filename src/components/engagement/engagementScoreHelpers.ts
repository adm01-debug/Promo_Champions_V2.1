import { Snowflake, Sun, Flame, Zap, type LucideIcon } from "lucide-react";
import type { EngagementTier } from "@/hooks/engagement/useEngagementScore";

export interface TierMeta {
  label: string;
  icon: LucideIcon;
  colorClass: string; // text + bg semantic
  badgeVariant: "info" | "warning" | "high" | "destructive";
  hexAccent: string; // for sparkline stroke
}

export const TIER_META: Record<EngagementTier, TierMeta> = {
  cold: {
    label: "Frio",
    icon: Snowflake,
    colorClass: "bg-info/15 text-info border-info/30",
    badgeVariant: "info",
    hexAccent: "hsl(var(--info))",
  },
  warm: {
    label: "Morno",
    icon: Sun,
    colorClass: "bg-warning/15 text-warning border-warning/30",
    badgeVariant: "warning",
    hexAccent: "hsl(var(--warning))",
  },
  hot: {
    label: "Quente",
    icon: Flame,
    colorClass: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    badgeVariant: "high",
    hexAccent: "hsl(var(--destructive))",
  },
  on_fire: {
    label: "Em Chamas",
    icon: Zap,
    colorClass: "bg-destructive/15 text-destructive border-destructive/30",
    badgeVariant: "destructive",
    hexAccent: "hsl(var(--destructive))",
  },
};

export function tierFromScore(score: number): EngagementTier {
  if (score >= 81) return "on_fire";
  if (score >= 51) return "hot";
  if (score >= 21) return "warm";
  return "cold";
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  return Math.round(score).toString();
}
