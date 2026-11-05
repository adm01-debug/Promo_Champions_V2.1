CREATE OR REPLACE FUNCTION public.compute_optimal_send_time(_contact_id uuid, _contact_type text, _earliest timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  best_hour smallint;
  best_dow smallint;
  candidate timestamptz;
  i int := 0;
BEGIN
  SELECT hour_of_day, day_of_week INTO best_hour, best_dow
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND score > 0
  ORDER BY score DESC, updated_at DESC
  LIMIT 1;

  -- Fallback: next weekday at 10:00 UTC
  IF best_hour IS NULL THEN
    candidate := date_trunc('day', _earliest) + interval '10 hours';
    WHILE candidate < _earliest OR EXTRACT(DOW FROM candidate) IN (0, 6) LOOP
      candidate := candidate + interval '1 day';
    END LOOP;
    RETURN candidate;
  END IF;

  -- Find next occurrence of (best_dow, best_hour) >= _earliest
  candidate := date_trunc('day', _earliest) + (best_hour || ' hours')::interval;
  WHILE (EXTRACT(DOW FROM candidate)::int <> best_dow OR candidate < _earliest) AND i < 14 LOOP
    candidate := candidate + interval '1 day';
    i := i + 1;
  END LOOP;

  RETURN candidate;
END;
$function$
