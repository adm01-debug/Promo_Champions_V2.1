CREATE OR REPLACE FUNCTION public.resolve_weekly_matchups()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_matchup record;
  v_score_a numeric;
  v_score_b numeric;
  v_finished integer := 0;
  v_week_end date;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('resolve_weekly_matchups', 0));

  FOR v_matchup IN
    SELECT id, salesperson_a_id, salesperson_b_id, week_start, xp_reward
    FROM public.weekly_matchups
    WHERE status = 'active'
  LOOP
    v_week_end := v_matchup.week_start + 7;

    SELECT COALESCE(sum(xp_amount), 0) INTO v_score_a
      FROM public.xp_history
     WHERE salesperson_id = v_matchup.salesperson_a_id
       AND created_at >= v_matchup.week_start
       AND created_at < v_week_end;

    SELECT COALESCE(sum(xp_amount), 0) INTO v_score_b
      FROM public.xp_history
     WHERE salesperson_id = v_matchup.salesperson_b_id
       AND created_at >= v_matchup.week_start
       AND created_at < v_week_end;

    IF v_week_end <= current_date THEN
      UPDATE public.weekly_matchups
         SET score_a = v_score_a,
             score_b = v_score_b,
             winner_id = CASE
               WHEN v_score_a > v_score_b THEN v_matchup.salesperson_a_id
               WHEN v_score_b > v_score_a THEN v_matchup.salesperson_b_id
               ELSE NULL
             END,
             status = 'finished'
       WHERE id = v_matchup.id;

      -- Empate não paga prêmio e winner_id fica NULL.
      IF v_score_a <> v_score_b THEN
        INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
        VALUES (
          CASE WHEN v_score_a > v_score_b THEN v_matchup.salesperson_a_id
               ELSE v_matchup.salesperson_b_id END,
          v_matchup.xp_reward,
          'weekly_matchup',
          v_matchup.id::text,
          'Vitória no confronto semanal'
        );
      END IF;
      v_finished := v_finished + 1;
    ELSE
      -- Semana corrente: só atualiza o placar ao vivo do card.
      UPDATE public.weekly_matchups
         SET score_a = v_score_a, score_b = v_score_b
       WHERE id = v_matchup.id;
    END IF;
  END LOOP;

  RETURN v_finished;
END;
$function$
