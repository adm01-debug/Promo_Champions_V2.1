CREATE OR REPLACE FUNCTION public.increment_race_car_wins(_salesperson_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.race_cars
  SET total_wins = COALESCE(total_wins, 0) + 1,
      total_races = COALESCE(total_races, 0) + 1
  WHERE salesperson_id = _salesperson_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_race_car_overtakes(_salesperson_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.race_cars
  SET total_overtakes = COALESCE(total_overtakes, 0) + 1
  WHERE salesperson_id = _salesperson_id;
$$;

REVOKE ALL ON FUNCTION public.increment_race_car_wins(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_race_car_overtakes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_race_car_wins(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_race_car_overtakes(uuid) TO service_role;