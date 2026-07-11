# ADR-007: Retenção de Logs Operacionais

**Data:** 2026-07-11  
**Status:** Aceito  
**Sub-agente:** 🗄️ Supabase Engineer + 🔍 Code Auditor

## Contexto

Tabelas de log operacional cresciam indefinidamente (`access_denied_logs`, `geo_access_logs`, `rate_limit_logs`, `email_tracking_events`, `login_attempts`, `webhook_inbound_log`, `error_logs`, `duplicate_block_logs`, `mfa_verification_attempts`, `page_analytics`), inflando o WAL e aumentando o custo de backup.

## Decisão

- Função `public.fn_cleanup_stale_logs(_days INTEGER DEFAULT 90)` remove registros com mais de N dias em todas as tabelas listadas.
- Robusta a schemas variados: `EXCEPTION WHEN undefined_column OR undefined_table` para tabelas sem `created_at`.
- Job pg_cron `cleanup-stale-logs-daily` roda diariamente às **03:15 UTC**.
- Admins podem disparar manualmente via `fn_admin_cleanup_stale_logs(_days)`.
- Tabelas com valor jurídico ou de auditoria (`audit_logs`, `activity_audit_logs`, `sale_notifications_audit`, `quote_conversion_audit`) **NÃO** entram na retenção padrão — política separada quando definida.

## Consequências

- **Prós:** DB size projetado 15–20% menor; WAL mais estável; menor custo de backup.
- **Contras:** perde-se visibilidade forense >90 d. Mitigação: exportar CSV mensal para storage frio (fora do escopo desta ADR).

## Reversão

`SELECT cron.unschedule('cleanup-stale-logs-daily');` interrompe a limpeza sem afetar dados.
