-- ONDA 1 (#14): RPC que expõe o estado real dos crons de edge functions para
-- a tela AdminSystemStatus (que hoje mostra horários fixos inventados).
--
-- Retorna, por job agendado via trigger_internal_edge_job, a função alvo, o
-- schedule, a última execução (status/horário/mensagem) e se ela está ativa.
-- Acesso: admin/manager (mesmo critério das demais telas administrativas).

CREATE OR REPLACE FUNCTION public.admin_edge_cron_status()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  active boolean,
  function_name text,
  last_status text,
  last_run_at timestamptz,
  last_return_code integer,
  run_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  IF NOT (
    public.is_admin_or_manager(auth.uid())
    OR (auth.jwt() ->> 'role') = 'service_role'
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    j.jobid,
    j.jobname,
    j.schedule,
    j.active,
    -- extrai o nome da function de 'SELECT public.trigger_internal_edge_job(''x'');'
    substring(j.command from 'trigger_internal_edge_job\(''([^'']+)''\)') AS function_name,
    lr.status AS last_status,
    lr.start_time AS last_run_at,
    (regexp_match(lr.return_message, 'status:\s*(\d{3})'))[1]::integer AS last_return_code,
    COALESCE(rc.n, 0) AS run_count
  FROM cron.job AS j
  LEFT JOIN LATERAL (
    SELECT status, start_time, return_message
    FROM cron.job_run_details AS d
    WHERE d.jobid = j.jobid
    ORDER BY d.start_time DESC
    LIMIT 1
  ) AS lr ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS n
    FROM cron.job_run_details AS d
    WHERE d.jobid = j.jobid
  ) AS rc ON true
  WHERE j.command ILIKE '%trigger_internal_edge_job%'
  ORDER BY j.jobname;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_edge_cron_status()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_edge_cron_status()
  TO authenticated, service_role;
