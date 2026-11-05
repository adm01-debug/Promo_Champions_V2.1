CREATE OR REPLACE FUNCTION public.trg_invalidate_forecast_narrative_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
