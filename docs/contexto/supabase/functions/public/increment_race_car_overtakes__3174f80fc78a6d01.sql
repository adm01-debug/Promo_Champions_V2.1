CREATE OR REPLACE FUNCTION public.increment_race_car_overtakes(_salesperson_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE public.race_cars
  SET total_overtakes = COALESCE(total_overtakes, 0) + 1
  WHERE salesperson_id = _salesperson_id;
$function$
