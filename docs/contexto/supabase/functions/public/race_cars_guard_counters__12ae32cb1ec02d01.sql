CREATE OR REPLACE FUNCTION public.race_cars_guard_counters()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF COALESCE(NEW.total_wins, 0) <> 0
         OR COALESCE(NEW.total_overtakes, 0) <> 0
         OR COALESCE(NEW.total_races, 0) <> 0 THEN
        RAISE EXCEPTION 'Contadores de corrida são gerenciados pelo servidor'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.total_wins IS DISTINCT FROM OLD.total_wins
       OR NEW.total_overtakes IS DISTINCT FROM OLD.total_overtakes
       OR NEW.total_races IS DISTINCT FROM OLD.total_races THEN
      RAISE EXCEPTION 'Contadores de corrida são gerenciados pelo servidor'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
