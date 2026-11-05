CREATE OR REPLACE FUNCTION public.match_weekly_players()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_players uuid[];
  v_player_a uuid;
  v_player_b uuid;
  v_index integer;
  v_count integer;
  v_week_start date := public.start_of_week(current_date, 1);
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended('match_weekly_players:' || v_week_start::text, 0)
  );

  SELECT array_agg(
           s.id ORDER BY md5(s.id::text || ':' || v_week_start::text), s.id
         )
    INTO v_players
    FROM public.salespeople AS s
   WHERE s.is_active IS TRUE;

  v_count := COALESCE(array_length(v_players, 1), 0);
  IF v_count < 2 THEN
    RETURN;
  END IF;
  IF v_count % 2 <> 0 THEN
    v_count := v_count - 1;
  END IF;

  FOR v_index IN 1..v_count BY 2 LOOP
    v_player_a := v_players[v_index];
    v_player_b := v_players[v_index + 1];

    IF NOT EXISTS (
      SELECT 1
      FROM public.weekly_matchups AS wm
      WHERE wm.week_start = v_week_start
        AND (
          wm.salesperson_a_id IN (v_player_a, v_player_b)
          OR wm.salesperson_b_id IN (v_player_a, v_player_b)
        )
    ) THEN
      INSERT INTO public.weekly_matchups (
        salesperson_a_id, salesperson_b_id, week_start, xp_reward, status
      ) VALUES (
        v_player_a, v_player_b, v_week_start, 250, 'active'
      );
    END IF;
  END LOOP;
END;
$function$
