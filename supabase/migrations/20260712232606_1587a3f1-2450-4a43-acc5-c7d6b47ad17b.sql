
-- P1 — índice para GC de fila (status + updated_at)
CREATE INDEX IF NOT EXISTS idx_call_recording_ingest_jobs_status_updated
  ON public.call_recording_ingest_jobs (status, updated_at);

-- P4 — índice para dedupe/consulta por jobname no alerter
CREATE INDEX IF NOT EXISTS idx_cron_failure_alerts_jobname_alerted
  ON public.cron_failure_alerts (jobname, alerted_at DESC)
  WHERE jobname IS NOT NULL;

-- P2 — invalidation de cache quando forecast muda materialmente
CREATE OR REPLACE FUNCTION public.trg_invalidate_forecast_narrative_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
       NEW.commit_amount    IS DISTINCT FROM OLD.commit_amount
    OR NEW.best_case_amount IS DISTINCT FROM OLD.best_case_amount
    OR NEW.upside_amount    IS DISTINCT FROM OLD.upside_amount
    OR NEW.weighted_pipeline IS DISTINCT FROM OLD.weighted_pipeline
    OR NEW.goal_amount      IS DISTINCT FROM OLD.goal_amount
    OR NEW.deals_count      IS DISTINCT FROM OLD.deals_count
    OR NEW.confidence_score IS DISTINCT FROM OLD.confidence_score
    OR NEW.factors::text    IS DISTINCT FROM OLD.factors::text
  ) THEN
    DELETE FROM public.ai_narrative_cache
     WHERE narrative_type = 'forecast-narrative'
       AND cache_key LIKE 'forecast-narrative:' || NEW.id::text || ':%';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forecast_cache_invalidate ON public.revenue_forecasts;
CREATE TRIGGER trg_forecast_cache_invalidate
  AFTER UPDATE ON public.revenue_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_invalidate_forecast_narrative_cache();

-- P3 — atualizar estatísticas do planner para os índices novos
ANALYZE public.call_recording_ingest_jobs;
ANALYZE public.cron_failure_alerts;
ANALYZE public.ai_narrative_cache;
