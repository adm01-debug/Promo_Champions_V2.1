-- A-48: escritas que a UI faz e a RLS de producao recusa (403 / 42501).
--
-- CAUSA RAIZ (conferida no catalogo de producao, supabase/schema.sql):
--   1) cadence_alert_templates e cadence_outcome_rules: a migration
--      20260831130000_harden_public_access_and_privileged_rpcs.sql dropou as
--      policies "FOR ALL USING (true)" e criou apenas SELECT para authenticated.
--      As telas CadenceAlertConfig.tsx e CadenceOutcomeConfig.tsx (aba Estrategia
--      de /cadencias e /cadencias-orcamentos) fazem INSERT/UPDATE/DELETE e
--      falham com "new row violates row-level security policy" desde 31/08/2026.
--   2) follow_up_audit_logs: tem INSERT e SELECT e nenhuma policy de UPDATE; a
--      tela FollowUpAudit.tsx marca o follow-up como enviado e a alteracao era
--      descartada.
--   3) chat_messages: tem INSERT e SELECT e nenhuma policy de DELETE; excluir a
--      conversa do assistente deixava as mensagens orfas em producao.
--   4) error_logs: tem INSERT somente para anon, entao o logger do app falhava
--      justamente para usuario logado. O conserto ja existe em
--      20261117170000_fix_403_error_logs_insert_authenticated.sql, que ficou na
--      main sem ser aplicado (nao esta no ledger). A policy e repetida aqui com a
--      MESMA definicao para que uma unica aplicacao feche os quatro casos; as
--      duas migrations sao idempotentes (DROP POLICY IF EXISTS + CREATE).
--
-- ESCOPO DAS PERMISSOES (nada mais largo que o comportamento anterior):
--   * cadence_alert_templates / cadence_outcome_rules: escrita para admin/gestor,
--     o mesmo padrao ja vigente em cadence_enrollment_rules e cadence_funnel_rules
--     (tabelas irmaos da mesma aba). A leitura por authenticated segue em USING (true).
--   * follow_up_audit_logs: a pagina /follow-up/audit esta sob <Manager>
--     (ProtectedRoute requireAdminOrManager), entao o UPDATE acompanha esse gate.
--   * chat_messages: DELETE apenas para o dono da conversa
--     (chat_conversations.salesperson_id = get_current_salesperson_id()).
--   * error_logs: INSERT aceita linha sem user_id ou com o user_id do proprio autor.
--
-- REVERSAO: remover as cinco policies criadas aqui (bloco SQL comentado no fim).

-- 1) Cadencia: templates de alerta (configuracao de equipe -> admin/gestor)
DROP POLICY IF EXISTS "Admins/managers can manage alert templates" ON public.cadence_alert_templates;
CREATE POLICY "Admins/managers can manage alert templates"
  ON public.cadence_alert_templates
  FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- 2) Cadencia: regras de desfecho (mesmo escopo da tabela irma)
DROP POLICY IF EXISTS "Admins/managers can manage outcome rules" ON public.cadence_outcome_rules;
CREATE POLICY "Admins/managers can manage outcome rules"
  ON public.cadence_outcome_rules
  FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- 3) Auditoria de follow-up: marcar como enviado / retentativa
DROP POLICY IF EXISTS "Admins and managers can update audit logs" ON public.follow_up_audit_logs;
CREATE POLICY "Admins and managers can update audit logs"
  ON public.follow_up_audit_logs
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- 4) Assistente: excluir as mensagens da propria conversa
DROP POLICY IF EXISTS "Users can delete own chat_messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat_messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT chat_conversations.id
        FROM chat_conversations
       WHERE chat_conversations.salesperson_id = get_current_salesperson_id()
    )
  );

-- 5) Logger de erro do app para usuario logado (espelho do anon)
DROP POLICY IF EXISTS "authenticated can insert error logs" ON public.error_logs;
CREATE POLICY "authenticated can insert error logs"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()));

-- Verificacao: falha a migration se alguma das cinco policies nao ficar no
-- catalogo com o comando e o papel corretos.
DO $$
DECLARE
  expected record;
BEGIN
  FOR expected IN
    SELECT * FROM (VALUES
      ('cadence_alert_templates', 'Admins/managers can manage alert templates', 'ALL'),
      ('cadence_outcome_rules',   'Admins/managers can manage outcome rules',   'ALL'),
      ('follow_up_audit_logs',    'Admins and managers can update audit logs',  'UPDATE'),
      ('chat_messages',           'Users can delete own chat_messages',         'DELETE'),
      ('error_logs',              'authenticated can insert error logs',        'INSERT')
    ) AS t(tbl, pol, cmd)
  LOOP
    IF NOT EXISTS (
      SELECT 1
        FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = expected.tbl
         AND policyname = expected.pol
         AND cmd = expected.cmd
         AND 'authenticated' = ANY (roles)
    ) THEN
      RAISE EXCEPTION 'policy % ausente em public.%', expected.pol, expected.tbl;
    END IF;
  END LOOP;
  RAISE NOTICE 'A-48: escrita restaurada em cadence_alert_templates, cadence_outcome_rules, follow_up_audit_logs, chat_messages e error_logs';
END
$$;

-- REVERSAO (rodar manualmente se precisar voltar ao estado anterior):
-- DROP POLICY IF EXISTS "Admins/managers can manage alert templates" ON public.cadence_alert_templates;
-- DROP POLICY IF EXISTS "Admins/managers can manage outcome rules" ON public.cadence_outcome_rules;
-- DROP POLICY IF EXISTS "Admins and managers can update audit logs" ON public.follow_up_audit_logs;
-- DROP POLICY IF EXISTS "Users can delete own chat_messages" ON public.chat_messages;
-- DROP POLICY IF EXISTS "authenticated can insert error logs" ON public.error_logs;