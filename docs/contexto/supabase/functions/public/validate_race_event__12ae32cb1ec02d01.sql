CREATE OR REPLACE FUNCTION public.validate_race_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status text;
BEGIN
  -- Bloqueia eventos em temporadas não-ativas
  SELECT status INTO v_status FROM public.race_seasons WHERE id = NEW.season_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'race_event rejected: season % does not exist', NEW.season_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'race_event rejected: season % is not active (status=%)', NEW.season_id, v_status
      USING ERRCODE = 'check_violation';
  END IF;

  -- Bloqueia eventos sem race_car correspondente para o salesperson
  IF NOT EXISTS (
    SELECT 1 FROM public.race_cars WHERE salesperson_id = NEW.salesperson_id
  ) THEN
    RAISE EXCEPTION 'race_event rejected: no race_car found for salesperson %', NEW.salesperson_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$function$
