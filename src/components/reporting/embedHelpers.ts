export interface ReportEmbedToken {
  id: string;
  report_id: string;
  token: string;
  created_by: string;
  expires_at: string | null;
  allowed_origins: string[];
  view_count: number;
  last_viewed_at: string | null;
  revoked: boolean;
  created_at: string;
}

export interface EmbeddedReportPayload {
  ok: true;
  name: string;
  viz_type: string;
  columns: string[];
  rows: Record<string, unknown>[];
  generated_at: string;
}

export function generateEmbedToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildEmbedUrl(token: string): string {
  return `${window.location.origin}/embed/report/${token}`;
}

export function buildIframeSnippet(token: string, height = 600): string {
  const url = buildEmbedUrl(token);
  return `<iframe src="${url}" width="100%" height="${height}" frameborder="0" loading="lazy" title="Relatório embutido"></iframe>`;
}

export function tokenStatus(t: ReportEmbedToken): { label: string; tone: "success" | "warning" | "destructive" | "muted" } {
  if (t.revoked) return { label: "Revogado", tone: "destructive" };
  if (t.expires_at && new Date(t.expires_at).getTime() < Date.now()) return { label: "Expirado", tone: "warning" };
  return { label: "Ativo", tone: "success" };
}
