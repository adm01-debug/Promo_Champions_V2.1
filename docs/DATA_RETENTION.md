# DATA RETENTION — Política de retenção e purge

> Decisão de arquitetura para tabelas de alto volume. Complementa o
> [ADR-007](decisions/ADR-007-log-retention.md) (`fn_cleanup_stale_logs`, 90d)
> e a infra de `docs/LGPD.md`. Implementação:
> `supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql`.

## 1. Decisão: purge vs particionamento

**Decisão: purge periódico em lotes, sem particionamento por ora.**

Racional:

- As tabelas de log já têm coluna temporal (`created_at`/`received_at`/
  `identified_at`) indexada, e o volume real é **desconhecido** (sem acesso
  à cardinalidade de produção — medir com §3 antes de revisitar).
- Particionamento por `RANGE (created_at)` traria purge instantâneo
  (`DROP PARTITION`), mas exige migração invasiva (recreate da tabela,
  rewrite de PKs/FKs que incluem a chave de partição) e só compensa quando
  `DELETE` em lote começar a pressionar bloat/locks.
- `fn_apply_data_retention()` apaga em lotes de 10k por tabela, às 03:45 UTC
  (janela de menor tráfego), tolerante a schema drift — cada tabela roda em
  bloco isolado e erros são registrados no retorno jsonb em vez de derrubar
  o job.

**Gatilho para migrar a particionamento:** quando `pg_total_relation_size`
de qualquer tabela de log passar de ~10 GB **ou** o purge diário exceder
15 min por tabela (medir com §3.4).

## 2. Política-alvo (versionada em `data_retention_policies`)

| Tabela                                                                                                                             | Janela | Coluna-tempo               | Motivo                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------- | ------------------------------------------------------------------------------------------- |
| `audit_log`, `audit_logs`, `data_access_log`, `security_events`                                                                    | 365d   | `created_at`/`changed_at`  | valor jurídico/forense (ADR-007 excluiu auditoria do 90d; aqui ganha janela própria de 12m) |
| `login_attempts`, `login_alerts`, `access_denied_logs`                                                                             | 180d   | `created_at`               | investigação de segurança                                                                   |
| `website_visitor_logs`                                                                                                             | 90d    | `identified_at`            | LGPD — e só sem consentimento ativo (regra especial na função)                              |
| `query_telemetry`, `web_vitals_samples`, `salesperson_performance_telemetry`, `error_logs`, `integration_logs`, `session_activity` | 90d    | `created_at`/`timestamp`   | telemetria operacional                                                                      |
| `webhook_inbound_dedupe`, `webhook_inbound_log`, `rate_limit_logs`                                                                 | 30d    | `received_at`/`created_at` | janela de retry/replay                                                                      |

Tabelas **fora** do purge automático (decisão consciente): `audit trail`
financeiro (`sale_notifications_audit`, `quote_conversion_audit`,
`follow_up_audit_logs`), `consent_records`, `data_subject_requests`
(prova legal — 5 anos, gestão manual), `migration_log`, `maintenance_log`.

## 3. Queries de medição (rodar em produção antes/depois do purge)

```sql
-- 3.1 Cardinalidade e idade máxima por tabela de log
SELECT 'audit_log' tbl, count(*), min(created_at), max(created_at) FROM audit_log
UNION ALL SELECT 'audit_logs', count(*), min(changed_at), max(changed_at) FROM audit_logs
UNION ALL SELECT 'website_visitor_logs', count(*), min(identified_at), max(identified_at) FROM website_visitor_logs
UNION ALL SELECT 'webhook_inbound_dedupe', count(*), min(received_at), max(received_at) FROM webhook_inbound_dedupe
UNION ALL SELECT 'webhook_inbound_log', count(*), min(received_at), max(received_at) FROM webhook_inbound_log
UNION ALL SELECT 'query_telemetry', count(*), min(created_at), max(created_at) FROM query_telemetry
UNION ALL SELECT 'web_vitals_samples', count(*), min(created_at), max(created_at) FROM web_vitals_samples
UNION ALL SELECT 'session_activity', count(*), min(created_at), max(created_at) FROM session_activity
UNION ALL SELECT 'login_attempts', count(*), min(created_at), max(created_at) FROM login_attempts
UNION ALL SELECT 'security_events', count(*), min(created_at), max(created_at) FROM security_events
ORDER BY 1;

-- 3.2 Tamanho em disco por tabela
SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid))
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 20;

-- 3.3 Linhas elegíveis ao purge hoje (amostra da janela)
SELECT table_name, ts_column, retention_days FROM data_retention_policies WHERE enabled;
SELECT count(*) FROM website_visitor_logs
 WHERE retention_expires_at < now()
   AND NOT EXISTS (SELECT 1 FROM consent_records c
                   WHERE c.id = consent_record_id AND c.revoked_at IS NULL);

-- 3.4 Duração do purge (diário de execução do pg_cron)
SELECT j.jobname, d.start_time, d.end_time, d.status
FROM cron.job_run_details d JOIN cron.job j ON j.jobid = d.jobid
WHERE j.jobname = 'data-retention-purge-daily'
ORDER BY d.start_time DESC LIMIT 30;

-- 3.5 Execução manual (service_role)
SELECT public.fn_apply_data_retention();
```

## 4. Operação

- **Ajustar janela**: `UPDATE data_retention_policies SET retention_days = X WHERE table_name = 'y';` — sem nova migration.
- **Pausar purge de uma tabela**: `UPDATE data_retention_policies SET enabled = false WHERE table_name = 'y';`
- **Desligar o job**: `SELECT cron.unschedule('data-retention-purge-daily');`
- **Rollback total**: ver "Riscos e rollback" no PR (DROP da function, da tabela de políticas e dos índices criados).
