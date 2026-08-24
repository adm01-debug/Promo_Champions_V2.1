-- Melhoria 1: trigger de validação de race_events
CREATE OR REPLACE FUNCTION public.validate_race_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS validate_race_event_trigger ON public.race_events;
CREATE TRIGGER validate_race_event_trigger
  BEFORE INSERT ON public.race_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_race_event();

-- Melhoria 2: índice composto para acelerar leaderboard
CREATE INDEX IF NOT EXISTS race_events_season_salesperson_idx
  ON public.race_events (season_id, salesperson_id, created_at DESC);
