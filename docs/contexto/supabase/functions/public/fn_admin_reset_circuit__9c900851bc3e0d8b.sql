CREATE OR REPLACE FUNCTION public.fn_admin_reset_circuit(_circuit_name text, _reason text DEFAULT 'manual_reset'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  IF _circuit_name IS NULL OR length(_circuit_name) = 0 THEN
    RAISE EXCEPTION 'circuit_name required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.circuit_breaker_events (
    circuit_name, event_type, previous_state, new_state, failure_count, details
  ) VALUES (
    _circuit_name,
    'closed',
    'OPEN',
    'CLOSED',
    0,
    jsonb_build_object('reason', _reason, 'actor', auth.uid())
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$
