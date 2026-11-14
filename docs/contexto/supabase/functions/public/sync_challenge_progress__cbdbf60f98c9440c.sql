CREATE OR REPLACE FUNCTION public.sync_challenge_progress(p_salesperson_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_scope uuid[];
  v_sp uuid;
  v_challenge record;
  v_val integer;
  v_done boolean;
  v_upserts integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.role() <> 'service_role' THEN
    -- Cliente: só o próprio vendedor (admin/manager pode apontar outro).
    v_sp := public.get_current_salesperson_id();
    IF v_sp IS NULL THEN
      RAISE EXCEPTION 'Perfil comercial não encontrado' USING ERRCODE = 'P0001';
    END IF;
    IF p_salesperson_id IS NOT NULL
       AND p_salesperson_id <> v_sp
       AND NOT public.is_admin_or_manager(auth.uid()) THEN
      RAISE EXCEPTION 'forbidden: só o próprio progresso pode ser sincronizado';
    END IF;
    v_scope := ARRAY[COALESCE(p_salesperson_id, v_sp)];
  END IF;
  -- service_role / cron (auth.uid() NULL): p_salesperson_id NULL → todos.

  FOR v_sp IN
    SELECT id FROM public.salespeople
     WHERE v_scope IS NULL OR id = ANY (v_scope)
  LOOP
    -- Semanais: desafios ativos cuja janela cobre hoje.
    FOR v_challenge IN
      SELECT id, challenge_type, target_value, start_date, end_date
        FROM public.weekly_challenges
       WHERE is_active
         AND CURRENT_DATE BETWEEN start_date AND end_date
    LOOP
      v_val := public.compute_challenge_progress_value(
        v_sp, v_challenge.challenge_type, v_challenge.start_date, v_challenge.end_date);
      v_done := v_val >= v_challenge.target_value;

      INSERT INTO public.challenge_progress
        (challenge_id, salesperson_id, current_value, completed_at)
      VALUES (v_challenge.id, v_sp, v_val, CASE WHEN v_done THEN now() ELSE NULL END)
      ON CONFLICT (challenge_id, salesperson_id) DO UPDATE
        SET current_value = EXCLUDED.current_value,
            completed_at = COALESCE(
              challenge_progress.completed_at, EXCLUDED.completed_at),
            updated_at = now();

      v_upserts := v_upserts + 1;
    END LOOP;

    -- Diários: desafios ativos do dia.
    FOR v_challenge IN
      SELECT id, challenge_type, target_value, challenge_date
        FROM public.daily_challenges
       WHERE is_active
         AND challenge_date = CURRENT_DATE
    LOOP
      v_val := public.compute_challenge_progress_value(
        v_sp, v_challenge.challenge_type, v_challenge.challenge_date, v_challenge.challenge_date);
      v_done := v_val >= v_challenge.target_value;

      INSERT INTO public.daily_challenge_progress
        (challenge_id, salesperson_id, current_value, completed_at)
      VALUES (v_challenge.id, v_sp, v_val, CASE WHEN v_done THEN now() ELSE NULL END)
      ON CONFLICT (challenge_id, salesperson_id) DO UPDATE
        SET current_value = EXCLUDED.current_value,
            completed_at = COALESCE(
              daily_challenge_progress.completed_at, EXCLUDED.completed_at),
            updated_at = now();

      v_upserts := v_upserts + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('synced', v_upserts);
END;
$function$
