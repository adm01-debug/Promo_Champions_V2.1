-- detect_stalled_cron_jobs() roda a cada 15 min e, para cada um dos ~45 cron
-- jobs ativos, executa SELECT max(start_time) FROM cron.job_run_details
-- WHERE jobid = v_job.jobid.
--
-- cron.job_run_details NAO tem indice em jobid (so o pkey em runid) e cresce
-- ~4.390 linhas/dia. Medido em producao em 2026-11-22:
--   269.138 linhas / 65 MB (worse por mes)
--   EXPLAIN ANALYZE: Parallel Seq Scan, 156 ms, Rows Removed by Filter: 128.590
--   45 jobs x 156 ms = ~7 s
--   cron.job_run_details jobid=17: 9 runs consecutivos entre 6,3 s e 7,8 s,
--   e 1 falha (2026-11-21 20:15) com
--     'canceling statement due to statement timeout'
--   Sob a contenção dos 47 jobs que disparam no mesmo minuto, um run chegou
--   a 17,2 s.
--
-- Nao e' possivel criar indice na tabela: ela pertence a supabase_admin e o
-- role de migration (postgres) recebe
--   42501: must be owner of table job_run_details
--
-- Solucao: tabela espelho public.cron_job_last_run com max(start_time) por job,
-- atualizada INCREMENTALMENTE por runid -- que e' o pkey e portanto
-- monotonico. Um marcador guarda o ultimo runid incorporado, entao cada
-- execucao le apenas as linhas novas via Index Scan:
--   Index Scan using job_run_details_pkey: 1,24 ms / 89 buffers / 211 linhas
--   (contra Parallel Seq Scan: 60 ms / 7.583 buffers / 268k linhas)
-- Custo constante, independente do tamanho de cron.job_run_details.
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.cron_job_last_run (
  jobid      integer PRIMARY KEY,
  last_start timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cron_job_last_run IS
  'Espelho do max(start_time) por cron job. Evita o seq scan em cron.job_run_details (sem indice em jobid, 269k+ linhas) dentro de detect_stalled_cron_jobs().';

ALTER TABLE public.cron_job_last_run ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cron_job_last_run FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.cron_job_last_run TO service_role;

-- Marcador de progresso: ultimo runid ja incorporado ao espelho.
CREATE TABLE IF NOT EXISTS public.cron_job_last_run_cursor (
  id           boolean PRIMARY KEY DEFAULT true CHECK (id),
  last_runid   bigint  NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cron_job_last_run_cursor IS
  'Ultimo runid de cron.job_run_details incorporado a public.cron_job_last_run. Permite leitura incremental via pkey em vez de seq scan.';

ALTER TABLE public.cron_job_last_run_cursor ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cron_job_last_run_cursor FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.cron_job_last_run_cursor TO service_role;

-- Carga inicial: uma unica passada completa, com o maior runid como cursor.
INSERT INTO public.cron_job_last_run (jobid, last_start)
SELECT jobid, max(start_time)
FROM cron.job_run_details
GROUP BY jobid
ON CONFLICT (jobid) DO UPDATE
  SET last_start = GREATEST(public.cron_job_last_run.last_start, EXCLUDED.last_start),
      updated_at = now();

INSERT INTO public.cron_job_last_run_cursor (id, last_runid)
SELECT true, COALESCE(max(runid), 0) FROM cron.job_run_details
ON CONFLICT (id) DO UPDATE
  SET last_runid = GREATEST(public.cron_job_last_run_cursor.last_runid, EXCLUDED.last_runid),
      updated_at = now();

-- DROP necessario: a primeira versao desta funcao recebia um parametro
-- interval; CREATE OR REPLACE nao altera a assinatura e deixaria as duas
-- sobrecarregadas, quebrando a chamada sem argumentos (42725).
DROP FUNCTION IF EXISTS public.refresh_cron_job_last_run(interval);

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
  WITH novos AS (
    SELECT jobid, max(start_time) AS last_start
      FROM cron.job_run_details
     WHERE runid > v_cursor
     GROUP BY jobid
  ), up AS (
    INSERT INTO public.cron_job_last_run (jobid, last_start)
    SELECT jobid, last_start FROM novos
    ON CONFLICT (jobid) DO UPDATE
      SET last_start = GREATEST(public.cron_job_last_run.last_start, EXCLUDED.last_start),
          updated_at = now()
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_rows FROM up;

  -- Avanca o cursor so depois de incorporar; GREATEST impede retrocesso.
  UPDATE public.cron_job_last_run_cursor
     SET last_runid = GREATEST(last_runid, (SELECT COALESCE(max(runid), 0) FROM cron.job_run_details)),
         updated_at = now()
   WHERE id;

  RETURN v_rows;
END;
$function$;

REVOKE ALL ON FUNCTION public.refresh_cron_job_last_run() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_cron_job_last_run() TO service_role;

CREATE OR REPLACE FUNCTION public.detect_stalled_cron_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'cron'
AS $function$
DECLARE
  v_alerts_created integer := 0;
  v_inserted integer;
  v_job record;
  v_last_run timestamptz;
  v_expected_interval interval;
  v_threshold interval;
  v_gap interval;
BEGIN
  PERFORM public.refresh_cron_job_last_run();

  FOR v_job IN
    SELECT jobid, jobname, schedule
    FROM cron.job
    WHERE active = true
      AND jobname NOT IN ('cron-failure-alerter-10min', 'detect-stalled-cron-15min')
  LOOP
    v_expected_interval := public.fn_cron_expected_interval(v_job.schedule);
    v_threshold := public.fn_cron_stalled_threshold(v_job.schedule);

    SELECT c.last_start
      INTO v_last_run
      FROM public.cron_job_last_run AS c
     WHERE c.jobid = v_job.jobid;
    IF v_last_run IS NULL THEN
      v_last_run := now() - interval '30 days';
    END IF;
    v_gap := now() - v_last_run;

    IF v_gap > v_threshold
       AND NOT EXISTS (
         SELECT 1
         FROM public.cron_failure_alerts
         WHERE jobid = v_job.jobid
           AND status = 'stalled'
           AND alerted_at > now() - interval '6 hours'
       ) THEN
      INSERT INTO public.cron_failure_alerts (
        jobid, jobname, start_time, status, return_message,
        alerted_at, notified_admin_count
      ) VALUES (
        v_job.jobid,
        v_job.jobname,
        v_last_run,
        'stalled',
        format(
          'Job %s não executa há %s (esperado a cada %s, threshold %s).',
          v_job.jobname,
          v_gap::text,
          v_expected_interval::text,
          v_threshold::text
        ),
        now(),
        0
      )
      ON CONFLICT (jobid, start_time) DO NOTHING;
      GET DIAGNOSTICS v_inserted = ROW_COUNT;
      v_alerts_created := v_alerts_created + v_inserted;
    END IF;
  END LOOP;

  RETURN v_alerts_created;
END;
$function$;

REVOKE ALL ON FUNCTION public.detect_stalled_cron_jobs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_stalled_cron_jobs() TO service_role;