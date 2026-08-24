export type WLPeriod = 7 | 30 | 90 | 180 | 365;

export interface WinLossFilterState {
  period: WLPeriod;
  salespersonIds: string[];
  segments: string[];
  sources: string[];
  minAmount: number | null;
  maxAmount: number | null;
}

export const DEFAULT_WL_FILTERS: WinLossFilterState = {
  period: 90,
  salespersonIds: [],
  segments: [],
  sources: [],
  minAmount: null,
  maxAmount: null,
};

export const PERIOD_OPTIONS: { value: WLPeriod; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: 180, label: "180 dias" },
  { value: 365, label: "12 meses" },
];

export const periodSinceISO = (p: WLPeriod): string => {
  const d = new Date();
  d.setDate(d.getDate() - p);
  return d.toISOString();
};

export const filtersToParams = (f: WinLossFilterState): URLSearchParams => {
  const p = new URLSearchParams();
  p.set("period", String(f.period));
  if (f.salespersonIds.length) p.set("sp", f.salespersonIds.join(","));
  if (f.segments.length) p.set("seg", f.segments.join(","));
  if (f.sources.length) p.set("src", f.sources.join(","));
  if (f.minAmount != null) p.set("min", String(f.minAmount));
  if (f.maxAmount != null) p.set("max", String(f.maxAmount));
  return p;
};

export const paramsToFilters = (sp: URLSearchParams): WinLossFilterState => ({
  period: (Number(sp.get("period")) as WLPeriod) || 90,
  salespersonIds: sp.get("sp")?.split(",").filter(Boolean) ?? [],
  segments: sp.get("seg")?.split(",").filter(Boolean) ?? [],
  sources: sp.get("src")?.split(",").filter(Boolean) ?? [],
  minAmount: sp.get("min") ? Number(sp.get("min")) : null,
  maxAmount: sp.get("max") ? Number(sp.get("max")) : null,
});
