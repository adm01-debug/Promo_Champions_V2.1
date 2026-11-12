-- activities: corrige a auditoria que faz TODO UPDATE/soft-delete de atividade falhar,
-- mantendo o "Histórico de Alterações" (activity_audit_logs) e adotando o audit canônico.
--
-- Causa (snapshot do banco oficial, branch `contexto`, 2026-11-12):
--   1) audit_activities_trigger (AFTER UPDATE OR DELETE) → public.audit_activity_changes(),
--      SECURITY INVOKER, faz INSERT em public.activity_audit_logs, que tem RLS e só policy de
--      SELECT → "new row violates row-level security policy" para qualquer usuário.
--   2) audit_soft_delete_activities (AFTER UPDATE) → public.log_soft_delete(), SECURITY INVOKER,
--      grava em public.audit_log nas colunas `changes`/`reason` (inexistentes) e action
--      'SOFT_DELETE' (viola audit_log_action_check) → soft-delete de atividade sempre falha.
--   3) audit_activities → public.audit_trigger_func() grava em public.audit_log, tabela
--      superseded por public.audit_logs (20261001193100_audit_log_canonical); `activities`
--      ficou fora da lista `audit_tables` daquela migration.
--   4) No DELETE físico (admin/gestor, rotinas de limpeza) o mesmo trigger insere em
--      activity_audit_logs uma linha apontando para a atividade já apagada → viola a FK
--      activity_audit_logs.activity_id (ON DELETE CASCADE apaga o histórico de qualquer forma).
--   5) A policy SELECT de activity_audit_logs compara auth.uid() (id de usuário) com
--      activities.salesperson_id (id de vendedor): o vendedor nunca vê o histórico das
--      próprias atividades, só admin/gestor.
--
-- Efeito:
--   - audit_activity_changes() passa a SECURITY DEFINER com search_path fixo (EXECUTE revogado
--     de PUBLIC/anon/authenticated: só roda como trigger) → editar/excluir volta a funcionar e o
--     histórico da atividade continua sendo gravado (changed_by = auth.uid()). O trigger
--     audit_activities_trigger passa a ser só AFTER UPDATE; o DELETE físico fica registrado no
--     audit canônico (abaixo).
--   - Saem audit_soft_delete_activities (quebrado) e audit_activities (tabela legada); entra o
--     trigger canônico audit_business_changes → public.audit_log_row_change() (public.audit_logs),
--     igual às demais tabelas de negócio.
--   - O vendedor dono da atividade passa a ler o histórico dela; admin/gestor continuam lendo tudo.
-- Idempotente.

ALTER FUNCTION public.audit_activity_changes() SECURITY DEFINER;
ALTER FUNCTION public.audit_activity_changes() SET search_path = public;
REVOKE ALL ON FUNCTION public.audit_activity_changes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS audit_activities_trigger ON public.activities;
CREATE TRIGGER audit_activities_trigger
  AFTER UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.audit_activity_changes();

DROP TRIGGER IF EXISTS audit_soft_delete_activities ON public.activities;
DROP TRIGGER IF EXISTS audit_activities ON public.activities;

DROP TRIGGER IF EXISTS audit_business_changes ON public.activities;
CREATE TRIGGER audit_business_changes
  AFTER UPDATE OR DELETE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_row_change();

DROP POLICY IF EXISTS "Users can view audit logs for their activities" ON public.activity_audit_logs;
CREATE POLICY "Users can view audit logs for their activities"
  ON public.activity_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.activities a
       WHERE a.id = activity_audit_logs.activity_id
         AND a.salesperson_id = public.get_current_salesperson_id()
    )
    OR public.is_admin_or_manager(auth.uid())
  );
