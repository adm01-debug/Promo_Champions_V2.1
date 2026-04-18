export type QuestionCategory = "open" | "closed" | "discovery" | "impact" | "leading" | "other";
export type QuestionHealth = "poor" | "fair" | "good" | "excellent";

export interface QuestionAnalysis {
  id: string;
  recording_id: string;
  total_questions: number;
  open_questions: number;
  closed_questions: number;
  discovery_questions: number;
  impact_questions: number;
  leading_questions: number;
  avg_depth: number;
  question_density: number;
  quality_score: number;
  health: QuestionHealth;
  factors: Record<string, unknown>;
  calculated_at: string;
}

export interface CallQuestion {
  id: string;
  recording_id: string;
  turn_index: number;
  text: string;
  category: QuestionCategory;
  depth: number;
  start_estimate: number;
  created_at: string;
}

export function categoryLabel(c: QuestionCategory): string {
  return { open: "Aberta", closed: "Fechada", discovery: "Discovery", impact: "Impacto", leading: "Indutiva", other: "Outras" }[c];
}

export function categoryHsl(c: QuestionCategory): string {
  return {
    open: "hsl(var(--info))",
    discovery: "hsl(var(--primary))",
    impact: "hsl(var(--success, var(--primary)))",
    closed: "hsl(var(--muted-foreground))",
    leading: "hsl(var(--destructive))",
    other: "hsl(var(--border))",
  }[c];
}

export function healthBadgeVariant(h: QuestionHealth): "destructive" | "warning" | "info" | "high" {
  if (h === "excellent") return "high";
  if (h === "good") return "info";
  if (h === "fair") return "warning";
  return "destructive";
}

export function healthLabel(h: QuestionHealth): string {
  return { poor: "Crítico", fair: "Regular", good: "Bom", excellent: "Excelente" }[h];
}

export function depthLabel(d: number): string {
  return ["", "Superficial", "Aberta", "Discovery", "Impacto", "Impacto+métrica"][Math.max(1, Math.min(5, d))];
}
