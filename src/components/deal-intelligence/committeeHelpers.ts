import { Crown, Star, Users, ShieldOff, UserX, DollarSign, HelpCircle, type LucideIcon } from "lucide-react";

export type DMURole = "decision_maker" | "economic_buyer" | "champion" | "influencer" | "user" | "blocker" | "unknown";
export type InfluenceLevel = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "negative";
export type CoverageTier = "weak" | "partial" | "strong" | "complete";

export const dmuRoleLabel = (role: DMURole): string => ({
  decision_maker: "Decisor",
  economic_buyer: "Comprador Econômico",
  champion: "Champion",
  influencer: "Influenciador",
  user: "Usuário",
  blocker: "Blocker",
  unknown: "Indefinido",
}[role]);

export const dmuRoleIcon = (role: DMURole): LucideIcon => ({
  decision_maker: Star,
  economic_buyer: DollarSign,
  champion: Crown,
  influencer: Users,
  user: UserX,
  blocker: ShieldOff,
  unknown: HelpCircle,
}[role]);

export const dmuRoleColor = (role: DMURole): string => ({
  decision_maker: "text-primary",
  economic_buyer: "text-amber-500",
  champion: "text-emerald-500",
  influencer: "text-blue-500",
  user: "text-muted-foreground",
  blocker: "text-destructive",
  unknown: "text-muted-foreground",
}[role]);

export const influenceLabel = (lvl: InfluenceLevel): string => ({
  low: "Baixa", medium: "Média", high: "Alta",
}[lvl]);

export const sentimentColor = (s: Sentiment): string => ({
  positive: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  neutral: "bg-muted text-muted-foreground border-border",
  negative: "bg-destructive/10 text-destructive border-destructive/30",
}[s]);

export const sentimentLabel = (s: Sentiment): string => ({
  positive: "Positivo", neutral: "Neutro", negative: "Negativo",
}[s]);

export const tierLabel = (t: CoverageTier): string => ({
  weak: "Fraco", partial: "Parcial", strong: "Forte", complete: "Completo",
}[t]);

export const tierColor = (t: CoverageTier): string => ({
  weak: "text-destructive",
  partial: "text-amber-500",
  strong: "text-blue-500",
  complete: "text-emerald-500",
}[t]);

export const tierRingClass = (t: CoverageTier): string => ({
  weak: "stroke-destructive",
  partial: "stroke-amber-500",
  strong: "stroke-blue-500",
  complete: "stroke-emerald-500",
}[t]);

export const tierBadgeClass = (t: CoverageTier): string => ({
  weak: "bg-destructive/10 text-destructive border-destructive/30",
  partial: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  strong: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  complete: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
}[t]);

export const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
