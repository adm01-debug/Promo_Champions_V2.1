export type ForecastHorizon = 30 | 60 | 90;
export type ScenarioKey = "pessimistic" | "realistic" | "optimistic";

export const formatBRL = (n: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const formatCompactBRL = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}k`;
  return formatBRL(n);
};

export const scenarioLabel: Record<ScenarioKey, string> = {
  pessimistic: "Pessimista",
  realistic: "Realista",
  optimistic: "Otimista",
};

export const scenarioColor: Record<ScenarioKey, string> = {
  pessimistic: "text-destructive border-destructive/30 bg-destructive/5",
  realistic: "text-primary border-primary/30 bg-primary/5",
  optimistic: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
};

export const scenarioChartColor: Record<ScenarioKey, string> = {
  pessimistic: "hsl(var(--destructive))",
  realistic: "hsl(var(--primary))",
  optimistic: "hsl(160 84% 39%)",
};

export const horizonOptions: { value: ForecastHorizon; label: string }[] = [
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
];

export function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Alta", color: "text-emerald-500" };
  if (score >= 50) return { label: "Média", color: "text-amber-500" };
  return { label: "Baixa", color: "text-destructive" };
}

export function deltaPct(value: number, base: number): number {
  if (!base) return 0;
  return ((value - base) / base) * 100;
}
