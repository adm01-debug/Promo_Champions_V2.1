// METRICS — Export de métricas operacionais para observabilidade externa.
//
// Empurra contadores/gauges para um endpoint de ingestão compatível com
// Better Stack Metrics ou Grafana (qualquer sink HTTP que aceite JSON
// `{ metrics: [{ name, value, ts, tags }] }`).
//
// Configuração (opcional — no-op silencioso quando ausente):
//   METRICS_INGEST_URL    — endpoint de ingestão (Better Stack/Grafana/etc.)
//   METRICS_INGEST_TOKEN  — bearer token/api key do sink, quando exigido
//
// Falhas de export NUNCA quebram o alerta: o erro volta no resultado para o
// caller logar, e a função usa timeout curto para não segurar o handler.

import { fetchWithTimeout } from "./fetch-with-timeout.ts";

export interface OperationalMetric {
  /** Nome da métrica, ex.: "cron_failures", "webhook_alerts_fired". */
  name: string;
  value: number;
  /** Tags de dimensão, ex.: { source: "cron-failure-alerter" }. */
  tags?: Record<string, string>;
}

export interface MetricsExportResult {
  exported: boolean;
  reason?: string;
}

/**
 * Exporta métricas para o sink externo configurado.
 * Retorna { exported:false, reason:'not_configured' } sem fazer nada quando
 * METRICS_INGEST_URL não existe — seguro de chamar incondicionalmente.
 */
export async function exportOperationalMetrics(
  metrics: OperationalMetric[],
  requestId: string,
): Promise<MetricsExportResult> {
  const url = Deno.env.get("METRICS_INGEST_URL");
  if (!url || metrics.length === 0) {
    return { exported: false, reason: url ? "empty" : "not_configured" };
  }

  const token = Deno.env.get("METRICS_INGEST_TOKEN");
  const ts = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    metrics: metrics.map((m) => ({
      name: m.name,
      value: m.value,
      ts,
      tags: { ...(m.tags ?? {}), request_id: requestId },
    })),
  });

  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      },
      6_000,
    );
    if (!res.ok) {
      return { exported: false, reason: `sink_${res.status}` };
    }
    return { exported: true };
  } catch (e) {
    return { exported: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
