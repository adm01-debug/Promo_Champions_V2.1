# Soft delete — política por tabela

Pacote de auditoria DB/integridade (2026-10-01). O frontend nunca executa
`DELETE` físico nas entidades de negócio: exclusão = `UPDATE deleted_at` +
`deleted_by`. O `DELETE` físico ficou restrito a admin/manager via policy
`admin_delete_<tabela>` (migration `20261001193000_soft_delete_business_tables.sql`).

## Entidades de negócio — soft delete obrigatório

Colunas `deleted_at`, `deleted_by`, `delete_reason` e listagens filtram
`deleted_at IS NULL`:

- `clients` (via `clientService.deleteClient`)
- `suppliers` (via `useSupplierMutations.deleteSupplier`)
- `deals` (coluna já existia; sem uso direto no frontend)
- `quotes` (via `useDeleteQuote`)
- `sales` (não há delete no frontend; coluna criada para consistência e a view
  `sales_with_markup` já filtra `deleted_at IS NULL`)
- `activities` (coluna já existia; sem delete no frontend)
- `tasks` (via `useDeleteTask`)
- `products` (coluna já existia)
- `teams` (coluna já existia)
- `client_portfolio` (via `useRemoveFromPortfolio`)

Restore/purge ficam nas RPCs existentes `restore_deleted_record` /
`hard_delete_record` / `cleanup_deleted_records` (admin).

## Tabelas voláteis — hard delete permitido

Logs, filas, dedupe, sessões, preferências e artefatos transitórios seguem
`DELETE` físico (não carregam valor de negócio após expirar/serem lidos):

- Logs e auditoria: `audit_log` (superseded), `audit_logs`, `security_events`,
  `*_audit_logs` (follow_up, intent, activity, sale_notifications,
  quote_conversion, dead_letter_replay, winloss_webhook_replay),
  `quote_sync_logs`, `migration_log`, `wal_*`, `circuit_breaker_history`
- Filas e dedupe: `dedupe_*`, `inbound_reply_events`, `webhook_*` deliveries,
  `cadence_tasks`, `sequence_step_variants` (variantes), `email_send_queue`
- Sessões e segurança transitória: `known_devices`, `sessions`,
  `blocked_ips`, `ip_whitelist`, `geo_blocked_regions`, `notifications`
- Preferências/usuário-volátil: `notification_preferences`, `saved_filters`,
  `custom_reports`, `scheduled_reports`, `report_embed_tokens`,
  `feed_reactions`, `agenda_events`, `message_templates`, `chat_messages`,
  `chat_conversations`, `deal_chat_history`, `competitive_chat_messages`,
  `email_opt_outs`, `digital_signatures`
- Catálogos de configuração (não são registros de negócio auditáveis):
  `feature_flags`, `task_catalog`, `squads`, `cadences`, `cadence_steps`,
  `cadence_enrollment_rules`, `cadence_funnel_rules`, `cadence_outcome_rules`,
  `sequence_steps`, `sequences`, `workflows`, `playbooks`, `role_permissions`,
  `commission_rules`, `commission_bonuses`, `competitors_registry`,
  `buying_committee_members`, `deal_stakeholders`, `objections_library`,
  `webhooks`, `channel_credentials`, `team_closers`, `race_seasons`,
  `telemetry`, `integration_connections`, `follow_up_territory_rules`

Critério: se a linha representa um fato de negócio com valor histórico
(cliente, venda, orçamento, atividade, fornecedor), é soft delete; se é
telemetria, dedupe, fila ou config reversível, é hard delete.
