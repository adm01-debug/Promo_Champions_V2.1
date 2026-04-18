export type ScorecardHealth = "poor" | "fair" | "good" | "excellent";

export interface CoachingScorecard {
  id: string;
  recording_id: string;
  salesperson_id: string | null;
  overall_score: number;
  talk_score: number;
  question_score: number;
  objection_score: number;
  sentiment_score: number;
  moments_score: number;
  health: ScorecardHealth;
  top_strengths: Array<{ key: string; label: string; score: number }>;
  top_gaps: Array<{ key: string; label: string; score: number }>;
  recommendations: Array<{ category: string; tip: string; priority: number }>;
  factors: Record<string, unknown>;
  calculated_at: string;
}

export interface SalespersonAggregate {
  id: string;
  salesperson_id: string;
  period_start: string;
  period_end: string;
  calls_analyzed: number;
  avg_overall: number;
  avg_talk: number;
  avg_questions: number;
  avg_objections: number;
  avg_sentiment: number;
  trend_direction: "up" | "flat" | "down";
  trend_delta: number;
  top_recurring_gap: string | null;
  last_calculated_at: string;
}

export const DIMENSION_LABELS: Record<string, string> = {
  talk: "Talk & Pace",
  questions: "Perguntas",
  objections: "Objeções",
  sentiment: "Sentimento",
  moments: "Momentos",
};

export const HEALTH_LABELS: Record<ScorecardHealth, string> = {
  poor: "Crítico",
  fair: "Regular",
  good: "Bom",
  excellent: "Excelente",
};

export function healthHsl(h: ScorecardHealth): string {
  return {
    poor: "hsl(var(--destructive))",
    fair: "hsl(var(--warning))",
    good: "hsl(var(--info))",
    excellent: "hsl(var(--success, var(--primary)))",
  }[h];
}

export function healthBadgeVariant(h: ScorecardHealth): "destructive" | "warning" | "info" | "high" {
  return ({ poor: "destructive", fair: "warning", good: "info", excellent: "high" } as const)[h];
}

export function classifyHealth(score: number): ScorecardHealth {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}
