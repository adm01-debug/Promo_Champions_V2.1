CREATE OR REPLACE FUNCTION public.award_sale_xp(p_sale_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale record;
  v_per_1000 numeric;
  v_xp integer;
  v_old_xp integer;
  v_new_xp integer;
  v_thresholds jsonb;
  v_prev_level integer;
  v_new_level integer;
  v_full_result boolean;
BEGIN
  -- service_role não carrega uid de usuário: o GRANT já é a fronteira —
  -- a concessão é feita em nome do dono da venda, nunca do caller.
  IF auth.role() IS DISTINCT FROM 'service_role' AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória' USING ERRCODE = '28000';
  END IF;

  SELECT id, salesperson_id, amount, status, client_name
    INTO v_sale
    FROM public.sales
   WHERE id = p_sale_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada' USING ERRCODE = 'P0002';
  END IF;

  -- Posse: todo cliente recebe o broadcast e pode disparar o crédito
  -- (idempotente por sale_id), mas só o dono da venda, admin/manager ou
  -- service_role recebem os totais — os demais recebem {'awarded': true}.
  v_full_result := auth.role() = 'service_role'
    OR public.is_admin_or_manager(auth.uid())
    OR v_sale.salesperson_id = public.get_current_salesperson_id();

  -- Status ganho canônico: WON/COUNTED = ('completed','won','closed').
  IF v_sale.status IS NULL
     OR NOT (v_sale.status = ANY (ARRAY['completed','won','closed'])) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'sale_not_won');
  END IF;

  IF v_sale.salesperson_id IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_salesperson');
  END IF;

  v_per_1000 := COALESCE(
    (SELECT (value ->> 'SALE_PER_1000')::numeric
       FROM public.app_config WHERE key = 'xp.rewards'),
    10
  );
  v_xp := (floor(v_sale.amount / 1000) * v_per_1000)::int;
  IF v_xp <= 0 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_xp', 'xp_awarded', 0);
  END IF;

  -- Idempotência: N clientes recebem o broadcast e chamam juntos — o lock
  -- por sale_id serializa e o check em xp_history credita uma única vez.
  PERFORM pg_advisory_xact_lock(hashtext('award_sale_xp:' || p_sale_id::text));

  IF EXISTS (
    SELECT 1 FROM public.xp_history
     WHERE source_type = 'sale' AND source_id = p_sale_id::text
  ) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'already_awarded', 'xp_awarded', 0);
  END IF;

  SELECT total_xp INTO v_old_xp
    FROM public.salesperson_xp
   WHERE salesperson_id = v_sale.salesperson_id;
  v_old_xp := COALESCE(v_old_xp, 0);
  v_new_xp := v_old_xp + v_xp;

  INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
  VALUES (
    v_sale.salesperson_id, v_xp, 'sale', p_sale_id::text,
    'Venda de R$ ' || to_char(v_sale.amount, 'FM999G999G990D00')
      || CASE WHEN v_sale.client_name IS NOT NULL
              THEN ' — ' || v_sale.client_name ELSE '' END
  );

  -- Nível pelos thresholds vivos do app_config (mesma regra do frontend:
  -- nível = quantidade de thresholds <= total_xp).
  SELECT value INTO v_thresholds
    FROM public.app_config WHERE key = 'xp.level_thresholds';
  v_thresholds := COALESCE(v_thresholds,
    '[0,100,250,500,850,1300,1900,2700,3700,5000,6500,8500,11000,14000,18000,23000,30000,40000,55000,75000]'::jsonb);

  SELECT count(*) INTO v_new_level
    FROM jsonb_array_elements_text(v_thresholds) AS t(v)
   WHERE v::numeric <= v_new_xp;
  v_new_level := GREATEST(v_new_level, 1);
  SELECT count(*) INTO v_prev_level
    FROM jsonb_array_elements_text(v_thresholds) AS t(v)
   WHERE v::numeric <= v_old_xp;
  v_prev_level := GREATEST(v_prev_level, 1);

  UPDATE public.salesperson_xp
     SET current_level = GREATEST(current_level, v_new_level),
         updated_at = now()
   WHERE salesperson_id = v_sale.salesperson_id;

  IF NOT v_full_result THEN
    RETURN jsonb_build_object('awarded', true);
  END IF;

  RETURN jsonb_build_object(
    'awarded', true,
    'xp_awarded', v_xp,
    'leveled_up', v_new_level > v_prev_level,
    'new_level', v_new_level,
    'previous_level', v_prev_level,
    'total_xp', v_new_xp
  );
END;
$function$
