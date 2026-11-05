CREATE OR REPLACE FUNCTION public.create_agent_run(_agent_type text, _goal text DEFAULT NULL::text, _target_entity_type text DEFAULT NULL::text, _target_entity_id uuid DEFAULT NULL::uuid, _requires_approval boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_id uuid;
BEGIN
  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No salesperson context';
  END IF;
  INSERT INTO public.ai_agent_runs(salesperson_id, agent_type, goal, target_entity_type, target_entity_id, requires_approval, status)
  VALUES (COALESCE(v_sp, '00000000-0000-0000-0000-000000000000'::uuid), _agent_type, _goal, _target_entity_type, _target_entity_id, _requires_approval, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
