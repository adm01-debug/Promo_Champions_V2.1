export type SmokeItemStatus = "idle" | "running" | "ok" | "fail";

export interface SmokeItemResult {
  status: SmokeItemStatus;
  latency_ms?: number;
  error?: string;
  ran_at?: string;
}

export interface SmokeRunSnapshot {
  ts: string;
  results: Record<string, SmokeItemResult>;
}

const STORAGE_KEY = "smoke-test:last-run";

export function loadSnapshot(): SmokeRunSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SmokeRunSnapshot;
    if (!parsed?.results || typeof parsed.results !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSnapshot(results: Record<string, SmokeItemResult>): void {
  try {
    const snapshot: SmokeRunSnapshot = { ts: new Date().toISOString(), results };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage indisponível: silencioso
  }
}

export interface SmokeReportItem {
  id: string;
  label: string;
  result: SmokeItemResult | undefined;
}

export function buildMarkdownReport(items: SmokeReportItem[]): string {
  const tested = items.filter((i) => i.result?.status === "ok" || i.result?.status === "fail");
  const passed = tested.filter((i) => i.result?.status === "ok").length;
  const failed = tested.filter((i) => i.result?.status === "fail").length;
  const ts = new Date().toLocaleString("pt-BR");

  const header = `Smoke test — ${ts}\n✅ ${passed}/${tested.length} passaram, ❌ ${failed} falhou\n`;
  const lines = items.map((i) => {
    const r = i.result;
    if (!r || r.status === "idle" || r.status === "running") {
      return `- [ ] ${i.label} — não executado`;
    }
    if (r.status === "ok") {
      return `- [x] ${i.label} — ${r.latency_ms ?? "?"}ms`;
    }
    return `- [ ] ${i.label} — falhou: ${r.error ?? "erro desconhecido"}`;
  });
  return [header, ...lines].join("\n");
}

export function truncate(str: string | undefined, max = 120): string {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
