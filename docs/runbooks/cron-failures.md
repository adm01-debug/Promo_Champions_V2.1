# Runbook — Falhas de pg_cron (`cron-failure-alerter`)

Varre `cron.job_run_details` a cada execução (default: últimos 30min) e notifica
admins sobre jobs que falharam (dedupe por jobid+start_time).

## Diagnóstico

1. `SELECT jobid, jobname, status, return_message, start_time FROM cron.job_run_details ORDER BY start_time DESC LIMIT 50;`
2. Casos comuns:
   - `could not establish connection` → edge function fora do ar ou URL errada (`_internal_secrets.functions_base_url`/URL do projeto).
   - `401/403` no retorno → secret do cron inválido (`coaching_cron_secret` em `_internal_secrets` vs header `X-Cron-Secret`).
   - `5xx`/timeout → function degradada; ver logs da function pelo `requestId`.
3. Jobs operacionais que chamam edge functions passam por
   `public.trigger_internal_edge_job` (allowlist) — job não agendado não dispara alerta.

## Mitigação

- Recriar o job: `SELECT cron.schedule(...)` conforme migration do job (ver
  `supabase/migrations/*_reconcile_operational_edge_crons.sql`).
- Secret desalinhado: atualizar `_internal_secrets` e o agendamento.
- Function quebrada: corrigir e redeploy; o alerter marca `alerted` e o próximo
  tick só notifica falhas novas.

## Escalação

Alerta severity=critical → `SLACK_ALERT_WEBHOOK_URL` / Resend + métricas via
`METRICS_INGEST_URL` (`cron_failures`, `cron_failure_notifications`). Ver
`alertas-operacionais.md`.
