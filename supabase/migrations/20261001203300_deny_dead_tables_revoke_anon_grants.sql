-- Pacote auditoria auth/authz (2026-10-01) — 4-TABELAS + USING-TRUE
--
-- 4-TABELAS:
--  * webhook_events: RLS ligada e ZERO policies desde 20260104180000
--    (deny-all por omissao). Varredura em src/ e supabase/functions/ nao
--    achou leitura/escrita via PostgREST — confirma deny-all intencional:
--    COMMENT documentando + REVOKE residual de PUBLIC/anon/authenticated
--    (service_role bypassa RLS e mantem grants proprios; escritas futuras
--    por edge functions continuam funcionando).
--  * cadence_enrollments: TABELA MORTA — zero referencias em src/ e
--    functions/ (cadencias reais usam prospect_cadences,
--    sequence_enrollments e cadence_tasks) e nenhum FK aponta para ela =>
--    DROP documentado. Se prod tiver dependente criado fora do repo, o
--    DROP falha alto e aponta o objeto.
--  * winloss_webhook_replay_audit e winloss_webhook_replay_invocations:
--    ja possuem policies explicitas de SELECT para admin/manager
--    (20260422164313 e 20260422165926) e sao lidas via PostgREST pelos
--    hooks useReplayAudit / useReplayInvocations — sem mudanca necessaria.
--
-- USING-TRUE (REVOKE de GRANT EXECUTE ... TO anon presentes no repo):
--  * fn_test_cleanup_dedupe_privileges()        — grant anon em 20260707112331
--  * fn_cron_expected_interval(text)            — grant anon em 20260712230734
--  * fn_cron_stalled_threshold(text)            — grant anon em 20260712230734
--  * fn_test_simulate_stalled_check(...)        — grant anon em 20260712230734
--  * fn_test_cleanup_cron_alerts(bigint)        — grant anon em 20260712230734
--  * fn_test_backdate_cron_alert(bigint,numeric)— grant anon em 20260712230734
-- Helpers de identidade (is_admin_or_manager, get_current_salesperson_id)
-- MANTEM EXECUTE para anon: sao avaliados dentro de policies aplicadas a
-- PUBLIC; revogar converteria retorno benigno (false) em erro 42501 em
-- qualquer tabela alcancavel por anon.

COMMENT ON TABLE public.webhook_events IS
  'Deny-all intencional: RLS habilitado sem policies (20260104180000). Sem consumidores PostgREST em src/ nem functions/; qualquer escrita futura ocorre via service_role, que bypassa RLS. Documentado no pacote authz 2026-10-01.';

REVOKE ALL ON TABLE public.webhook_events FROM PUBLIC, anon, authenticated;

DROP TABLE IF EXISTS public.cadence_enrollments;

DO $$
DECLARE
  fn text;
  v_revoked text[] := '{}';
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'fn_test_cleanup_dedupe_privileges()',
    'fn_cron_expected_interval(text)',
    'fn_cron_stalled_threshold(text)',
    'fn_test_simulate_stalled_check(bigint, text, text, timestamp with time zone)',
    'fn_test_cleanup_cron_alerts(bigint)',
    'fn_test_backdate_cron_alert(bigint, numeric)'
  ] LOOP
    IF to_regprocedure(format('public.%s', fn)) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
      v_revoked := v_revoked || fn;
    END IF;
  END LOOP;
  RAISE NOTICE 'EXECUTE revogado de anon em: %', array_to_string(v_revoked, ', ');
END $$;
