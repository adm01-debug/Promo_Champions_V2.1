-- 1. Colunas de auditoria de recuperação
ALTER TABLE public.email_bulk_drafts
  ADD COLUMN IF NOT EXISTS last_error_message text,
  ADD COLUMN IF NOT EXISTS recovered_at timestamptz;

-- Backfill: preserva o erro atual como histórico
UPDATE public.email_bulk_drafts
SET last_error_message = error
WHERE error IS NOT NULL AND last_error_message IS NULL;

-- Backfill de recuperados já conhecidos (tiveram retentativas e foram enviados)
UPDATE public.email_bulk_drafts
SET recovered_at = sent_at
WHERE sent_at IS NOT NULL AND recovered_at IS NULL AND (retry_count > 0 OR last_error_at IS NOT NULL);

-- 2. Trigger que preserva o motivo da falha e marca a recuperação
CREATE OR REPLACE FUNCTION public.track_bulk_draft_recovery()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Preserva a última mensagem real de falha (marcadores operacionais são ignorados)
  IF NEW.error IS NOT NULL
     AND btrim(NEW.error) <> ''
     AND NEW.error NOT IN ('manual_retry_requested') THEN
    NEW.last_error_message := NEW.error;
  END IF;

  -- Marca recuperação quando um rascunho que já falhou passa a ser enviado
  IF NEW.sent_at IS NOT NULL
     AND OLD.sent_at IS NULL
     AND NEW.recovered_at IS NULL
     AND (OLD.retry_count > 0 OR OLD.error IS NOT NULL OR OLD.last_error_message IS NOT NULL) THEN
    NEW.recovered_at := NEW.sent_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_bulk_drafts_recovery ON public.email_bulk_drafts;
CREATE TRIGGER trg_email_bulk_drafts_recovery
BEFORE UPDATE ON public.email_bulk_drafts
FOR EACH ROW EXECUTE FUNCTION public.track_bulk_draft_recovery();

CREATE INDEX IF NOT EXISTS idx_email_bulk_drafts_recovered
  ON public.email_bulk_drafts (job_id, recovered_at) WHERE recovered_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_bulk_drafts_ever_failed
  ON public.email_bulk_drafts (job_id) WHERE last_error_message IS NOT NULL;

-- 3. Normalização do tipo de falha
CREATE OR REPLACE FUNCTION public.normalize_bulk_failure_reason(_error text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _error IS NULL OR btrim(_error) = '' THEN 'sem_erro'
    WHEN _error ~* 'opted_out|unsubscrib|suppress' THEN 'supressao'
    WHEN _error ~* 'missing_recipient_email' THEN 'destinatario_ausente'
    WHEN _error ~* 'invalid[_ -]?(recipient|email|address)|mailbox (does not exist|unavailable)|5\.1\.[0-9]+' THEN 'endereco_invalido'
    WHEN _error ~* 'hard[_ -]?bounce' THEN 'hard_bounce'
    WHEN _error ~* 'email_infra_missing|sender_not_configured' THEN 'infra_remetente'
    WHEN _error ~* 'rate|throttl|429|too many' THEN 'limite_de_vazao'
    WHEN _error ~* 'timeout|timed out|network|fetch failed|502|503|504' THEN 'rede_indisponivel'
    ELSE 'outro'
  END;
$$;

-- 4. Taxa de recuperação por campanha
CREATE OR REPLACE FUNCTION public.get_campaign_recovery_rates(_days integer DEFAULT 90)
RETURNS TABLE(
  job_id uuid,
  prompt text,
  created_at timestamptz,
  failed_total integer,
  recovered_count integer,
  still_failing integer,
  recovery_rate numeric,
  avg_recovery_minutes numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 90), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id, j.prompt, j.created_at
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  failed AS (
    SELECT d.job_id,
           d.recovered_at IS NOT NULL AS recovered,
           CASE WHEN d.recovered_at IS NOT NULL AND d.last_error_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (d.recovered_at - d.last_error_at)) / 60 END AS minutes
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
    WHERE d.last_error_message IS NOT NULL
  )
  SELECT jobs.id,
         jobs.prompt,
         jobs.created_at,
         COALESCE(count(f.*), 0)::integer AS failed_total,
         COALESCE(count(f.*) FILTER (WHERE f.recovered), 0)::integer AS recovered_count,
         COALESCE(count(f.*) FILTER (WHERE NOT f.recovered), 0)::integer AS still_failing,
         CASE WHEN count(f.*) > 0
              THEN round((count(f.*) FILTER (WHERE f.recovered))::numeric * 100 / count(f.*), 2)
              ELSE 0 END AS recovery_rate,
         COALESCE(round(avg(f.minutes)::numeric, 1), 0) AS avg_recovery_minutes
  FROM jobs
  LEFT JOIN failed f ON f.job_id = jobs.id
  GROUP BY jobs.id, jobs.prompt, jobs.created_at
  HAVING count(f.*) > 0
  ORDER BY jobs.created_at DESC;
$$;

-- 5. Taxa de recuperação por tipo de falha
CREATE OR REPLACE FUNCTION public.get_recovery_by_failure_type(_days integer DEFAULT 90)
RETURNS TABLE(
  failure_type text,
  failed_total integer,
  recovered_count integer,
  still_failing integer,
  recovery_rate numeric,
  avg_recovery_minutes numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT now() - (LEAST(GREATEST(COALESCE(_days, 90), 1), 365) || ' days')::interval AS since
  ),
  jobs AS (
    SELECT j.id
    FROM public.email_bulk_jobs j, win
    WHERE j.created_at >= win.since
      AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ),
  failed AS (
    SELECT public.normalize_bulk_failure_reason(d.last_error_message) AS failure_type,
           d.recovered_at IS NOT NULL AS recovered,
           CASE WHEN d.recovered_at IS NOT NULL AND d.last_error_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (d.recovered_at - d.last_error_at)) / 60 END AS minutes
    FROM public.email_bulk_drafts d
    JOIN jobs ON jobs.id = d.job_id
    WHERE d.last_error_message IS NOT NULL
  )
  SELECT f.failure_type,
         count(*)::integer,
         count(*) FILTER (WHERE f.recovered)::integer,
         count(*) FILTER (WHERE NOT f.recovered)::integer,
         round((count(*) FILTER (WHERE f.recovered))::numeric * 100 / count(*), 2),
         COALESCE(round(avg(f.minutes)::numeric, 1), 0)
  FROM failed f
  GROUP BY f.failure_type
  ORDER BY count(*) DESC;
$$;

REVOKE ALL ON FUNCTION public.get_campaign_recovery_rates(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_recovery_by_failure_type(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_campaign_recovery_rates(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_recovery_by_failure_type(integer) TO authenticated, service_role;