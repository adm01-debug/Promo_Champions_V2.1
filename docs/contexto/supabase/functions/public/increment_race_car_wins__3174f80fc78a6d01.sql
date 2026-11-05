CREATE OR REPLACE FUNCTION public.increment_race_car_wins(_salesperson_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE public.race_cars
  SET total_wins = COALESCE(total_wins, 0) + 1,
      total_races = COALESCE(total_races, 0) + 1
  WHERE salesperson_id = _salesperson_id;
$function$
