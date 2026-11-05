CREATE OR REPLACE FUNCTION private.snapshot_race_daily(_season_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  inserted_count INTEGER := 0;
  today_br DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  INSERT INTO public.race_daily_snapshots (
    season_id, salesperson_id, snapshot_date, rank, progress, total_sales, deals_count, score
  )
  SELECT
    v.season_id,
    v.salesperson_id,
    today_br,
    ROW_NUMBER() OVER (ORDER BY v.progress DESC)::INTEGER AS rank,
    v.progress,
    COALESCE(v.total_sales, 0),
    COALESCE(v.deals_count, 0),
    v.score
  FROM public.race_leaderboard_view v
  WHERE v.season_id = _season_id
  ON CONFLICT (season_id, salesperson_id, snapshot_date) DO UPDATE
    SET rank = EXCLUDED.rank,
        progress = EXCLUDED.progress,
        total_sales = EXCLUDED.total_sales,
        deals_count = EXCLUDED.deals_count,
        score = EXCLUDED.score;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$function$
