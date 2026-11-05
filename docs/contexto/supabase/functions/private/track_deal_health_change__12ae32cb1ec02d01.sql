CREATE OR REPLACE FUNCTION private.track_deal_health_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_delta int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_health_history (sale_id, owner_id, score, tier, delta)
    VALUES (NEW.sale_id, COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid), NEW.health_score, NEW.tier, 0);
    RETURN NEW;
  END IF;

  v_delta := NEW.health_score - OLD.health_score;
  IF ABS(v_delta) >= 5 OR NEW.tier IS DISTINCT FROM OLD.tier THEN
    INSERT INTO public.deal_health_history (sale_id, owner_id, score, tier, delta)
    VALUES (NEW.sale_id, COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid), NEW.health_score, NEW.tier, v_delta);
  END IF;
  RETURN NEW;
END;
$function$
