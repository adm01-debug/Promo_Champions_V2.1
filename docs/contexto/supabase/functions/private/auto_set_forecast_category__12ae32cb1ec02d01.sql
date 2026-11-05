CREATE OR REPLACE FUNCTION private.auto_set_forecast_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IN ('completed', 'won', 'closed') THEN
    NEW.forecast_category := 'closed';
  ELSIF NEW.status IN ('lost', 'cancelled') THEN
    NEW.forecast_category := 'omitted';
  ELSIF NEW.status = 'negotiation' THEN
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'commit');
  ELSIF NEW.status = 'proposal' THEN
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'best_case');
  ELSE
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'pipeline');
  END IF;
  RETURN NEW;
END;
$function$
