CREATE OR REPLACE FUNCTION public.increment_v4_callback_metric(_column text, _delta integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  IF _column NOT IN ('sent_ok', 'failed', 'exhausted') THEN
    RAISE EXCEPTION 'invalid metric column: %', _column;
  END IF;

  INSERT INTO public.v4_callback_metrics (day) VALUES (today)
  ON CONFLICT (day) DO NOTHING;

  EXECUTE format(
    'UPDATE public.v4_callback_metrics SET %I = %I + $1, updated_at = now() WHERE day = $2',
    _column, _column
  ) USING _delta, today;
END;
$function$
