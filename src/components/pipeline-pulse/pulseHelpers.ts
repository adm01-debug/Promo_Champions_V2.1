export interface PulseKpi {
  label: string;
  value: number;
  format: "currency" | "number" | "percent" | "score";
  delta?: number;
  hint?: string;
}

export interface PulseAlert {
  id: string;
  module: "health" | "winloss" | "forecast" | "routing" | "conversation";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  suggested_action: string;
  link?: string;
}

export interface PulsePayload {
  pulse_score: number;
  status: "healthy" | "warning" | "critical";
  kpis: PulseKpi[];
  alerts: PulseAlert[];
  trends: { sentiment_7d: number; win_rate_30d: number; critical_count: number };
  generated_at: string;
}

export const formatKpi = (k: PulseKpi): string => {
  if (k.format === "currency") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(k.value);
  }
  if (k.format === "percent") return `${k.value.toFixed(1)}%`;
  if (k.format === "score") return k.value.toFixed(0);
  return new Intl.NumberFormat("pt-BR").format(Math.round(k.value));
};

export const statusToToken = (status: PulsePayload["status"]) => {
  if (status === "healthy") return { label: "Saudável", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" };
  if (status === "warning") return { label: "Atenção", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" };
  return { label: "Crítico", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
};

export const severityToken = (sev: PulseAlert["severity"]) => {
  if (sev === "critical") return { color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" };
  if (sev === "warning") return { color: "text-status-warning", bg: "bg-status-warning/10", label: "Atenção" };
  return { color: "text-primary", bg: "bg-primary/10", label: "Info" };
};

export const moduleLabel = (m: PulseAlert["module"]) => {
  const map: Record<PulseAlert["module"], string> = {
    health: "Saúde",
    winloss: "Win/Loss",
    forecast: "Forecast",
    routing: "Roteamento",
    conversation: "Conversas",
  };
  return map[m];
};
