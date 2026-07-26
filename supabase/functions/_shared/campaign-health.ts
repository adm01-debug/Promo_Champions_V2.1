// Avaliador puro da saúde de campanhas de e-mail em massa.
// Isolado de I/O para permitir simulação exaustiva de cenários em testes.

export type CampaignAlertType = "opt_out_rate" | "stalled" | "failure_rate";
export type CampaignAlertSeverity = "info" | "warning" | "critical";

/** Snapshot de uma campanha avaliada. */
export interface CampaignSnapshot {
  job_id: string;
  owner_id: string;
  prompt: string;
  status: string;
  created_at: string;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  opted_out_count: number;
  last_sent_at: string | null;
}

/** Limiares configuráveis do avaliador. */
export interface CampaignAlertThresholds {
  /** Mínimo de envios para a taxa ser estatisticamente relevante. */
  minSample: number;
  /** % de descadastro que dispara alerta (warning). */
  optOutWarnPercent: number;
  /** % de descadastro que dispara alerta crítico. */
  optOutCriticalPercent: number;
  /** % de falhas que dispara alerta. */
  failureWarnPercent: number;
  /** % de falhas que dispara alerta crítico. */
  failureCriticalPercent: number;
  /** Minutos sem envio, com pendentes, para considerar travada. */
  stalledMinutes: number;
}

export const DEFAULT_THRESHOLDS: CampaignAlertThresholds = {
  minSample: 20,
  optOutWarnPercent: 2,
  optOutCriticalPercent: 5,
  failureWarnPercent: 10,
  failureCriticalPercent: 25,
  stalledMinutes: 30,
};

/** Alerta candidato produzido pelo avaliador (antes da deduplicação). */
export interface CampaignAlert {
  job_id: string;
  owner_id: string;
  alert_type: CampaignAlertType;
  severity: CampaignAlertSeverity;
  message: string;
  metrics: Record<string, number | string | null>;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Percentual com duas casas, protegido contra divisão por zero. */
export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((num(part) * 10000) / num(total)) / 100;
}

function label(prompt: string): string {
  const clean = (prompt ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "campanha sem descrição";
  return clean.length > 50 ? `${clean.slice(0, 47)}…` : clean;
}

/**
 * Avalia uma campanha e devolve os alertas aplicáveis.
 * Nunca lança: entradas inválidas resultam em lista vazia.
 */
export function evaluateCampaign(
  snapshot: CampaignSnapshot,
  now: Date = new Date(),
  thresholds: CampaignAlertThresholds = DEFAULT_THRESHOLDS,
): CampaignAlert[] {
  const alerts: CampaignAlert[] = [];
  if (!snapshot?.job_id || !snapshot?.owner_id) return alerts;

  const sent = num(snapshot.sent_count);
  const failed = num(snapshot.failed_count);
  const pending = num(snapshot.pending_count);
  const optedOut = num(snapshot.opted_out_count);
  const name = label(snapshot.prompt);

  // 1) Taxa de descadastro — só com amostra mínima.
  if (sent >= thresholds.minSample) {
    const rate = percent(optedOut, sent);
    if (rate >= thresholds.optOutWarnPercent) {
      alerts.push({
        job_id: snapshot.job_id,
        owner_id: snapshot.owner_id,
        alert_type: "opt_out_rate",
        severity: rate >= thresholds.optOutCriticalPercent ? "critical" : "warning",
        message:
          `A campanha "${name}" está com ${rate}% de descadastro ` +
          `(${optedOut} de ${sent} envios). Revise a segmentação e o conteúdo.`,
        metrics: { sent, opted_out: optedOut, opt_out_rate: rate },
      });
    }
  }

  // 2) Taxa de falha de envio.
  const processed = sent + failed;
  if (processed >= thresholds.minSample) {
    const rate = percent(failed, processed);
    if (rate >= thresholds.failureWarnPercent) {
      alerts.push({
        job_id: snapshot.job_id,
        owner_id: snapshot.owner_id,
        alert_type: "failure_rate",
        severity: rate >= thresholds.failureCriticalPercent ? "critical" : "warning",
        message:
          `A campanha "${name}" falhou em ${rate}% dos envios ` +
          `(${failed} de ${processed}). Verifique domínio e supressões.`,
        metrics: { sent, failed, failure_rate: rate },
      });
    }
  }

  // 3) Campanha travada: há pendentes e nenhum envio recente.
  if (pending > 0) {
    const reference = snapshot.last_sent_at ?? snapshot.created_at;
    const ts = reference ? Date.parse(reference) : Number.NaN;
    if (Number.isFinite(ts)) {
      const idleMinutes = (now.getTime() - ts) / 60000;
      if (idleMinutes >= thresholds.stalledMinutes) {
        alerts.push({
          job_id: snapshot.job_id,
          owner_id: snapshot.owner_id,
          alert_type: "stalled",
          severity: idleMinutes >= thresholds.stalledMinutes * 4 ? "critical" : "warning",
          message:
            `A campanha "${name}" está parada há ${Math.floor(idleMinutes)} min ` +
            `com ${pending} envio(s) pendente(s).`,
          metrics: {
            pending,
            idle_minutes: Math.floor(idleMinutes),
            last_sent_at: snapshot.last_sent_at,
          },
        });
      }
    }
  }

  return alerts;
}

/**
 * Remove alertas já emitidos dentro da janela de cooldown.
 * `recent` mapeia `${job_id}:${alert_type}` para o timestamp ISO do último alerta.
 */
export function dedupeAlerts(
  alerts: CampaignAlert[],
  recent: Map<string, string>,
  cooldownHours: number,
  now: Date = new Date(),
): CampaignAlert[] {
  const cooldownMs = Math.max(0, cooldownHours) * 3600_000;
  return alerts.filter((a) => {
    const last = recent.get(`${a.job_id}:${a.alert_type}`);
    if (!last) return true;
    const ts = Date.parse(last);
    if (!Number.isFinite(ts)) return true;
    return now.getTime() - ts >= cooldownMs;
  });
}
