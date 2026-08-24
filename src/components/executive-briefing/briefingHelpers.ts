export interface BriefingWin {
  title: string;
  detail: string;
}

export interface BriefingRisk {
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
}

export interface BriefingAction {
  title: string;
  rationale: string;
  module?: string;
}

export interface ExecutiveBriefing {
  id: string;
  briefing_date: string;
  pulse_score: number;
  headline: string;
  narrative: string;
  key_wins: BriefingWin[];
  key_risks: BriefingRisk[];
  recommended_actions: BriefingAction[];
  generated_by: "auto" | "manual";
  created_at: string;
}

export const formatBriefingDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
};

export const formatShortDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export const scoreTone = (score: number) => {
  if (score >= 75) return { label: "Excelente", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" };
  if (score >= 50) return { label: "Saudável", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
  if (score >= 30) return { label: "Atenção", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" };
  return { label: "Crítico", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
};

export const severityToken = (sev: BriefingRisk["severity"]) => {
  if (sev === "critical") return { color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" };
  if (sev === "warning") return { color: "text-status-warning", bg: "bg-status-warning/10", label: "Atenção" };
  return { color: "text-primary", bg: "bg-primary/10", label: "Info" };
};

/**
 * Sanitiza markdown removendo HTML inline para evitar XSS.
 * Renderização ainda é texto+quebras (sem injeção de tags).
 */
export const sanitizeMarkdown = (md: string): string => {
  return md.replace(/<[^>]*>/g, "").replace(/\r\n/g, "\n");
};

/**
 * Conversor minimalista de markdown -> HTML seguro (apenas h2/h3, parágrafos, bold, lista).
 */
export const renderMarkdownSafe = (md: string): string => {
  const safe = sanitizeMarkdown(md);
  const lines = safe.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { out.push("</ul>"); inList = false; }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h3 class="text-base font-semibold text-foreground mt-4 mb-2">${line.slice(4)}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h2 class="text-lg font-semibold text-foreground mt-5 mb-2">${line.slice(3)}</h2>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { out.push('<ul class="list-disc pl-5 space-y-1 my-2">'); inList = true; }
      out.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<p class="text-sm text-muted-foreground leading-relaxed my-2">${formatInline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
};

const formatInline = (s: string): string => {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
};
