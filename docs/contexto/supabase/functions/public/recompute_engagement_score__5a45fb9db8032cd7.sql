CREATE OR REPLACE FUNCTION public.recompute_engagement_score(_contact_id uuid, _contact_type text)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_opens INTEGER := 0;
  v_total_clicks INTEGER := 0;
  v_total_replies INTEGER := 0;
  v_raw_score NUMERIC := 0;
  v_score NUMERIC := 0;
  v_tier TEXT := 'cold';
  v_last_signal TIMESTAMPTZ;
  v_half_life_days NUMERIC := 7;
BEGIN
  IF _contact_id IS NULL OR _contact_type NOT IN ('lead','client') THEN
    RETURN 0;
  END IF;

  SELECT
    COALESCE(SUM(opens), 0),
    COALESCE(SUM(clicks), 0),
    COALESCE(SUM(replies), 0),
    MAX(updated_at)
  INTO v_total_opens, v_total_clicks, v_total_replies, v_last_signal
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND updated_at >= now() - interval '30 days';

  SELECT COALESCE(SUM(
    (opens * 1 + clicks * 3 + replies * 8) *
    POWER(0.5, EXTRACT(EPOCH FROM (now() - updated_at)) / (v_half_life_days * 86400))
  ), 0)
  INTO v_raw_score
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND updated_at >= now() - interval '30 days';

  v_score := LEAST(100, GREATEST(0, v_raw_score * 2));

  v_tier := CASE
    WHEN v_score >= 81 THEN 'on_fire'
    WHEN v_score >= 51 THEN 'hot'
    WHEN v_score >= 21 THEN 'warm'
    ELSE 'cold'
  END;

  INSERT INTO public.contact_engagement_score
    (contact_id, contact_type, score, tier, total_opens, total_clicks, total_replies, last_signal_at, decay_applied_at, updated_at)
  VALUES
    (_contact_id, _contact_type, v_score, v_tier, v_total_opens, v_total_clicks, v_total_replies, v_last_signal, now(), now())
  ON CONFLICT (contact_id, contact_type) DO UPDATE SET
    score = EXCLUDED.score,
    tier = EXCLUDED.tier,
    total_opens = EXCLUDED.total_opens,
    total_clicks = EXCLUDED.total_clicks,
    total_replies = EXCLUDED.total_replies,
    last_signal_at = EXCLUDED.last_signal_at,
    decay_applied_at = now(),
    updated_at = now();

  INSERT INTO public.engagement_score_history (contact_id, contact_type, score, tier, captured_at)
  VALUES (_contact_id, _contact_type, v_score, v_tier, CURRENT_DATE)
  ON CONFLICT (contact_id, contact_type, captured_at) DO UPDATE SET
    score = EXCLUDED.score,
    tier = EXCLUDED.tier;

  RETURN v_score;
END;
$function$
