export const biasLabel: Record<string, string> = {
  optimistic: "Otimista",
  pessimistic: "Pessimista",
  accurate: "Preciso",
};

export const biasColor: Record<string, string> = {
  optimistic: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  pessimistic: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  accurate: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

export const sourceLabel: Record<string, string> = {
  manual: "Manual",
  weighted: "Ponderado",
  ai: "IA",
};

export const formatMape = (n: number) => `${(n ?? 0).toFixed(1)}%`;

export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n || 0);

export function mapeHealth(mape: number): {
  label: string;
  color: string;
} {
  if (mape <= 10) return { label: "Excelente", color: "text-emerald-600" };
  if (mape <= 20) return { label: "Bom", color: "text-blue-600" };
  if (mape <= 35) return { label: "Atenção", color: "text-amber-600" };
  return { label: "Crítico", color: "text-destructive" };
}
