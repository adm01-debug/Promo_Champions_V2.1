CREATE OR REPLACE FUNCTION public.refresh_cron_job_last_run()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'cron'
AS $function$
DECLARE
  v_cursor bigint;
  v_rows   integer;
BEGIN
  -- Le e trava o cursor, para que duas execucoes concorrentes nao processem
  -- o mesmo intervalo duas vezes.
  SELECT c.last_runid INTO v_cursor
    FROM public.cron_job_last_run_cursor AS c WHERE c.id
     FOR UPDATE;

  -- Filtro pelo pkey (runid e' monotonico): Index Scan, custo independente
  -- do tamanho de cron.job_run_details.
  -- HAVING protege contra o jobid cujas linhas novas ainda estao com
  -- start_time NULL (linha inserida pelo pg_cron mas ainda nao iniciada).
  WITH novos AS (
    SELECT jobid, max(start_time) AS last_start
      FROM cron.job_run_details
     WHERE runid > v_cursor
     GROUP BY jobid
    HAVING max(start_time) IS NOT NULL
  ), up AS (
    INSERT INTO public.cron_job_last_run (jobid, last_start)
    SELECT jobid, last_start FROM novos
    ON CONFLICT (jobid) DO UPDATE
      SET last_start = GREATEST(public.cron_job_last_run.last_start, EXCLUDED.last_start),
          updated_at = now()
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_rows FROM up;

  -- Avanca o cursor so depois de incorporar, e nunca alem de uma linha com
  -- start_time NULL: o pg_cron preenche start_time depois, sem trocar o runid,
  -- entao avancar sobre ela perderia aquele run para sempre.
  UPDATE public.cron_job_last_run_cursor
     SET last_runid = GREATEST(last_runid, COALESCE(
           (SELECT max(runid) FROM cron.job_run_details WHERE start_time IS NOT NULL),
           0)),
         updated_at = now()
   WHERE id;

  RETURN v_rows;
END;
$function$
