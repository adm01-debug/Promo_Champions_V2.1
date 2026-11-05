CREATE OR REPLACE FUNCTION public.schedule_next_qbrs()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _r RECORD;
  _interval interval;
  _count int := 0;
BEGIN
  FOR _r IN SELECT id, frequency, last_qbr_at FROM public.qbr_schedule WHERE is_active = true
  LOOP
    _interval := CASE _r.frequency
      WHEN 'monthly' THEN INTERVAL '30 days'
      WHEN 'quarterly' THEN INTERVAL '90 days'
      WHEN 'biannual' THEN INTERVAL '180 days'
      ELSE INTERVAL '365 days'
    END;
    UPDATE public.qbr_schedule
    SET next_qbr_at = COALESCE(_r.last_qbr_at, CURRENT_DATE) + _interval,
        updated_at = now()
    WHERE id = _r.id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$function$
