# Runbook — Alertas operacionais (índice)

Alertas operacionais críticos são escalados para canais externos quando
`severity = critical`, além do fluxo interno (notificações in-app/email).

## Escalação externa

| Canal              | Env                                                                                | Comportamento                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Slack de escalação | `SLACK_ALERT_WEBHOOK_URL`                                                          | POST no webhook dedicado (diferente de `SLACK_WEBHOOK_URL`, canal operacional dos alertas comuns). |
| Email              | `RESEND_API_KEY` + `ALERT_ESCALATION_EMAIL` (fallback: `ADMIN_NOTIFICATION_EMAIL`) | Email via Resend com link do runbook.                                                              |

**Remetente Resend:** configure `ALERT_FROM_EMAIL` com um remetente do domínio
verificado no Resend (ex.: `Alertas <alertas@promobrindes.com.br>`). Sem a env,
o código usa `Alertas <onboarding@resend.dev>`, que **só entrega para o email
da própria conta Resend** — todo email para terceiros falha com `403`. Definir
`ALERT_FROM_EMAIL` é obrigatório em produção.

## Métricas externas

| Env                    | Uso                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `METRICS_INGEST_URL`   | Endpoint de ingestão (Better Stack Metrics, Grafana, etc.) que aceita POST JSON `{ metrics: [{ name, value, ts, tags }] }`. Sem a env, o export é no-op silencioso. |
| `METRICS_INGEST_TOKEN` | Bearer token do sink, quando exigido.                                                                                                                               |

Exportadores atuais: `cron-failure-alerter` (cron_failures,
cron_failure_notifications) e `winloss-webhook-health-monitor`
(webhook_health_subscriptions_checked, webhook_alerts_fired,
webhook_alerts_suppressed).

## Trace (W3C)

Chamadas externas feitas via `_shared/fetch-with-timeout.ts → fetchWithTrace`
carregam `traceparent` derivado do `X-Request-Id` do request original e logam
`external_call` com `trace_id`/`span_id`. Para correlacionar um incidente:

1. Pegue o `X-Request-Id` da resposta (ou `requestId` do log estruturado).
2. Nos logs da function, procure linhas `external_call` com o mesmo request.
3. `trace_id` = request-id em hex (32 chars); `span_id` identifica a chamada.

## Runbooks por integração

| Alerta                                                   | Runbook                                    |
| -------------------------------------------------------- | ------------------------------------------ |
| WAL/replicação (`wal-health-alert`)                      | [wal-health.md](wal-health.md)             |
| Webhooks Win/Loss (`winloss-webhook-health-monitor`)     | [winloss-webhooks.md](winloss-webhooks.md) |
| Falhas de pg_cron (`cron-failure-alerter`)               | [cron-failures.md](cron-failures.md)       |
| Retries de edge exauridos (`edge-retry-threshold-alert`) | [edge-retry.md](edge-retry.md)             |

## SLO burn-rate

A função SQL `public.fn_check_slo_burn_rate()` (migration
`20261002000000_slo_burn_rate.sql`) calcula a taxa de falha nas últimas 1h e
24h sobre entregas operacionais (webhooks winloss + email_logs) e insere um
`security_events` `severity=critical` quando acima do threshold.

Thresholds em `public.app_config`:

| Chave               | Default | Significado                                      |
| ------------------- | ------- | ------------------------------------------------ |
| `slo.burn_rate_1h`  | `0.20`  | Taxa de falha máxima aceitável na janela de 1h   |
| `slo.burn_rate_24h` | `0.10`  | Taxa de falha máxima aceitável na janela de 24h  |
| `slo.min_samples`   | `20`    | Mínimo de eventos na janela para o cálculo valer |

Agendamento (pg_cron) pendente — ver "Passos manuais" no PR do pacote.
