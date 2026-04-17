export interface ScoreDriver {
  factor: string;
  label: string;
  value: number;
  baseline: number;
  contribution: number;
  contribution_pct: number;
  direction: "positive" | "negative";
}

export interface ScoreRecommendation {
  action: string;
  expected_lift: number;
  priority: "high" | "medium" | "low";
}

export interface ScoreExplanation {
  id: string;
  sale_id: string;
  score: number;
  baseline_score: number;
  top_drivers: ScoreDriver[];
  recommendations: ScoreRecommendation[];
  narrative: string | null;
  model_version: string;
  calculated_at: string;
}

export const directionColor = (dir: "positive" | "negative") =>
  dir === "positive" ? "text-status-success" : "text-destructive";

export const directionBg = (dir: "positive" | "negative") =>
  dir === "positive" ? "bg-status-success" : "bg-destructive";

export const priorityBadge = (p: "high" | "medium" | "low") => {
  switch (p) {
    case "high":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "medium":
      return "bg-status-warning/15 text-status-warning border-status-warning/30";
    case "low":
      return "bg-info/15 text-info border-info/30";
  }
};

export const formatDelta = (score: number, baseline: number): string => {
  const delta = score - baseline;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(0)} pts vs média (${baseline.toFixed(0)})`;
};
