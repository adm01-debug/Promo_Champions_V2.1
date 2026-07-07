-- IMP13: garantir agendamento pg_cron + função de leitura segura

-- Reagendar (idempotente): remove qualquer job antigo com esse nome e recria
DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'cleanup-webhook-dedupe';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'cleanup-webhook-dedupe',
  '0 */6 * * *',  -- a cada 6h
  $$SELECT public.fn_cleanup_webhook_dedupe();$$
);

-- Função segura para admins consultarem jobs cron sem GRANT direto no schema cron
CREATE OR REPLACE FUNCTION public.fn_list_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  command text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT j.jobid, j.jobname, j.schedule, j.command, j.active
  FROM cron.job j
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;

REVOKE EXECUTE ON FUNCTION public.fn_list_cron_jobs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_list_cron_jobs() TO authenticated, service_role;