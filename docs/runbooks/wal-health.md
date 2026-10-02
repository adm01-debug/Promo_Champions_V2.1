# Runbook — WAL Health (`wal-health-alert`)

Alerta quando a replicação/WAL do Postgres excede limites.

## Gatilhos

| Métrica              | Limite default | Env                      |
| -------------------- | -------------- | ------------------------ |
| `max_slot_lag_bytes` | 64 MiB         | `WAL_MAX_SLOT_LAG_BYTES` |
| `long_running_tx`    | > 0            | —                        |
| `wal_size_bytes`     | 500 MiB        | `WAL_SIZE_ALERT_BYTES`   |

Fonte: `public.v_platform_wal_health` (service_role).

## Diagnóstico

1. No dashboard Supabase → Database → Replication: identifique o slot com lag.
2. `long_running_tx > 0`: localize a transação travada —
   `SELECT pid, now() - xact_start AS dur, query FROM pg_stat_activity WHERE xact_start IS NOT NULL ORDER BY dur DESC;`
3. WAL alto sem lag de slot: verifique retenção (`wal_keep_size`) e jobs de backup.

## Mitigação

- Slot órfão de consumer desligado: dropar o slot (`SELECT pg_drop_replication_slot('<slot>')`) após confirmar que o consumer está aposentado.
- Transação longa: confirmar com o dono e matar (`pg_terminate_backend(pid)`) — risco de rollback parcial.
- Se o lag for em réplica de leitura gerenciada, escalar compute ou abrir ticket no Supabase.

## Escalação

Alerta severity=critical → `SLACK_ALERT_WEBHOOK_URL` / Resend
(`ALERT_ESCALATION_EMAIL`). Ver `alertas-operacionais.md`.
