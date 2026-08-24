export type SentimentLabel =
  | "very_negative"
  | "negative"
  | "neutral"
  | "positive"
  | "very_positive";

export interface SentimentSegment {
  id: string;
  recording_id: string;
  segment_index: number;
  start_sec: number;
  end_sec: number;
  speaker: "salesperson" | "client" | "unknown" | "mixed";
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  excerpt: string | null;
}

export const SENTIMENT_COLORS: Record<SentimentLabel, string> = {
  very_negative: "hsl(var(--destructive))",
  negative: "hsl(var(--status-warning))",
  neutral: "hsl(var(--muted-foreground))",
  positive: "hsl(var(--status-success))",
  very_positive: "hsl(var(--primary))",
};

export const SENTIMENT_LABELS: Record<SentimentLabel, string> = {
  very_negative: "Muito negativo",
  negative: "Negativo",
  neutral: "Neutro",
  positive: "Positivo",
  very_positive: "Muito positivo",
};

export function detectShifts(timeline: SentimentSegment[], threshold = 0.5) {
  const shifts: Array<{ start_sec: number; from: number; to: number; excerpt: string | null }> = [];
  for (let i = 1; i < timeline.length; i++) {
    const delta = Math.abs(timeline[i].score - timeline[i - 1].score);
    if (delta >= threshold) {
      shifts.push({
        start_sec: timeline[i].start_sec,
        from: timeline[i - 1].score,
        to: timeline[i].score,
        excerpt: timeline[i].excerpt,
      });
    }
  }
  return shifts;
}

export function formatTimestamp(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
