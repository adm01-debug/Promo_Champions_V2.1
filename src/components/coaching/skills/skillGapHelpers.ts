export type SkillKey = "discovery" | "qualification" | "objection_handling" | "closing" | "prospecting" | "negotiation";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type SkillTrend = "improving" | "stable" | "declining";

export const SKILL_LABELS: Record<SkillKey, string> = {
  discovery: "Descoberta",
  qualification: "Qualificação",
  objection_handling: "Objeções",
  closing: "Fechamento",
  prospecting: "Prospecção",
  negotiation: "Negociação",
};

export const SKILL_KEYS: SkillKey[] = ["discovery", "qualification", "objection_handling", "closing", "prospecting", "negotiation"];

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Expert",
};

export const LEVEL_BADGE: Record<SkillLevel, "destructive" | "warning" | "default" | "secondary"> = {
  beginner: "destructive",
  intermediate: "warning",
  advanced: "default",
  expert: "secondary",
};

export const LEVEL_BG_CLASS: Record<SkillLevel, string> = {
  beginner: "bg-destructive/15 text-destructive border-destructive/30",
  intermediate: "bg-warning/15 text-warning border-warning/30",
  advanced: "bg-primary/15 text-primary border-primary/30",
  expert: "bg-success/15 text-success border-success/30",
};

export const TREND_LABEL: Record<SkillTrend, string> = {
  improving: "Melhorando",
  stable: "Estável",
  declining: "Caindo",
};

export const TREND_ICON: Record<SkillTrend, string> = {
  improving: "↑",
  stable: "→",
  declining: "↓",
};

export const TREND_COLOR: Record<SkillTrend, string> = {
  improving: "text-success",
  stable: "text-muted-foreground",
  declining: "text-destructive",
};

export function levelFromScore(score: number): SkillLevel {
  if (score >= 85) return "expert";
  if (score >= 65) return "advanced";
  if (score >= 40) return "intermediate";
  return "beginner";
}

export function formatScore(s: number): string {
  return `${Math.round(s)}/100`;
}
