export const FLAG_LABEL: Record<string, string> = {
  overconfident: "Super-otimista",
  underconfident: "Subestimado",
  aligned: "Alinhado",
};

export const FLAG_COLOR: Record<string, string> = {
  overconfident: "hsl(var(--destructive))",
  underconfident: "hsl(var(--primary))",
  aligned: "hsl(var(--muted-foreground))",
};

export function flagBadgeVariant(flag: string): "default" | "destructive" | "secondary" | "outline" {
  if (flag === "overconfident") return "destructive";
  if (flag === "underconfident") return "secondary";
  return "outline";
}

export function confidenceLabel(c: string): string {
  return c === "high" ? "alta" : c === "medium" ? "média" : "baixa";
}

export function formatPct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`;
}

export function formatCurrency(v: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v ?? 0);
}
