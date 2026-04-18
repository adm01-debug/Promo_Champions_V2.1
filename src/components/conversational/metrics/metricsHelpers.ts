export type MetricsHealth = "poor" | "fair" | "good" | "excellent";

export interface ConversationMetrics {
  id: string;
  recording_id: string;
  seller_talk_ratio: number;
  client_talk_ratio: number;
  silence_ratio: number;
  longest_monologue_seconds: number;
  interruptions_count: number;
  seller_words_per_minute: number;
  client_words_per_minute: number;
  pace_score: number;
  engagement_score: number;
  health: MetricsHealth;
  factors: Record<string, unknown>;
  calculated_at: string;
}

export function classifyHealth(score: number): MetricsHealth {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function healthBadgeVariant(h: MetricsHealth): "destructive" | "warning" | "info" | "high" {
  if (h === "excellent") return "high";
  if (h === "good") return "info";
  if (h === "fair") return "warning";
  return "destructive";
}

export function healthLabel(h: MetricsHealth): string {
  return { poor: "Crítico", fair: "Regular", good: "Bom", excellent: "Excelente" }[h];
}

export function healthHsl(h: MetricsHealth): string {
  return {
    poor: "hsl(var(--destructive))",
    fair: "hsl(var(--warning))",
    good: "hsl(var(--info))",
    excellent: "hsl(var(--success, var(--primary)))",
  }[h];
}

export function formatWPM(wpm: number): string {
  return wpm > 0 ? `${wpm} ppm` : "—";
}

export function formatPct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
