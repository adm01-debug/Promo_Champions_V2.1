CREATE OR REPLACE FUNCTION public.transition_sale_status(p_sale_id uuid, p_new_status text, p_pipeline_id uuid DEFAULT NULL::uuid, p_expected_version integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current text;
  v_version integer;
  v_owner   uuid;
  v_closer  uuid;
  v_caller  uuid;
BEGIN
  SELECT status, version, salesperson_id, closer_id INTO v_current, v_version, v_owner, v_closer
    FROM public.sales
    WHERE id = p_sale_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada: %', p_sale_id;
  END IF;

  -- SECURITY DEFINER ignora RLS: replica a regra das policies de UPDATE em
  -- sales (dono da venda, closer atribuído ou admin/manager). Chamadas via
  -- service_role ou pg_cron (auth.uid() IS NULL) seguem autorizadas.
  -- O chamador precisa ter salespeople.id próprio: sem ele, IS DISTINCT FROM
  -- com NULLs dos dois lados passaria sem checar nada (NULL não é distinto de
  -- NULL), autorizando qualquer usuário logado sem vínculo com a venda.
  v_caller := public.get_current_salesperson_id();
  IF auth.uid() IS NOT NULL
     AND NOT public.is_admin_or_manager(auth.uid())
     AND (v_caller IS NULL
          OR (v_owner IS DISTINCT FROM v_caller
              AND v_closer IS DISTINCT FROM v_caller)) THEN
    RAISE EXCEPTION 'not_authorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_expected_version IS NOT NULL
     AND v_version IS DISTINCT FROM p_expected_version THEN
    RAISE EXCEPTION 'optimistic_lock_conflict: versão esperada %, versão atual %',
      p_expected_version, v_version;
  END IF;

  IF v_current IS DISTINCT FROM p_new_status
     AND NOT public.is_valid_status_transition('sales', v_current, p_new_status) THEN
    RAISE EXCEPTION 'Transição de status inválida em sales: % → %',
      v_current, p_new_status
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.sales
    SET status      = p_new_status,
        pipeline_id = COALESCE(p_pipeline_id, pipeline_id),
        updated_at  = now()
    WHERE id = p_sale_id;
END;
$function$
