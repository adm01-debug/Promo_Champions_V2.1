const DOW_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function formatWindow(dow: number, hour: number): string {
  const d = DOW_PT[dow] ?? "?";
  const h = String(hour).padStart(2, "0");
  return `${d} ${h}:00`;
}

export function formatOptimizedFor(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return formatWindow(d.getDay(), d.getHours());
}

export function normalizeScore(score: number, max: number): number {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((score / max) * 100));
}
