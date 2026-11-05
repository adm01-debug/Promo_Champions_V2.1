CREATE OR REPLACE FUNCTION public.snapshot_engagement_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.score IS DISTINCT FROM NEW.score) OR (OLD.tier IS DISTINCT FROM NEW.tier) THEN
    INSERT INTO public.email_engagement_score_history(sale_id, score, tier)
    VALUES (NEW.sale_id, NEW.score, NEW.tier);
  END IF;
  RETURN NEW;
END;
$function$
