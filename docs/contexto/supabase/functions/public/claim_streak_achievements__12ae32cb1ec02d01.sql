CREATE OR REPLACE FUNCTION public.claim_streak_achievements()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_streak integer;
  v_milestone record;
  v_n bigint;
  v_claimed jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para resgatar conquistas'
      USING ERRCODE = '28000';
  END IF;

  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  v_streak := public.calculate_daily_challenge_streak(v_sp);

  FOR v_milestone IN
    SELECT * FROM (VALUES
      ('streak_3',  3,  50,   'Iniciante Dedicado'),
      ('streak_7',  7,  150,  'Semana Perfeita'),
      ('streak_14', 14, 400,  'Duas Semanas de Fogo'),
      ('streak_30', 30, 1000, 'Mestre da Consistência')
    ) AS m(streak_type, days, xp, title)
    WHERE m.days <= v_streak
  LOOP
    -- UNIQUE(salesperson_id, streak_type) torna o claim exatamente-uma-vez;
    -- quem perde o conflito não credita XP de novo.
    INSERT INTO public.daily_streak_achievements (
      salesperson_id, streak_type, streak_count, xp_awarded
    ) VALUES (
      v_sp, v_milestone.streak_type, v_streak, v_milestone.xp
    )
    ON CONFLICT (salesperson_id, streak_type) DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;

    IF v_n > 0 THEN
      INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
      VALUES (
        v_sp, v_milestone.xp, 'streak_achievement', v_milestone.streak_type,
        'Conquista: ' || v_milestone.title || ' (' || v_milestone.days || ' dias)'
      );
      v_claimed := v_claimed || jsonb_build_object(
        'streak_type', v_milestone.streak_type,
        'xp_awarded', v_milestone.xp,
        'title', v_milestone.title
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('streak', v_streak, 'claimed', v_claimed);
END;
$function$
