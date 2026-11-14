CREATE OR REPLACE FUNCTION public.create_agent_run(_agent_type text, _goal text DEFAULT NULL::text, _target_entity_type text DEFAULT NULL::text, _target_entity_id uuid DEFAULT NULL::uuid, _requires_approval boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_id uuid;
  v_row jsonb;
  v_ok boolean;
BEGIN
  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No salesperson context';
  END IF;

  IF _target_entity_type IS NOT NULL AND _target_entity_id IS NOT NULL
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    IF _target_entity_type = 'deal' THEN
      SELECT to_jsonb(s) INTO v_row FROM public.sales s WHERE s.id = _target_entity_id;
    ELSIF _target_entity_type = 'client' THEN
      SELECT to_jsonb(c) INTO v_row FROM public.clients c WHERE c.id = _target_entity_id;
    ELSIF _target_entity_type = 'activity' THEN
      SELECT to_jsonb(a) INTO v_row FROM public.activities a WHERE a.id = _target_entity_id;
    ELSIF _target_entity_type = 'lead' AND to_regclass('public.leads') IS NOT NULL THEN
      EXECUTE 'SELECT to_jsonb(l) FROM public.leads l WHERE l.id = $1'
        INTO v_row USING _target_entity_id;
    END IF;

    IF v_row IS NULL THEN
      RAISE EXCEPTION 'Target entity not found';
    END IF;

    v_ok :=
      v_row->>'user_id' = auth.uid()::text
      OR ((v_row->>'salesperson_id') IS NOT NULL AND (v_row->>'salesperson_id')::uuid = v_sp)
      OR ((v_row->>'sdr_id') IS NOT NULL AND (v_row->>'sdr_id')::uuid = v_sp)
      OR ((v_row->>'closer_id') IS NOT NULL AND (v_row->>'closer_id')::uuid = v_sp);

    IF NOT COALESCE(v_ok, false)
       AND _target_entity_type = 'client'
       AND v_sp IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.client_portfolio p
        WHERE p.client_id = _target_entity_id
          AND p.salesperson_id = v_sp
      ) INTO v_ok;
    END IF;

    IF NOT COALESCE(v_ok, false) THEN
      RAISE EXCEPTION 'Target entity not owned by caller';
    END IF;
  END IF;

  INSERT INTO public.ai_agent_runs(salesperson_id, agent_type, goal, target_entity_type, target_entity_id, requires_approval, status)
  VALUES (COALESCE(v_sp, '00000000-0000-0000-0000-000000000000'::uuid), _agent_type, _goal, _target_entity_type, _target_entity_id, _requires_approval, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
