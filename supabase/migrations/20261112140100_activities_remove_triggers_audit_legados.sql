-- activities: remove os 2 triggers de auditoria legados que fazem TODO UPDATE falhar.
--
-- Causa (snapshot do banco oficial, branch `contexto`, 2026-11-12):
--   1) audit_activities_trigger (AFTER UPDATE OR DELETE) → public.audit_activity_changes(),
--      SECURITY INVOKER, faz INSERT em public.activity_audit_logs, que tem RLS e só policy de
--      SELECT → "new row violates row-level security policy" para qualquer usuário.
--   2) audit_soft_delete_activities (AFTER UPDATE) → public.log_soft_delete(), SECURITY INVOKER,
--      grava em public.audit_log nas colunas `changes`/`reason` (inexistentes) e action
--      'SOFT_DELETE' (viola audit_log_action_check) → soft-delete de atividade sempre falha.
-- A migration 20261001193100_audit_log_canonical.sql removeu esses triggers legados das tabelas
-- de negócio, mas `activities` ficou fora da lista `audit_tables`.
--
-- Efeito: editar e excluir (soft-delete via deleted_at) atividades passa a funcionar.
-- A auditoria de activities continua: o trigger `audit_activities` →
-- public.audit_trigger_func() (SECURITY DEFINER) já registra INSERT/UPDATE/DELETE.
-- As funções audit_activity_changes() e log_soft_delete() não são removidas (podem ter outros usos).

DROP TRIGGER IF EXISTS audit_activities_trigger ON public.activities;
DROP TRIGGER IF EXISTS audit_soft_delete_activities ON public.activities;
