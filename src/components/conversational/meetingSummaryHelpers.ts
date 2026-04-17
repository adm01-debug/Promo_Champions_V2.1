export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface ActionItem {
  title: string;
  owner_hint?: string;
  due_hint?: string;
  priority: "alta" | "média" | "baixa";
}

export interface Decision {
  text: string;
  made_by_hint?: string;
}

export interface Objection {
  text: string;
  category: "preço" | "timing" | "autoridade" | "necessidade" | "concorrência" | "outro";
}

export interface NextStep {
  text: string;
  deadline_hint?: string;
}

export const sentimentMeta: Record<Sentiment, { label: string; className: string; emoji: string }> = {
  positive: { label: "Positivo", className: "bg-status-success/15 text-status-success border-status-success/30", emoji: "😊" },
  neutral: { label: "Neutro", className: "bg-muted text-muted-foreground border-border", emoji: "😐" },
  negative: { label: "Negativo", className: "bg-destructive/15 text-destructive border-destructive/30", emoji: "😟" },
  mixed: { label: "Misto", className: "bg-status-warning/15 text-status-warning border-status-warning/30", emoji: "🤔" },
};

export const priorityMeta: Record<ActionItem["priority"], { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-destructive/15 text-destructive border-destructive/30" },
  média: { label: "Média", className: "bg-status-warning/15 text-status-warning border-status-warning/30" },
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground border-border" },
};

export const objectionCategoryColor: Record<Objection["category"], string> = {
  preço: "bg-destructive/10 text-destructive border-destructive/30",
  timing: "bg-status-warning/10 text-status-warning border-status-warning/30",
  autoridade: "bg-primary/10 text-primary border-primary/30",
  necessidade: "bg-accent/10 text-accent-foreground border-accent/30",
  concorrência: "bg-secondary/40 text-secondary-foreground border-border",
  outro: "bg-muted text-muted-foreground border-border",
};
