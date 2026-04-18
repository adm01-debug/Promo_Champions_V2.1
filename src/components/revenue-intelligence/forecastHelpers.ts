export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const categoryLabel: Record<string, string> = {
  commit: "Commit",
  best: "Best Case",
  upside: "Upside",
  omitted: "Omitido",
};

export const categoryColor: Record<string, string> = {
  commit: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  best: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  upside: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  omitted: "bg-muted text-muted-foreground border-border",
};

export const periodLabel: Record<string, string> = {
  week: "Semana",
  month: "Mês",
  quarter: "Trimestre",
};

export function getCurrentPeriodStart(type: "week" | "month" | "quarter"): string {
  const d = new Date();
  if (type === "month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }
  if (type === "quarter") {
    const q = Math.floor(d.getMonth() / 3) * 3;
    return `${d.getFullYear()}-${String(q + 1).padStart(2, "0")}-01`;
  }
  // week: monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function shiftPeriod(
  start: string,
  type: "week" | "month" | "quarter",
  direction: -1 | 1,
): string {
  const d = new Date(start + "T00:00:00Z");
  if (type === "week") d.setUTCDate(d.getUTCDate() + 7 * direction);
  else if (type === "month") d.setUTCMonth(d.getUTCMonth() + direction);
  else d.setUTCMonth(d.getUTCMonth() + 3 * direction);
  return d.toISOString().slice(0, 10);
}
