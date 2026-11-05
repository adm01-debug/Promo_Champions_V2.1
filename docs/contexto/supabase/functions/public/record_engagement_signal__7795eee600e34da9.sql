CREATE OR REPLACE FUNCTION public.record_engagement_signal(_contact_id uuid, _contact_type text, _signal text, _occurred_at timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  h smallint;
  d smallint;
BEGIN
  IF _contact_id IS NULL OR _contact_type NOT IN ('lead', 'client') THEN
    RETURN;
  END IF;

  h := EXTRACT(HOUR FROM _occurred_at)::smallint;
  d := EXTRACT(DOW FROM _occurred_at)::smallint;

  INSERT INTO public.contact_send_time_profile
    (contact_id, contact_type, hour_of_day, day_of_week, opens, clicks, replies, updated_at)
  VALUES (
    _contact_id, _contact_type, h, d,
    CASE WHEN _signal = 'open' THEN 1 ELSE 0 END,
    CASE WHEN _signal = 'click' THEN 1 ELSE 0 END,
    CASE WHEN _signal = 'reply' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (contact_id, contact_type, hour_of_day, day_of_week)
  DO UPDATE SET
    opens = public.contact_send_time_profile.opens + CASE WHEN _signal = 'open' THEN 1 ELSE 0 END,
    clicks = public.contact_send_time_profile.clicks + CASE WHEN _signal = 'click' THEN 1 ELSE 0 END,
    replies = public.contact_send_time_profile.replies + CASE WHEN _signal = 'reply' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$function$
