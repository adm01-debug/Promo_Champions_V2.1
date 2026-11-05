CREATE OR REPLACE FUNCTION public.register_race_daily_checkin(_season_id uuid, _salesperson_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_br DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  yesterday_br DATE := today_br - INTERVAL '1 day';
  prev_streak INTEGER := 0;
  new_streak INTEGER := 1;
  today_snap RECORD;
  prev_snap RECORD;
  result JSONB;
  already_checked_in BOOLEAN;
BEGIN
  PERFORM private.snapshot_race_daily(_season_id);

  SELECT EXISTS (
    SELECT 1 FROM public.race_user_daily_checkins
    WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = today_br
  ) INTO already_checked_in;

  SELECT streak_days INTO prev_streak
  FROM public.race_user_daily_checkins
  WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = yesterday_br
  LIMIT 1;

  IF prev_streak IS NULL THEN prev_streak := 0; END IF;
  new_streak := prev_streak + 1;

  INSERT INTO public.race_user_daily_checkins (user_id, season_id, streak_days)
  VALUES (auth.uid(), _season_id, new_streak)
  ON CONFLICT (user_id, season_id, checkin_date) DO UPDATE SET streak_days = EXCLUDED.streak_days;

  SELECT * INTO today_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date = today_br
  LIMIT 1;

  SELECT * INTO prev_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date < today_br
  ORDER BY snapshot_date DESC
  LIMIT 1;

  result := jsonb_build_object(
    'already_checked_in_today', already_checked_in,
    'streak_days', new_streak,
    'previous_streak', prev_streak,
    'today', CASE WHEN today_snap IS NOT NULL THEN jsonb_build_object(
      'rank', today_snap.rank,
      'progress', today_snap.progress,
      'total_sales', today_snap.total_sales,
      'deals_count', today_snap.deals_count
    ) ELSE NULL END,
    'previous', CASE WHEN prev_snap IS NOT NULL THEN jsonb_build_object(
      'date', prev_snap.snapshot_date,
      'rank', prev_snap.rank,
      'progress', prev_snap.progress,
      'total_sales', prev_snap.total_sales,
      'deals_count', prev_snap.deals_count
    ) ELSE NULL END,
    'delta', CASE WHEN today_snap IS NOT NULL AND prev_snap IS NOT NULL THEN jsonb_build_object(
      'rank', prev_snap.rank - today_snap.rank,
      'progress', today_snap.progress - prev_snap.progress,
      'total_sales', today_snap.total_sales - prev_snap.total_sales,
      'deals_count', today_snap.deals_count - prev_snap.deals_count
    ) ELSE NULL END
  );

  RETURN result;
END;
$function$
