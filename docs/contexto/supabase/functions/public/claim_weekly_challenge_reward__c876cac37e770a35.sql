CREATE OR REPLACE FUNCTION public.claim_weekly_challenge_reward(p_challenge_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_challenge record;
  v_n bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para resgatar recompensa'
      USING ERRCODE = '28000';
  END IF;

  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT id, title, xp_reward, target_value
    INTO v_challenge
    FROM public.weekly_challenges
   WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.challenge_progress
     SET xp_claimed = true,
         completed_at = COALESCE(completed_at, now()),
         current_value = GREATEST(current_value, v_challenge.target_value),
         updated_at = now()
   WHERE challenge_id = p_challenge_id
     AND salesperson_id = v_sp
     AND xp_claimed = false
     AND (completed_at IS NOT NULL OR current_value >= v_challenge.target_value);
  GET DIAGNOSTICS v_n = ROW_COUNT;

  IF v_n = 0 THEN
    RAISE EXCEPTION 'Desafio não concluído ou recompensa já resgatada'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
  VALUES (
    v_sp, v_challenge.xp_reward, 'weekly_challenge', p_challenge_id::text,
    'Desafio completado: ' || v_challenge.title
  );

  RETURN jsonb_build_object('xp_reward', v_challenge.xp_reward);
END;
$function$
