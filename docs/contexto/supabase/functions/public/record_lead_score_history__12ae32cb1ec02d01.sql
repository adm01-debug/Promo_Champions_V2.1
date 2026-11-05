CREATE OR REPLACE FUNCTION public.record_lead_score_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.score IS DISTINCT FROM OLD.score) THEN
    INSERT INTO public.lead_score_history(sale_id, score, factors, recorded_at)
    VALUES (NEW.sale_id, NEW.score, COALESCE(NEW.factors, '{}'::jsonb), now());
  END IF;
  RETURN NEW;
END;
$function$
