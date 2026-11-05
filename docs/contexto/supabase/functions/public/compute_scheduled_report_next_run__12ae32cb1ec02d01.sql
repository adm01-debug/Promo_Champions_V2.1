CREATE OR REPLACE FUNCTION public.compute_scheduled_report_next_run()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base TIMESTAMPTZ;
  candidate TIMESTAMPTZ;
BEGIN
  base := COALESCE(NEW.last_run_at, now());
  IF NEW.frequency = 'daily' THEN
    candidate := date_trunc('day', now()) + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() THEN
      candidate := candidate + interval '1 day';
    END IF;
  ELSIF NEW.frequency = 'weekly' THEN
    candidate := date_trunc('day', now()) + (NEW.hour_of_day || ' hours')::interval;
    -- avança até bater no day_of_week (default 1 = segunda)
    WHILE EXTRACT(DOW FROM candidate)::INT <> COALESCE(NEW.day_of_week, 1) OR candidate <= now() LOOP
      candidate := candidate + interval '1 day';
    END LOOP;
  ELSE -- monthly
    candidate := date_trunc('month', now())
                 + ((COALESCE(NEW.day_of_month, 1) - 1) || ' days')::interval
                 + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() THEN
      candidate := candidate + interval '1 month';
    END IF;
  END IF;
  NEW.next_run_at := candidate;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$
