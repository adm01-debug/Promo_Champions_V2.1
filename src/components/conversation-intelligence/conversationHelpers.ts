export type ConvSentiment = "positive" | "neutral" | "negative" | "mixed";
export type ConvSource = "call" | "email" | "meeting" | "whatsapp";

export interface ConvObjection {
  text: string;
  category: "preço" | "timing" | "autoridade" | "necessidade" | "concorrência" | "outro";
}

export interface ConvNextStep {
  text: string;
  deadline_hint?: string;
}

export interface ConversationAnalysis {
  id: string;
  sale_id: string | null;
  client_id: string | null;
  source: ConvSource;
  transcript: string;
  summary: string | null;
  sentiment: ConvSentiment;
  objections: ConvObjection[];
  next_steps: ConvNextStep[];
  buying_signals: string[];
  risk_signals: string[];
  decision_makers: string[];
  ai_model: string | null;
  analyzed_by: string | null;
  created_at: string;
}

export const sentimentMeta: Record<
  ConvSentiment,
  { label: string; className: string; emoji: string; hsl: string }
> = {
  positive: {
    label: "Positivo",
    className: "bg-status-success/15 text-status-success border-status-success/30",
    emoji: "😊",
    hsl: "hsl(var(--status-success))",
  },
  neutral: {
    label: "Neutro",
    className: "bg-muted text-muted-foreground border-border",
    emoji: "😐",
    hsl: "hsl(var(--muted-foreground))",
  },
  negative: {
    label: "Negativo",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    emoji: "😟",
    hsl: "hsl(var(--destructive))",
  },
  mixed: {
    label: "Misto",
    className: "bg-status-warning/15 text-status-warning border-status-warning/30",
    emoji: "🤔",
    hsl: "hsl(var(--status-warning))",
  },
};

export const sourceMeta: Record<ConvSource, { label: string; emoji: string }> = {
  call: { label: "Call", emoji: "📞" },
  email: { label: "E-mail", emoji: "✉️" },
  meeting: { label: "Reunião", emoji: "🤝" },
  whatsapp: { label: "WhatsApp", emoji: "💬" },
};

export function topObjectionsAcross(items: ConversationAnalysis[], limit = 5) {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const obj of it.objections ?? []) {
      const key = obj.text.trim().slice(0, 80);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function sentimentDistribution(items: ConversationAnalysis[]) {
  const dist: Record<ConvSentiment, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
    mixed: 0,
  };
  for (const it of items) dist[it.sentiment] = (dist[it.sentiment] ?? 0) + 1;
  return (Object.keys(dist) as ConvSentiment[]).map((k) => ({
    sentiment: k,
    label: sentimentMeta[k].label,
    value: dist[k],
    color: sentimentMeta[k].hsl,
  }));
}
